#!/usr/bin/env bash
# PreToolUse (Bash): antes de un `git commit`, revisa las líneas añadidas que van a
# entrar y bloquea (exit 2) si llevan una clave reconocible, un correo real o un .env.
# Nunca escribe el valor encontrado: ni por stderr ni en el registro.
set -uo pipefail

input=$(cat)
# Sin jq no se puede leer el comando: se usa el JSON crudo para no dejar pasar un commit.
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null) || command=$input

grep -Eq 'git[[:space:]]+commit' <<<"$command" || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

con_add=0
grep -Eq 'git[[:space:]]+add' <<<"$command" && con_add=1

# Líneas añadidas como "archivo<TAB>contenido".
anadidas() {
  awk '
    /^\+\+\+ / { f = substr($0, 5); sub(/^b\//, "", f); next }
    /^\+/      { print f "\t" substr($0, 2) }
  '
}

lineas=$(
  {
    git diff --cached -U0 --no-color --no-ext-diff
    if [ "$con_add" = 1 ]; then
      git diff -U0 --no-color --no-ext-diff
      git ls-files --others --exclude-standard -z | while IFS= read -r -d '' f; do
        git diff --no-index -U0 --no-color -- /dev/null "$f"
      done
    fi
  } 2>/dev/null | anadidas
)

ficheros=$(
  {
    git diff --cached --name-only --diff-filter=ACMR
    if [ "$con_add" = 1 ]; then
      git diff --name-only --diff-filter=ACMR
      git ls-files --others --exclude-standard
    fi
  } 2>/dev/null | sort -u
)

hallazgos=() # "regla<TAB>archivo"

claves='AKIA[0-9A-Z]{16}|sk-ant-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{35}|xox[bpa]-[A-Za-z0-9-]{10,}|-----BEGIN ([A-Z0-9]+ )*PRIVATE KEY-----'
app_key='^[[:space:]]*(export[[:space:]]+)?APP_KEY=[^[:space:]#]'
while IFS=$'\t' read -r f contenido; do
  [ -n "$f" ] || continue
  if grep -Eq -- "$claves" <<<"$contenido" || grep -Eq -- "$app_key" <<<"$contenido"; then
    hallazgos+=("clave o token con forma reconocible"$'\t'"$f")
  fi
  while IFS= read -r correo; do
    dominio=${correo##*@}
    dominio=${dominio,,}
    case "$dominio" in
      example.com | *.example.com | example.org | *.example.org | example.net | *.example.net | github.com | *.github.com) ;;
      *) hallazgos+=("correo con dominio real"$'\t'"$f") ;;
    esac
  done < <(grep -oE '[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}' <<<"$contenido")
done <<<"$lineas"

while IFS= read -r f; do
  [ -n "$f" ] || continue
  [ "$(basename -- "$f")" = ".env" ] && hallazgos+=("fichero .env"$'\t'"$f")
done <<<"$ficheros"

[ "${#hallazgos[@]}" -eq 0 ] && exit 0

registro=docs/seguridad/registro-de-bloqueos.md
mkdir -p "$(dirname "$registro")"
[ -f "$registro" ] || echo '# Registro de bloqueos del hook datos-que-no-salen (fecha UTC · resultado · regla · archivo)' >"$registro"

ahora=$(date -u +%Y-%m-%dT%H:%M:%SZ)
{
  echo "Commit BLOQUEADO por .claude/hooks/datos-que-no-salen.sh:"
  printf '%s\n' "${hallazgos[@]}" | sort -u | while IFS=$'\t' read -r regla f; do
    echo "- ${ahora} · BLOQUEADO · ${regla} · \`${f}\`" >>"$registro"
    case "$regla" in
      correo*) arreglo='sustitúyelo por uno inventado de example.com (p. ej. persona@example.com)' ;;
      clave*) arreglo='sustitúyela por un valor inventado que no tenga esa forma (p. ej. CLAVE_DE_EJEMPLO)' ;;
      *) arreglo='sácalo del commit (git rm --cached) y deja los valores inventados en un .env.example' ;;
    esac
    echo "  · ${regla} en ${f}: ${arreglo}."
  done
  echo "No desactives ni te saltes el hook: sustituye el dato y vuelve a intentarlo. Commitea también ${registro}."
} >&2
exit 2
