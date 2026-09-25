#!/usr/bin/env bash
# PreToolUse (Bash): antes de un `git commit`, bloquea (exit 2) si lo que va a
# entrar en el repositorio trae una clave, un correo que no sea de ejemplo o un
# fichero `.env`. Cada bloqueo deja una línea en el registro, sin el valor.
set -uo pipefail

cmd=$(jq -r '.tool_input.command // empty')
case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-}"
[ -n "$root" ] || root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

registro="docs/seguridad/registro-de-bloqueos.md"
TAB=$'\t'

con_add=0
case "$cmd" in *"git add"*) con_add=1 ;; esac

# Líneas añadidas de un diff, como "archivo<TAB>línea".
lineas_anadidas() {
  awk '
    /^diff --git / { cab = 1; next }
    cab && /^\+\+\+ / { f = substr($0, 7); next }
    /^@@/ { cab = 0; next }
    !cab && /^\+/ { print f "\t" substr($0, 2) }
  '
}

contenido=$(git diff --cached --no-color --no-ext-diff -U0 | lineas_anadidas)
nombres=$(git diff --cached --name-only --diff-filter=ACMR)

if [ "$con_add" -eq 1 ]; then
  contenido+=$'\n'$(git diff --no-color --no-ext-diff -U0 | lineas_anadidas)
  nombres+=$'\n'$(git diff --name-only --diff-filter=ACMR)
  while IFS= read -r -d '' f; do
    nombres+=$'\n'"$f"
    [ -f "$f" ] && grep -Iq . "$f" 2>/dev/null || continue
    contenido+=$'\n'$(awk -v f="$f" '{ print f "\t" $0 }' "$f")
  done < <(git ls-files --others --exclude-standard -z)
fi

hallazgos=()

# Regla 1: claves con forma reconocible.
re_clave='AKIA[0-9A-Z]{16}|sk-ant-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{35}|xox[bpa]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
while IFS= read -r f; do
  [ -n "$f" ] && hallazgos+=("clave:$f")
done < <(printf '%s\n' "$contenido" \
  | grep -E -e "${TAB}.*(${re_clave})" -e "${TAB}[[:space:]]*(export[[:space:]]+)?APP_KEY=[^[:space:]]" \
  | cut -f1 | sort -u)

# Regla 2: correos cuyo dominio no es de ejemplo.
re_correo='[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}'
re_permitido='^(.+\.)?(example\.(com|org|net)|github\.com)$'
visto=$'\n'
while IFS="$TAB" read -r f linea; do
  while IFS= read -r correo; do
    dominio=$(printf '%s' "${correo#*@}" | tr '[:upper:]' '[:lower:]')
    if ! [[ "$dominio" =~ $re_permitido ]] && [[ "$visto" != *$'\n'"$f"$'\n'* ]]; then
      visto+="$f"$'\n'
      hallazgos+=("correo:$f")
    fi
  done < <(printf '%s\n' "$linea" | grep -oE "$re_correo")
done < <(printf '%s\n' "$contenido" | grep -E "${TAB}.*${re_correo}")

# Regla 3: un fichero llamado exactamente `.env`.
while IFS= read -r f; do
  [ -n "$f" ] && [ "$(basename "$f")" = ".env" ] && hallazgos+=("env:$f")
done < <(printf '%s\n' "$nombres" | sort -u)
if [ "$con_add" -eq 1 ] && [[ "$cmd" =~ git\ add[^\;\&\|]*(^|[[:space:]/])\.env([[:space:]]|$) ]]; then
  hallazgos+=("env:.env (en el propio git add)")
fi

# bash 3.2 (el de macOS) con `set -u` no deja expandir un array vacío.
[ -n "${hallazgos[*]:-}" ] || exit 0

{
  echo "Commit bloqueado por .claude/hooks/datos-que-no-salen.sh:"
  for h in "${hallazgos[@]}"; do
    case "${h%%:*}" in
      clave) regla="clave o token con forma reconocible" ;;
      correo) regla="correo con dominio que no es de ejemplo" ;;
      env) regla="fichero .env" ;;
    esac
    echo "  - regla: $regla — archivo: ${h#*:}"
  done
  echo "Sustituye el dato por uno inventado (correos en example.com, claves de mentira; un .env no se versiona) y vuelve a intentarlo. No desactives ni te saltes este hook."
} >&2

mkdir -p "$(dirname "$registro")"
[ -f "$registro" ] || echo "# Registro de bloqueos de datos-que-no-salen (fecha UTC · resultado · regla:archivo; nunca el valor)" > "$registro"
echo "- $(date -u +%Y-%m-%dT%H:%M:%SZ) · BLOQUEADO · $(IFS=','; echo "${hallazgos[*]}" | sed 's/,/, /g')" >> "$registro"

exit 2
