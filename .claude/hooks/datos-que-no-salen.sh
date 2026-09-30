#!/usr/bin/env bash
# PreToolUse (Bash): bloquea un `git commit` si lo que va a entrar lleva claves
# reconocibles, correos reales o un fichero `.env`. Sale 0 en silencio si no ve
# nada; sale 2 con el motivo por stderr y deja constancia en el registro.
set -uo pipefail

input=$(cat)

if ! command -v jq >/dev/null 2>&1; then
  # Sin jq no se puede leer el comando con fiabilidad: si huele a commit, se
  # falla cerrado para no dejar pasar nada sin revisar.
  case "$input" in
    *"git commit"*)
      echo "datos-que-no-salen: falta 'jq' y no puedo revisar el commit. Instala jq y reintenta." >&2
      exit 2 ;;
  esac
  exit 0
fi

cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

# `git add` en el mismo comando (o `commit -a`) mete cambios que aún no están
# en el índice cuando corre este hook: hay que mirarlos también.
incluye_pendientes=0
case "$cmd" in *"git add"*) incluye_pendientes=1 ;; esac
if printf '%s' "$cmd" | grep -qE 'git commit([^;&|]*[[:space:]])(-[A-Za-z]*a[A-Za-z]*|--all)([[:space:]]|$)'; then
  incluye_pendientes=1
fi

# Líneas añadidas como "fichero<TAB>línea".
lineas_diff() {
  git diff "$@" -U0 --no-color --no-ext-diff 2>/dev/null | awk '
    /^\+\+\+ / { f = substr($0, 5); sub(/^b\//, "", f); if (f == "/dev/null") f = ""; next }
    /^\+/      { if (f != "") { l = substr($0, 2); sub(/\r$/, "", l); print f "\t" l } }
  '
}

untracked() {
  git ls-files --others --exclude-standard 2>/dev/null
}

anadidas() {
  lineas_diff --cached
  if [ "$incluye_pendientes" -eq 1 ]; then
    lineas_diff
    untracked | while IFS= read -r f; do
      [ -f "$f" ] || continue
      grep -Iq . "$f" 2>/dev/null || continue   # binarios y vacíos fuera
      awk -v f="$f" '{ sub(/\r$/, ""); print f "\t" $0 }' "$f"
    done
  fi
}

ficheros() {
  git diff --cached --name-only 2>/dev/null
  if [ "$incluye_pendientes" -eq 1 ]; then
    git diff --name-only 2>/dev/null
    untracked
  fi
}

contenido=$(anadidas)
violaciones=""   # "regla<TAB>fichero" por línea

anota() { violaciones+="$1"$'\t'"$2"$'\n'; }

# Regla 1: claves reconocibles.
claves='AKIA[0-9A-Z]{16}|sk-ant-[A-Za-z0-9_-]{8,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[0-9A-Za-z_-]{35}|xox[bpa]-[A-Za-z0-9-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----'
while IFS= read -r f; do
  [ -n "$f" ] && anota "clave-reconocible" "$f"
done < <(printf '%s\n' "$contenido" | grep -E $'\t'".*($claves)" | cut -f1)
while IFS= read -r f; do
  [ -n "$f" ] && anota "clave-reconocible (APP_KEY con valor)" "$f"
done < <(printf '%s\n' "$contenido" | grep -E $'\t''[[:space:]]*(export[[:space:]]+)?APP_KEY=[^[:space:]]' | cut -f1)

# Regla 2: correos fuera de los dominios permitidos.
while IFS=$'\t' read -r f linea; do
  [ -n "$f" ] || continue
  while IFS= read -r dominio; do
    case "${dominio,,}" in
      example.com|example.org|example.net|github.com) ;;
      *) anota "correo-real" "$f"; break ;;
    esac
  done < <(printf '%s\n' "$linea" | grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' | sed 's/.*@//')
done < <(printf '%s\n' "$contenido" | grep -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')

# Regla 3: el fichero `.env` (exacto; `.env.example` y compañía pasan).
while IFS= read -r f; do
  case "$f" in
    .env|*/.env) anota "fichero-env" "$f" ;;
  esac
done < <(ficheros)
if printf '%s' "$cmd" | grep -qE '(^|[[:space:]/"'\''])\.env([[:space:]"'\'';&|)]|$)'; then
  anota "fichero-env" "(nombrado en el comando)"
fi

[ -z "$violaciones" ] && exit 0

registro="docs/seguridad/registro-de-bloqueos.md"
mkdir -p "$(dirname "$registro")"
[ -f "$registro" ] || printf '# Registro de bloqueos del hook datos-que-no-salen\n\n' > "$registro"

ahora=$(date -u +%Y-%m-%dT%H:%M:%SZ)
{
  echo "datos-que-no-salen: commit BLOQUEADO."
  printf '%s' "$violaciones" | sort -u | while IFS=$'\t' read -r regla f; do
    echo "  - regla: $regla | archivo: $f"
    echo "- $ahora BLOQUEADO regla=$regla archivo=$f" >> "$registro"
  done
  echo "Sustituye el dato por uno inventado (correos @example.com, claves de mentira, .env fuera del commit) y reintenta."
  echo "No saltes ni deshabilites este hook."
} >&2
exit 2
