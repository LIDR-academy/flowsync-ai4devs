#!/usr/bin/env bash
# Hook PreToolUse (matcher Bash): antes de un `git commit`, revisa las líneas
# añadidas de lo que va a entrar y bloquea (exit 2) si encuentra:
#   1. una clave o secreto con forma reconocible,
#   2. un correo cuyo dominio no sea example.com/.org/.net ni github.com,
#   3. un fichero llamado exactamente .env.
# Nunca imprime ni registra el valor encontrado: solo la regla y el archivo.
set -uo pipefail

input=$(cat)
cmd=$(jq -r '.tool_input.command // empty' <<<"$input")

case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

dir=$(jq -r '.cwd // empty' <<<"$input")
dir=${dir:-${CLAUDE_PROJECT_DIR:-$PWD}}
root=$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null) || exit 0

g() { git -C "$root" -c core.quotePath=false "$@"; }

# Si el mismo comando hace `git add`, lo que aún no está en el índice también entra.
con_add=0
case "$cmd" in *"git add"*) con_add=1 ;; esac

work=$(mktemp -d) || { echo "datos-que-no-salen: no se pudo crear un directorio temporal; commit bloqueado." >&2; exit 2; }
trap 'rm -rf "$work"' EXIT

# Nombres de lo que entra (sin borrados), separados por NUL.
{
  g diff --cached --name-only -z --diff-filter=d
  if (( con_add )); then
    g diff --name-only -z --diff-filter=d
    g ls-files --others --exclude-standard -z
  fi
} >"$work/nombres"

# Diff unificado de lo que entra; los no trackeados se presentan como ficheros nuevos.
{
  g diff --cached -U0 --no-color --no-ext-diff --diff-filter=d
  if (( con_add )); then
    g diff -U0 --no-color --no-ext-diff --diff-filter=d
    while IFS= read -r -d '' f; do
      [[ -f "$root/$f" ]] && grep -Iq . "$root/$f" 2>/dev/null || continue
      printf 'diff --git a/%s b/%s\n+++ b/%s\n@@ nuevo @@\n' "$f" "$f" "$f"
      sed 's/^/+/' "$root/$f"
    done < <(g ls-files --others --exclude-standard -z)
  fi
} | awk -v out="$work" '
  /^diff --git / { hunk = 0; next }
  !hunk && /^\+\+\+ / {
    path = substr($0, 5); sub(/^b\//, "", path)
    if (!(path in id)) { id[path] = ++n; print n "\t" path > (out "/indice") }
    f = out "/" id[path]; next
  }
  /^@@/ { hunk = 1; next }
  hunk && /^\+/ { print substr($0, 2) > f }
'

clave_re='AKIA[0-9A-Z]{16}|sk-ant-[A-Za-z0-9]|ghp_[A-Za-z0-9]|github_pat_[A-Za-z0-9]|AIza[0-9A-Za-z_-]{35}|xox[bpa]-[A-Za-z0-9]|-----BEGIN ([A-Z0-9]+ )*PRIVATE KEY-----'
appkey_re="^[[:space:]]*(export[[:space:]]+)?APP_KEY[[:space:]]*=[[:space:]]*[\"']?[^[:space:]\"'#]"
correo_re='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
dominios_ok='example\.(com|org|net)|github\.com'

infracciones=()

if [[ -f "$work/indice" ]]; then
  while IFS=$'\t' read -r n path; do
    f="$work/$n"
    [[ -f "$f" ]] || continue
    if grep -Eq -e "$clave_re" -e "$appkey_re" "$f"; then
      infracciones+=("regla 1 (clave o secreto reconocible)"$'\t'"$path")
    fi
    if grep -Eoh "$correo_re" "$f" | sed 's/^.*@//' | tr '[:upper:]' '[:lower:]' \
        | grep -vxE "$dominios_ok" >/dev/null; then
      infracciones+=("regla 2 (correo fuera de los dominios permitidos)"$'\t'"$path")
    fi
  done <"$work/indice"
fi

declare -A visto=()
while IFS= read -r -d '' path; do
  [[ "${path##*/}" == ".env" && -z "${visto[$path]:-}" ]] || continue
  visto[$path]=1
  infracciones+=("regla 3 (fichero .env)"$'\t'"$path")
done <"$work/nombres"

(( ${#infracciones[@]} )) || exit 0

registro="$root/docs/seguridad/registro-de-bloqueos.md"
if [[ ! -f "$registro" ]]; then
  mkdir -p "${registro%/*}"
  echo "# Registro de bloqueos del hook datos-que-no-salen" >"$registro"
fi

ahora=$(date -u +%Y-%m-%dT%H:%M:%SZ)
{
  echo "datos-que-no-salen: commit bloqueado."
  for i in "${infracciones[@]}"; do
    regla=${i%%$'\t'*}
    path=${i#*$'\t'}
    echo "  - ${regla^} en: $path"
    echo "- $ahora BLOQUEADO $regla $path" >>"$registro"
  done
  echo "Sustituye el dato por un valor inventado (p. ej. un correo @example.com) y vuelve a intentarlo."
  echo "No desactives ni te saltes este hook. Bloqueo anotado en docs/seguridad/registro-de-bloqueos.md."
} >&2
exit 2
