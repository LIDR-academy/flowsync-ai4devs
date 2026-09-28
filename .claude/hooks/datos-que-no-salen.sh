#!/usr/bin/env bash
# PreToolUse (Bash): antes de un `git commit`, revisa las líneas que van a
# entrar y bloquea tres cosas que no deben salir de esta máquina:
#   1. una clave con forma reconocible,
#   2. un correo cuyo dominio no sea de ejemplo,
#   3. un fichero `.env`.
# Si encuentra algo, sale con 2 (la herramienta no ejecuta el comando), dice
# por stderr qué regla saltó y en qué archivo, y deja una línea en el
# registro. Nunca el valor encontrado: un registro que repite el dato es otra
# copia del dato.
set -uo pipefail

entrada=$(cat)

if ! command -v jq >/dev/null 2>&1; then
  # Sin jq no se puede leer el comando. Si huele a commit, se bloquea: un
  # control que falla en silencio es peor que no tenerlo.
  case "$entrada" in
    *'git commit'*)
      echo "datos-que-no-salen: falta jq y no se puede revisar el commit. Instala jq y vuelve a intentarlo." >&2
      exit 2
      ;;
  esac
  exit 0
fi

cmd=$(printf '%s' "$entrada" | jq -r '.tool_input.command // empty')
case "$cmd" in
  *'git commit'*) ;;
  *) exit 0 ;;
esac

raiz=$(git -C "${CLAUDE_PROJECT_DIR:-.}" rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$raiz" || exit 0

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
rutas=$tmp/rutas         # una ruta por línea añadida
lineas=$tmp/lineas       # la línea añadida, en la misma posición
ficheros=$tmp/ficheros   # los ficheros que entran
hallazgos=$tmp/hallazgos # regla<TAB>fichero
: >"$rutas"
: >"$lineas"
: >"$ficheros"
: >"$hallazgos"

# Con `git add` en el mismo comando lo que va a entrar todavía no está en el
# índice; con `git commit -a` tampoco. En esos casos se mira además lo que
# está sin preparar y, con `git add`, los archivos nuevos sin seguimiento.
con_add=0
con_all=0
[[ $cmd == *'git add'* ]] && con_add=1
re_all='git[[:space:]]+commit[^;&|]*[[:space:]](-[A-Za-z]*a[A-Za-z]*|--all)([[:space:]]|$)'
[[ $cmd =~ $re_all ]] && con_all=1

git_q() { git -c core.quotePath=false "$@"; }

anadidas_de_diff() {
  awk -v P="$rutas" -v C="$lineas" '
    /^diff --git / { cab = 1; next }
    cab && /^\+\+\+ / { f = substr($0, 5); next }
    /^@@/ { cab = 0; next }
    !cab && /^\+/ { print f >> P; print substr($0, 2) >> C }
  '
}

git_q diff --cached --no-color --no-ext-diff --no-prefix -U0 | anadidas_de_diff
git_q diff --cached --name-only --diff-filter=ACMR -z | tr '\0' '\n' >>"$ficheros"

if [ "$con_add" = 1 ] || [ "$con_all" = 1 ]; then
  git_q diff --no-color --no-ext-diff --no-prefix -U0 | anadidas_de_diff
  git_q diff --name-only --diff-filter=ACMR -z | tr '\0' '\n' >>"$ficheros"
fi

if [ "$con_add" = 1 ]; then
  git ls-files --others --exclude-standard -z | while IFS= read -r -d '' f; do
    printf '%s\n' "$f" >>"$ficheros"
    grep -Iq . "$f" 2>/dev/null || continue # binario o vacío
    awk -v f="$f" -v P="$rutas" -v C="$lineas" '{ print f >> P; print >> C }' "$f"
  done
  # Un `.env` ignorado solo entra forzado (`git add -f`): no sale en la lista
  # de sin seguimiento, así que se busca también entre las palabras del comando.
  set -f
  for w in $cmd; do
    w=${w//[\"\']/}
    [ "${w##*/}" = .env ] && printf '%s\n' "$w" >>"$ficheros"
  done
  set +f
fi

# Recibe números de línea por stdin y apunta regla<TAB>fichero de cada uno.
apunta() {
  awk -v R="$1" 'NR == FNR { n[$1]; next } FNR in n { print R "\t" $0 }' - "$rutas" >>"$hallazgos"
}

# Regla 1: una clave con forma reconocible.
re_clave='AKIA[0-9A-Z]{16}'
re_clave+='|sk-ant-[A-Za-z0-9_-]{20,}'
re_clave+='|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}'
re_clave+='|AIza[0-9A-Za-z_-]{35}'
re_clave+='|xox[bpa]-[A-Za-z0-9-]{10,}'
re_clave+='|-----BEGIN[A-Z ]*PRIVATE KEY-----'
re_clave+="|^[[:space:]]*(export[[:space:]]+)?APP_KEY=[\"']?[^\"'[:space:]#]"
grep -anE -- "$re_clave" "$lineas" | cut -d: -f1 | apunta clave

# Regla 2: un correo cuyo dominio no sea example.com/.org/.net ni github.com
# (ni subdominios suyos, como users.noreply.github.com).
re_correo='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
grep -anoE -- "$re_correo" "$lineas" |
  awk -F: '{
    d = tolower(substr($2, index($2, "@") + 1))
    if (d !~ /(^|\.)example\.(com|org|net)$/ && d !~ /(^|\.)github\.com$/) print $1
  }' | apunta correo

# Regla 3: un fichero llamado exactamente `.env`, en cualquier carpeta.
sort -u "$ficheros" | while IFS= read -r f; do
  [ "${f##*/}" = .env ] && printf '.env\t%s\n' "$f"
done >>"$hallazgos"

[ -s "$hallazgos" ] || exit 0

sort -u "$hallazgos" -o "$hallazgos"

{
  echo "datos-que-no-salen: commit bloqueado."
  while IFS=$'\t' read -r regla f; do
    echo "  - regla '$regla' en $f"
  done <"$hallazgos"
  echo "Sustituye el dato por uno inventado (un correo de example.com, una clave falsa sin forma real; un .env no se commitea) y vuelve a intentarlo. No desactives ni te saltes este hook."
} >&2

registro=docs/seguridad/registro-de-bloqueos.md
if [ ! -f "$registro" ]; then
  mkdir -p "$(dirname "$registro")"
  echo "# Registro de bloqueos del hook datos-que-no-salen" >"$registro"
fi
ahora=$(date -u +%Y-%m-%dT%H:%M:%SZ)
while IFS=$'\t' read -r regla f; do
  echo "- $ahora BLOQUEADO $regla $f" >>"$registro"
done <"$hallazgos"

exit 2
