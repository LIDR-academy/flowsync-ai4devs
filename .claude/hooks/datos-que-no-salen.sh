#!/usr/bin/env bash
# PreToolUse (Bash): impide que un `git commit` meta claves, correos reales o un
# `.env`. Solo mira las líneas añadidas. Nunca escribe el valor encontrado.
set -uo pipefail

command="$(jq -r '.tool_input.command // empty')"
case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$repo_root" || exit 0

log_file="docs/seguridad/registro-de-bloqueos.md"
tab=$'\t'

git_q() { git -c core.quotePath=false "$@"; }

# Convierte un diff en líneas "archivo<TAB>contenido añadido".
added_from_diff() {
  awk '
    /^\+\+\+ / { f = $0; sub(/^\+\+\+ (b\/)?/, "", f); next }
    /^\+/      { print f "\t" substr($0, 2) }
  '
}

# Archivos que entran en el commit.
files="$(git_q diff --cached --name-only --diff-filter=ACMR)"
# Líneas añadidas de lo que entra en el commit.
added="$(git_q diff --cached --no-color --no-ext-diff --unified=0 --diff-filter=ACMR | added_from_diff)"

if [[ "$command" == *"git add"* ]]; then
  untracked="$(git_q ls-files --others --exclude-standard)"
  files="$files"$'\n'"$(git_q diff --name-only --diff-filter=ACMR)"$'\n'"$untracked"
  added="$added"$'\n'"$(git_q diff --no-color --no-ext-diff --unified=0 --diff-filter=ACMR | added_from_diff)"
  while IFS= read -r f; do
    [ -f "$f" ] && grep -Iq . "$f" 2>/dev/null || continue
    added="$added"$'\n'"$(awk -v f="$f" '{ print f "\t" $0 }' "$f")"
  done <<< "$untracked"
fi

block() {
  local rule="$1" desc="$2" file="$3"
  echo "BLOQUEADO: regla $rule ($desc) en $file. Sustituye el dato por uno inventado y vuelve a intentarlo." >&2
  if [ ! -f "$log_file" ]; then
    mkdir -p "$(dirname "$log_file")"
    echo "# Registro de bloqueos" > "$log_file"
  fi
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) BLOQUEADO regla=$rule archivo=$file" >> "$log_file"
  exit 2
}

# Regla 3: un fichero llamado exactamente `.env`.
while IFS= read -r f; do
  [ "${f##*/}" = ".env" ] && block 3 "fichero .env" "$f"
done <<< "$files"

# Regla 1: claves con forma reconocible (con caracteres reales detrás del prefijo).
key_re='AKIA[0-9A-Z]{16}|sk-ant-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}|AIza[0-9A-Za-z_-]{35}|xox[bpa]-[A-Za-z0-9-]{10,}|-----BEGIN ([A-Z]+ )*PRIVATE KEY-----'
hit="$(grep -E -m1 "^[^$tab]*$tab(.*($key_re)|APP_KEY=[^[:space:]])" <<< "$added")"
[ -n "$hit" ] && block 1 "clave secreta" "${hit%%"$tab"*}"

# Regla 2: correos cuyo dominio no es de ejemplo.
email_re='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
while IFS="$tab" read -r file line; do
  while IFS= read -r email; do
    domain="$(printf '%s' "${email#*@}" | tr '[:upper:]' '[:lower:]')"
    case "$domain" in
      example.com | example.org | example.net | github.com) ;;
      *) block 2 "correo electrónico" "$file" ;;
    esac
  done < <(printf '%s\n' "$line" | grep -oE "$email_re")
done < <(grep -E "^[^$tab]*$tab.*$email_re" <<< "$added")

exit 0
