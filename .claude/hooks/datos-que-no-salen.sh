#!/usr/bin/env bash
# datos-que-no-salen — hook PreToolUse (matcher Bash) de Claude Code.
#
# Antes de un `git commit`, mira las líneas que van a entrar y bloquea (sale con
# código 2) si encuentra una de estas tres cosas, y solo estas tres:
#   1. una clave con forma reconocible;
#   2. una dirección de correo cuyo dominio no sea de ejemplo;
#   3. un fichero `.env`.
#
# Cada bloqueo deja una línea en docs/seguridad/registro-de-bloqueos.md con la
# regla y el archivo, NUNCA con el valor: un registro que repite el dato es otra
# copia del dato.
#
# Los patrones están escritos para que este mismo fichero no case con ellos
# (una clase de un solo carácter en medio del prefijo, sin un `@` precedido de
# texto): si no, el hook bloquearía su propio commit.

set -uo pipefail

command -v jq >/dev/null 2>&1 || {
  echo 'datos-que-no-salen: falta jq, así que no se ha comprobado nada.' >&2
  exit 1
}

cmd=$(jq -r '.tool_input.command // empty')
case "$cmd" in
  *'git commit'*) ;;
  *) exit 0 ;;
esac

# Si el mismo comando prepara cambios, todavía no están en el índice: hay que
# mirar también lo no preparado y lo que no tiene seguimiento.
con_add=0
case "$cmd" in *'git add'*) con_add=1 ;; esac

root=$(git -C "${CLAUDE_PROJECT_DIR:-.}" rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

registro='docs/seguridad/registro-de-bloqueos.md'

# Regla 1: AWS, Anthropic, GitHub (dos formas), Google, Slack, clave privada PEM
# y una línea APP_KEY= con valor.
clave='AKIA[0-9A-Z]{16}|sk[-]ant[-]|gh[p]_|github[_]pat_|AIza[0-9A-Za-z_-]{35}|xox[bpa]-'
clave+='|-----BEGIN[ A-Z]*PRIVATE KEY-----'
clave+="|^[[:space:]]*(export[[:space:]]+)?APP_KEY=[\"']?[^[:space:]#\"']"

# Regla 2: cualquier dirección; el dominio se filtra después.
correo='[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}'

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# Líneas añadidas de un diff, como «archivo<TAB>línea».
lineas_de_diff() {
  git -c core.quotePath=false diff --no-color --no-ext-diff --unified=0 "$@" |
    awk '
      /^diff --git / { cabecera = 1; archivo = ""; next }
      cabecera && /^\+\+\+ / { archivo = substr($0, 5); sub(/^b\//, "", archivo); next }
      /^@@/ { cabecera = 0; next }
      !cabecera && /^\+/ && archivo != "" { print archivo "\t" substr($0, 2) }
    '
}

# Archivos nuevos sin seguimiento (solo los de texto), todas sus líneas.
lineas_sin_seguimiento() {
  git ls-files --others --exclude-standard -z |
    while IFS= read -r -d '' f; do
      [ -f "$f" ] && grep -Iq '' "$f" 2>/dev/null || continue
      awk -v f="$f" '{ print f "\t" $0 }' "$f"
    done
}

# Nombres de lo que entra (sin lo que se borra), uno por línea.
archivos_que_entran() {
  git -c core.quotePath=false diff --cached --name-only --diff-filter=ACMR
  if [ "$con_add" = 1 ]; then
    git -c core.quotePath=false diff --name-only --diff-filter=ACMR
    git -c core.quotePath=false ls-files --others --exclude-standard
  fi
}

{
  lineas_de_diff --cached
  if [ "$con_add" = 1 ]; then
    lineas_de_diff
    lineas_sin_seguimiento
  fi
} >"$tmp/todo"

# Dos ficheros paralelos: el número de línea une cada línea con su archivo, y
# así los patrones se aplican a la línea sola (el ^ de APP_KEY lo necesita).
cut -f1 "$tmp/todo" >"$tmp/archivos"
cut -f2- "$tmp/todo" >"$tmp/lineas"

# Archivo de cada número de línea que llega por la entrada estándar.
archivo_de() {
  awk 'NR == FNR { n[$1] = 1; next } FNR in n' - "$tmp/archivos"
}

# Antepone la regla a cada archivo, separada por un tabulador.
etiqueta() {
  awk -v r="$1" '{ print r "\t" $0 }'
}

{
  grep -nE -- "$clave" "$tmp/lineas" | cut -d: -f1 | archivo_de |
    etiqueta 'regla 1 (clave con forma reconocible)'

  grep -noE -- "$correo" "$tmp/lineas" |
    awk -F: '{
      d = tolower($2); sub(/^.*@/, "", d)
      if (d != "example.com" && d != "example.org" && d != "example.net" && d != "github.com") print $1
    }' | archivo_de |
    etiqueta 'regla 2 (correo de una persona)'

  archivos_que_entran | awk -F/ '$NF == ".env"' |
    etiqueta 'regla 3 (fichero .env)'
} | sort -u >"$tmp/hallazgos"

[ -s "$tmp/hallazgos" ] || exit 0

{
  echo 'datos-que-no-salen: commit bloqueado.'
  while IFS=$'\t' read -r regla archivo; do
    echo "  - ${regla} en ${archivo}"
  done <"$tmp/hallazgos"
  echo 'Sustituye el dato por uno inventado (un correo de example.com, una clave de mentira;'
  echo 'un .env se saca del commit y sus valores van inventados en .env.example) y vuelve a'
  echo 'intentarlo. No desactives ni rodees este hook.'
} >&2

mkdir -p "$(dirname "$registro")"
[ -f "$registro" ] || echo '# Registro de bloqueos del hook datos-que-no-salen' >"$registro"
ahora=$(date -u +%Y-%m-%dT%H:%M:%SZ)
while IFS=$'\t' read -r regla archivo; do
  echo "- ${ahora} BLOQUEADO — ${regla} — \`${archivo}\`" >>"$registro"
done <"$tmp/hallazgos"

exit 2
