#!/usr/bin/env bash
# datos-que-no-salen — hook PreToolUse (matcher Bash) de Claude Code.
#
# Antes de un `git commit`, mira las líneas añadidas de lo que va a entrar y
# bloquea (exit 2) si encuentra:
#   1. una clave con forma reconocible,
#   2. un correo cuyo dominio no sea example.com/.org/.net ni github.com,
#   3. el fichero `.env` (nombre exacto; `.env.example` sí puede entrar).
# Cada bloqueo deja una línea en docs/seguridad/registro-de-bloqueos.md con la
# fecha, la regla y el archivo — nunca el valor encontrado.
#
# Los patrones están escritos para no coincidir consigo mismos (p. ej. `sk[-]ant`),
# así este fichero puede commitearse sin que el hook lo bloquee.
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

cwd=$(printf '%s' "$input" | jq -r '.cwd // empty')
cd "${cwd:-${CLAUDE_PROJECT_DIR:-.}}" 2>/dev/null || exit 0
root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

con_add=0
case "$cmd" in *"git add"*) con_add=1 ;; esac

T=$'\t'

# Líneas añadidas como "archivo<TAB>contenido", a partir de un diff unificado.
lineas_anadidas() {
  awk '/^\+\+\+ /{ f = substr($0, 7); next } /^\+/{ print f "\t" substr($0, 2) }'
}

anadidas=$(
  git diff --cached --no-color --no-ext-diff -U0 2>/dev/null | lineas_anadidas
  if [ "$con_add" -eq 1 ]; then
    git diff --no-color --no-ext-diff -U0 2>/dev/null | lineas_anadidas
    git ls-files --others --exclude-standard -z 2>/dev/null |
      while IFS= read -r -d '' f; do
        git diff --no-index --no-color -U0 /dev/null "$f" 2>/dev/null | lineas_anadidas
      done
  fi
)

archivos=$(
  git diff --cached --name-only 2>/dev/null
  if [ "$con_add" -eq 1 ]; then
    git diff --name-only 2>/dev/null
    git ls-files --others --exclude-standard 2>/dev/null
  fi
)

hallazgos=()

# Regla 1: claves con forma reconocible.
re_clave="AKIA[0-9A-Z]{16}|sk[-]ant[-]|gh[p]_|github[_]pat_|AIza[0-9A-Za-z_-]{35}|xox[bpa][-]|-----BEGIN [A-Z ]*PRIVATE KEY-----"
re_app_key="${T}[[:space:]]*(export[[:space:]]+)?APP_KEY=[^[:space:]]"
while IFS= read -r f; do
  [ -n "$f" ] && hallazgos+=("1 (clave reconocible)|$f")
done < <(printf '%s\n' "$anadidas" | grep -E -e "$re_clave" -e "$re_app_key" | cut -f1 | sort -u)

# Regla 2: correos fuera de los dominios reservados para ejemplos.
re_correo='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
while IFS="$T" read -r f contenido; do
  while IFS= read -r correo; do
    dominio=$(printf '%s' "${correo##*@}" | tr '[:upper:]' '[:lower:]')
    case "$dominio" in
      example.com | example.org | example.net | github.com) ;;
      *.example.com | *.example.org | *.example.net | *.github.com) ;;
      *) hallazgos+=("2 (correo de una persona)|$f"); break ;;
    esac
  done < <(printf '%s\n' "$contenido" | grep -oE "$re_correo")
done < <(printf '%s\n' "$anadidas" | grep -E "$re_correo")

# Regla 3: el fichero .env (nombre exacto, en cualquier carpeta).
while IFS= read -r f; do
  [ "$(basename -- "$f")" = ".env" ] && hallazgos+=("3 (fichero .env)|$f")
done < <(printf '%s\n' "$archivos" | grep -E '(^|/)\.env$')
# `git add -f .env` en el mismo comando: está ignorado y aún no aparece arriba.
if [ "$con_add" -eq 1 ] && printf '%s' "$cmd" | grep -qE '(^|[[:space:]/"'"'"'])\.env([[:space:]"'"'"';&|]|$)'; then
  hallazgos+=("3 (fichero .env)|.env (en el git add del comando)")
fi

[ "${#hallazgos[@]}" -eq 0 ] && exit 0

registro="docs/seguridad/registro-de-bloqueos.md"
mkdir -p "$(dirname "$registro")"
[ -f "$registro" ] || echo "# Registro de bloqueos del hook datos-que-no-salen" > "$registro"

ahora=$(date -u +%Y-%m-%dT%H:%M:%SZ)
{
  echo "datos-que-no-salen: commit BLOQUEADO."
  printf '%s\n' "${hallazgos[@]}" | sort -u | while IFS='|' read -r regla f; do
    echo "- Regla $regla en: $f"
    echo "- $ahora BLOQUEADO regla $regla archivo \`$f\`" >> "$registro"
  done
  echo "Sustituye el dato por uno inventado (correos @example.com, claves de mentira, sin .env) y vuelve a intentarlo."
  echo "No desactives ni te saltes este hook. El bloqueo queda anotado en $registro."
} >&2
exit 2
