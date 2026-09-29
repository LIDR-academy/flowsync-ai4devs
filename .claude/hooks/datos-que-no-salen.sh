#!/usr/bin/env bash
# PreToolUse (matcher Bash). Antes de un `git commit`, revisa lo que se va a
# comitear en busca de claves, correos reales o ficheros .env. Si encuentra
# algo, bloquea el commit (exit 2) y dice qué y dónde, nunca el valor.
set -uo pipefail

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$repo_root" || exit 0

self_path=".claude/hooks/datos-que-no-salen.sh"
log_file="docs/seguridad/registro-de-bloqueos.md"

command="$(jq -r '.tool_input.command // empty' 2>/dev/null)" || exit 0
[ -z "$command" ] && exit 0

case "$command" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

violations=()

add_violation() {
  violations+=("$1|$2")
}

# Reglas 1 y 2 sobre una línea de contenido ya añadida (sin el prefijo '+').
check_line_rules() {
  local content="$1" file="$2"

  if printf '%s\n' "$content" | grep -Eq 'AKIA[A-Z0-9]{16}'; then
    add_violation "1:clave-aws" "$file"
  fi
  if printf '%s\n' "$content" | grep -Fq 'sk-ant-'; then
    add_violation "1:clave-anthropic" "$file"
  fi
  if printf '%s\n' "$content" | grep -Fq 'github_pat_'; then
    add_violation "1:token-github-fine-grained" "$file"
  elif printf '%s\n' "$content" | grep -Fq 'ghp_'; then
    add_violation "1:token-github" "$file"
  fi
  if printf '%s\n' "$content" | grep -Eq 'AIza[0-9A-Za-z_-]{35}'; then
    add_violation "1:clave-google" "$file"
  fi
  if printf '%s\n' "$content" | grep -Eq 'xox[bpa]-'; then
    add_violation "1:token-slack" "$file"
  fi
  if printf '%s\n' "$content" | grep -Eq -- '-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----'; then
    add_violation "1:bloque-clave-privada" "$file"
  fi
  if printf '%s\n' "$content" | grep -Eq '^APP_KEY=.+'; then
    add_violation "1:app-key-con-valor" "$file"
  fi

  local email domain domain_lc
  while IFS= read -r email; do
    [ -z "$email" ] && continue
    domain="${email##*@}"
    domain_lc="$(printf '%s' "$domain" | tr '[:upper:]' '[:lower:]')"
    case "$domain_lc" in
      example.com | example.org | example.net | github.com) ;;
      *) add_violation "2:correo-dominio-real" "$file" ;;
    esac
  done < <(printf '%s\n' "$content" | grep -Eo '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
}

# Regla 3: un fichero llamado exactamente .env (los .env.example no cuentan).
check_env_filename() {
  local file="$1"
  [ -z "$file" ] && return
  if [ "$(basename -- "$file")" = ".env" ]; then
    add_violation "3:fichero-env" "$file"
  fi
}

# Recorre un diff unificado (líneas añadidas '+', sin '+++') línea a línea.
scan_diff() {
  local diff_output="$1" current_file=""
  [ -z "$diff_output" ] && return
  while IFS= read -r line; do
    case "$line" in
      "+++ "*)
        current_file="${line#+++ }"
        current_file="${current_file#b/}"
        [ "$current_file" = "/dev/null" ] && current_file=""
        ;;
      "+"*)
        check_line_rules "${line#+}" "$current_file"
        ;;
    esac
  done <<<"$diff_output"
}

scan_name_list() {
  local name_list="$1"
  [ -z "$name_list" ] && return
  while IFS= read -r f; do
    check_env_filename "$f"
  done <<<"$name_list"
}

# Lo que ya está preparado siempre se inspecciona.
staged_diff="$(git diff --cached -- . ":(exclude)$self_path" 2>/dev/null)"
scan_diff "$staged_diff"
scan_name_list "$(git diff --cached --name-only -- . ":(exclude)$self_path" 2>/dev/null)"

# Si el mismo comando también hace `git add`, ese `add` todavía no ha
# corrido cuando se dispara este hook: hay que mirar además lo que aún no
# está preparado y los ficheros nuevos sin seguimiento.
case "$command" in
  *"git add"*)
    unstaged_diff="$(git diff -- . ":(exclude)$self_path" 2>/dev/null)"
    scan_diff "$unstaged_diff"
    scan_name_list "$(git diff --name-only -- . ":(exclude)$self_path" 2>/dev/null)"

    while IFS= read -r f; do
      [ -z "$f" ] && continue
      [ "$f" = "$self_path" ] && continue
      check_env_filename "$f"
      [ -f "$f" ] || continue
      while IFS= read -r line || [ -n "$line" ]; do
        check_line_rules "$line" "$f"
      done <"$f"
    done < <(git status --porcelain=v1 --untracked-files=all 2>/dev/null | grep '^?? ' | cut -c4-)
    ;;
esac

[ "${#violations[@]}" -eq 0 ] && exit 0

if [ ! -f "$log_file" ]; then
  mkdir -p "$(dirname -- "$log_file")"
  printf '%s\n' "# Registro de bloqueos — datos sensibles interceptados antes de comitear" >"$log_file"
fi

timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

seen=""
for v in "${violations[@]}"; do
  regla="${v%%|*}"
  archivo="${v#*|}"
  key="$regla|$archivo"
  case "$seen" in
    *"[$key]"*) continue ;;
  esac
  seen="$seen[$key]"

  printf 'datos-que-no-salen: commit bloqueado — regla %s saltó en %s. Sustituye el dato real por uno inventado y reintenta.\n' "$regla" "$archivo" >&2
  printf '%s BLOQUEADO regla=%s archivo=%s\n' "$timestamp" "$regla" "$archivo" >>"$log_file"
done

exit 2
