#!/usr/bin/env bash
set -uo pipefail

if [ -n "${CLAUDE_PROJECT_DIR:-}" ]; then
  cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || true
fi

input=$(cat)
command=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

SECRET_PATTERN='AKIA[A-Za-z0-9]{16}|sk-ant-|ghp_|github_pat_|AIza[A-Za-z0-9_-]{35}|xoxb-|xoxp-|xoxa-|-----BEGIN [A-Z ]*PRIVATE KEY-----|APP_KEY=[^[:space:]]'
ALLOWED_EMAIL_DOMAINS='@(example\.com|example\.org|example\.net|github\.com)$'
LOG_FILE='docs/seguridad/registro-de-bloqueos.md'

violation_rule=""
violation_file=""
found=0

is_env_filename() {
  [ "$(basename -- "$1")" = ".env" ]
}

# Solo las líneas añadidas importan: lo que ya estaba en el repo no es lo que
# este commit va a exponer.
added_lines_from_diff() {
  printf '%s\n' "$1" | grep -E '^\+' | grep -Ev '^\+\+\+' | sed 's/^\+//'
}

check_content() {
  local content="$1"
  [ -z "$content" ] && return 1

  if printf '%s\n' "$content" | grep -qE "$SECRET_PATTERN"; then
    violation_rule="SECRETOS"
    return 0
  fi

  local emails bad
  emails=$(printf '%s\n' "$content" | grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' || true)
  if [ -n "$emails" ]; then
    bad=$(printf '%s\n' "$emails" | grep -viE "$ALLOWED_EMAIL_DOMAINS" || true)
    if [ -n "$bad" ]; then
      violation_rule="CORREOS"
      return 0
    fi
  fi

  return 1
}

scan_file_list() {
  # arg1: lista de ficheros (uno por línea); arg2: "diff-cached" | "diff" | "untracked"
  local files="$1" mode="$2"
  [ -z "$files" ] && return 0

  while IFS= read -r f; do
    [ -z "$f" ] && continue

    if is_env_filename "$f"; then
      violation_rule="ENV"
      violation_file="$f"
      found=1
      return 0
    fi

    local content
    case "$mode" in
      diff-cached)
        content=$(added_lines_from_diff "$(git diff --cached -- "$f" 2>/dev/null || true)")
        ;;
      diff)
        content=$(added_lines_from_diff "$(git diff -- "$f" 2>/dev/null || true)")
        ;;
      untracked)
        content=$(cat -- "$f" 2>/dev/null || true)
        ;;
    esac

    if check_content "$content"; then
      violation_file="$f"
      found=1
      return 0
    fi
  done <<< "$files"

  return 0
}

# 1. El diff staged: lo que ya está en el índice y entraría en el commit tal cual.
scan_file_list "$(git diff --cached --name-only 2>/dev/null || true)" "diff-cached"

# 2. Si el propio comando también hace "git add", ese add todavía no ha
# ocurrido cuando este hook corre (PreToolUse va ANTES de ejecutar el
# comando): lo que va a entrar al índice está hoy en el árbol de trabajo
# como cambios sin stage o como ficheros nuevos sin trackear.
if [ "$found" -eq 0 ] && printf '%s' "$command" | grep -q "git add"; then
  scan_file_list "$(git diff --name-only 2>/dev/null || true)" "diff"
fi

if [ "$found" -eq 0 ] && printf '%s' "$command" | grep -q "git add"; then
  scan_file_list "$(git ls-files --others --exclude-standard 2>/dev/null || true)" "untracked"
fi

if [ "$found" -eq 1 ]; then
  mkdir -p "$(dirname "$LOG_FILE")"
  if [ ! -f "$LOG_FILE" ]; then
    printf '# Registro de bloqueos del hook de seguridad (datos-que-no-salen.sh)\n' > "$LOG_FILE"
  fi
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  printf '%s BLOQUEADO regla=%s fichero=%s\n' "$ts" "$violation_rule" "$violation_file" >> "$LOG_FILE"

  {
    echo "BLOQUEADO por datos-que-no-salen.sh: regla $violation_rule activada por '$violation_file'."
    echo "Sustituye el dato detectado por un valor inventado antes de volver a intentar el commit."
  } >&2
  exit 2
fi

exit 0
