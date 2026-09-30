#!/usr/bin/env bash
set -uo pipefail

# Hook PreToolUse (matcher: Bash) — bloquea secretos, correos reales y .env
# Lee el JSON de stdin con jq, igual que el hook de Prettier.

COMMAND=$(jq -r '.tool_input.command // empty')

# Solo actúa si el comando contiene "git commit"
if [[ "$COMMAND" != *"git commit"* ]]; then
  exit 0
fi

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
REGISTRO="$REPO_ROOT/docs/seguridad/registro-de-bloqueos.md"

# Recopilar las líneas añadidas que van a entrar al commit.
# Siempre: el diff preparado (staged). Se excluye el propio hook para no detectarse a sí mismo.
DIFF=$(git diff --cached -U0 -- ':!.claude/hooks/datos-que-no-salen.sh' 2>/dev/null || true)

# Si el comando también hace git add, incluir cambios sin preparar y untracked.
if [[ "$COMMAND" == *"git add"* ]]; then
  DIFF="$DIFF"$'\n'"$(git diff -U0 2>/dev/null || true)"
  # Archivos nuevos sin seguimiento: leer su contenido completo
  while IFS= read -r f; do
    if [[ -n "$f" && -f "$f" ]]; then
      DIFF="$DIFF"$'\n'"$(cat "$f" 2>/dev/null || true)"
    fi
  done < <(git ls-files --others --exclude-standard 2>/dev/null)
fi

BLOCKED=0
BLOCK_MESSAGES=""

# --- Regla 1: Claves con forma reconocible ---
# Solo en líneas añadidas (+).
ADDED_LINES_SEC=$(echo "$DIFF" | grep '^+' | grep -v '^+++')
if echo "$ADDED_LINES_SEC" | grep -Pq '(AKIA[A-Z0-9]{16}|sk-ant-|ghp_|github_pat_|AIza[A-Za-z0-9_\\-]{35}|xox[bpa]-|-----BEGIN [A-Z ]*PRIVATE KEY-----|APP_KEY=.+)'; then
  FILES=$(echo "$DIFF" | grep -P '^\+\+\+ b/' | sed 's|^\+\+\+ b/||' | head -5)
  [[ -z "$FILES" ]] && FILES="(staged content)"
  BLOCKED=1
  BLOCK_MESSAGES="${BLOCK_MESSAGES}REGLA: clave-o-secreto | ARCHIVO: ${FILES}"$'\n'
fi

# --- Regla 2: Correo cuyo dominio NO es example.com/org/net ni github.com ---
# Solo en líneas añadidas (+)
ADDED_LINES=$(echo "$DIFF" | grep '^+' | grep -v '^+++')
if echo "$ADDED_LINES" | grep -Piq '[a-z0-9._%+-]+@(?!example\.(com|org|net)|github\.com)[a-z0-9.-]+\.[a-z]{2,}'; then
  FILES=$(echo "$DIFF" | grep -P '^\+\+\+ b/' | sed 's|^\+\+\+ b/||' | head -5)
  [[ -z "$FILES" ]] && FILES="(staged content)"
  BLOCKED=1
  BLOCK_MESSAGES="${BLOCK_MESSAGES}REGLA: correo-real | ARCHIVO: ${FILES}"$'\n'
fi

# --- Regla 3: Fichero .env (exacto, en cualquier carpeta) entre lo que entra ---
# Los .env.example no cuentan.
STAGED_FILES=$(git diff --cached --name-only 2>/dev/null || true)
if [[ "$COMMAND" == *"git add"* ]]; then
  STAGED_FILES="$STAGED_FILES"$'\n'"$(git ls-files --others --exclude-standard 2>/dev/null || true)"
  STAGED_FILES="$STAGED_FILES"$'\n'"$(git diff --name-only 2>/dev/null || true)"
fi

if echo "$STAGED_FILES" | grep -Pq '(^|/)\.env$'; then
  ENV_FILE=$(echo "$STAGED_FILES" | grep -P '(^|/)\.env$' | head -1)
  BLOCKED=1
  BLOCK_MESSAGES="${BLOCK_MESSAGES}REGLA: fichero-env | ARCHIVO: ${ENV_FILE}"$'\n'
fi

# --- Si algo fue bloqueado ---
if [[ $BLOCKED -eq 1 ]]; then
  # Escribir registro
  if [[ ! -f "$REGISTRO" ]]; then
    echo "# Registro de bloqueos del hook datos-que-no-salen" > "$REGISTRO"
  fi

  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  while IFS= read -r line; do
    if [[ -n "$line" ]]; then
      echo "${TIMESTAMP} BLOQUEADO ${line}" >> "$REGISTRO"
    fi
  done <<< "$BLOCK_MESSAGES"

  # Mensaje de error al agente
  echo "❌ Hook datos-que-no-salen: commit bloqueado." >&2
  while IFS= read -r line; do
    if [[ -n "$line" ]]; then
      echo "  → ${line}" >&2
      echo "    Sustituye el dato por uno inventado y vuelve a intentarlo." >&2
    fi
  done <<< "$BLOCK_MESSAGES"

  exit 2
fi

exit 0
