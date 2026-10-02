#!/usr/bin/env bash
# Hook PreToolUse (matcher Bash) "datos-que-no-salen".
#
# Antes de un `git commit`, mira las líneas añadidas de lo que va a entrar y lo
# bloquea (exit 2) si encuentra:
#   1. una clave con forma reconocible,
#   2. un correo cuyo dominio no sea example.com/.org/.net ni github.com,
#   3. un fichero llamado exactamente `.env`.
# Cada bloqueo deja una línea en docs/seguridad/registro-de-bloqueos.md con la
# regla y el archivo, nunca con el valor encontrado.
#
# Los patrones de la regla 1 están escritos para que el propio script no case
# consigo mismo (p. ej. `sk-an[t]-`), así puede commitearse sin bloquearse.

set -uo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "datos-que-no-salen: falta jq; el hook no puede leer el comando y NO ha revisado nada." >&2
  exit 1
fi

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
case "$cmd" in
  *"git add"*) con_add=1 ;;
esac

TAB=$'\t'

# Convierte un diff en líneas "archivo<TAB>línea añadida".
added_from_diff() {
  awk -v OFS='\t' '
    /^diff --git / { header = 1; file = ""; next }
    header && /^\+\+\+ / {
      file = (substr($0, 5) == "/dev/null") ? "" : substr($0, 7)
      next
    }
    /^@@/ { header = 0; next }
    !header && /^\+/ && file != "" { print file, substr($0, 2) }
  '
}

# Todo lo que entra: "archivo<TAB>línea" por cada línea añadida.
entrantes() {
  git diff --cached -U0 --no-color --no-ext-diff | added_from_diff
  if [ "$con_add" -eq 1 ]; then
    git diff -U0 --no-color --no-ext-diff | added_from_diff
    git ls-files --others --exclude-standard -z |
      while IFS= read -r -d '' f; do
        [ -f "$f" ] && grep -Iq . "$f" 2>/dev/null || continue
        awk -v f="$f" -v OFS='\t' '{ print f, $0 }' "$f"
      done
  fi
}

# Nombres de los archivos que entran (sin contar los borrados).
nombres() {
  git diff --cached --name-only --diff-filter=d
  if [ "$con_add" -eq 1 ]; then
    git diff --name-only --diff-filter=d
    git ls-files --others --exclude-standard
  fi
}

lineas=$(entrantes)
hallazgos=""

anota() { hallazgos+="$1${TAB}$2"$'\n'; }

# Regla 1: clave con forma reconocible.
clave='AKI[A][0-9A-Z]{16}|sk-an[t]-|gh[p]_|github_pa[t]_|AIz[a][0-9A-Za-z_-]{35}|xo[x][bpa]-|-----BEGI[N] [A-Z ]*PRIVATE KEY-----'
app_key='^[[:space:]]*(export[[:space:]]+)?APP_KE[Y][[:space:]]*=[[:space:]]*[^[:space:]]'
while IFS= read -r f; do
  [ -n "$f" ] && anota "1 (clave o secreto)" "$f"
done < <(
  printf '%s\n' "$lineas" | while IFS="$TAB" read -r f l; do
    if printf '%s\n' "$l" | grep -Eq -- "$clave" || printf '%s\n' "$l" | grep -Eq -- "$app_key"; then
      printf '%s\n' "$f"
    fi
  done | sort -u
)

# Regla 2: correo con un dominio que no es de ejemplo.
while IFS= read -r f; do
  [ -n "$f" ] && anota "2 (correo de una persona)" "$f"
done < <(
  printf '%s\n' "$lineas" | grep -F '@' | while IFS="$TAB" read -r f l; do
    printf '%s\n' "$l" | grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' |
      while IFS= read -r correo; do
        dominio=$(printf '%s' "${correo#*@}" | tr '[:upper:]' '[:lower:]')
        case "$dominio" in
          example.com | example.org | example.net | github.com) ;;
          *) printf '%s\n' "$f" ;;
        esac
      done
  done | sort -u
)

# Regla 3: un fichero .env entre lo que entra.
while IFS= read -r f; do
  [ -n "$f" ] && anota "3 (fichero .env)" "$f"
done < <(nombres | awk -F/ '$NF == ".env"' | sort -u)

[ -z "$hallazgos" ] && exit 0

registro="docs/seguridad/registro-de-bloqueos.md"
mkdir -p "$(dirname "$registro")"
[ -f "$registro" ] || echo "# Registro de bloqueos del hook datos-que-no-salen" > "$registro"
ahora=$(date -u +%Y-%m-%dT%H:%M:%SZ)

{
  echo "datos-que-no-salen: commit bloqueado."
  printf '%s' "$hallazgos" | while IFS="$TAB" read -r regla f; do
    echo "- Regla $regla en $f"
    echo "- $ahora BLOQUEADO regla $regla en $f" >> "$registro"
  done
  echo "Sustituye el dato por uno inventado (correos con example.com, claves falsas, sin .env) y vuelve a intentarlo. No desactives el hook."
} >&2

exit 2
