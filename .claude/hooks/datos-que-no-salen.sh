#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash). Blocks a `git commit` whose incoming lines
# carry a recognizable secret key, a non-reserved email address, or a `.env`
# file. On a hit: exit 2, explain on stderr, and append one line to the block
# log. The log never stores the matched value: that would be another copy.
set -uo pipefail

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null)
[[ $cmd == *"git commit"* ]] || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
top=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$top" || exit 0

with_add=0
[[ $cmd == *"git add"* ]] && with_add=1

# Added lines as "path<TAB>content". A "+++" header only counts right after
# "diff --git", so an added line starting with "++ " is not taken for a path.
added_from_diff() {
  git diff "$@" -U0 --no-color --no-ext-diff --src-prefix=a/ --dst-prefix=b/ \
    --diff-filter=ACMR | awk '
    /^diff --git / { hdr = 1; next }
    hdr && /^\+\+\+ / { f = substr($0, 5); sub(/^b\//, "", f); hdr = 0; next }
    /^@@/ { hdr = 0; next }
    /^\+/ { print f "\t" substr($0, 2) }'
}

added_lines() {
  added_from_diff --cached
  if ((with_add)); then
    added_from_diff
    git ls-files --others --exclude-standard -z |
      while IFS= read -r -d '' f; do
        [[ -f $f ]] && grep -Iq '' "$f" 2>/dev/null || continue
        awk -v f="$f" '{ print f "\t" $0 }' "$f"
      done
  fi
}

incoming_paths() {
  git diff --cached --name-only --diff-filter=ACMR
  if ((with_add)); then
    git diff --name-only --diff-filter=ACMR
    git ls-files --others --exclude-standard
    # `git add -f` can bring in an ignored file, `.env` being the usual one.
    if [[ $cmd =~ git\ add.*(-f|--force) ]]; then
      git ls-files --others --ignored --exclude-standard --directory
    fi
  fi
}

lines=$(added_lines)
findings=()

# Rule 1: key with a recognizable shape. Prefixes are split with [..] so this
# file does not match itself when it is committed.
key_re='AKIA[0-9A-Z]{16}|s[k]-ant-|g[h]p_|github[_]pat_|AIza[0-9A-Za-z_-]{35}|xo[x][bpa]-|-{5}BEGIN ([A-Z0-9]+ )*PRIVATE KEY-{5}'
app_key_re=$'\t''[[:space:]]*(export[[:space:]]+)?APP_KEY=["'"'"']?[^[:space:]"'"'"']'
while IFS= read -r f; do
  [[ -n $f ]] && findings+=("clave con forma reconocible"$'\t'"$f")
done < <(
  {
    printf '%s\n' "$lines" | grep -E $'\t'".*($key_re)"
    printf '%s\n' "$lines" | grep -E "$app_key_re"
  } | cut -f1 | sort -u
)

# Rule 2: email address outside the reserved/allowed domains.
while IFS= read -r f; do
  [[ -n $f ]] && findings+=("correo con dominio no reservado"$'\t'"$f")
done < <(
  printf '%s\n' "$lines" | awk -F'\t' '
    {
      f = $1; s = substr($0, length(f) + 2)
      while (match(s, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z][A-Za-z]+/)) {
        addr = substr(s, RSTART, RLENGTH); s = substr(s, RSTART + RLENGTH)
        d = tolower(substr(addr, index(addr, "@") + 1))
        if (d != "example.com" && d != "example.org" && d != "example.net" && d != "github.com") {
          print f; break
        }
      }
    }' | sort -u
)

# Rule 3: a file named exactly `.env`, in any folder.
while IFS= read -r f; do
  [[ -n $f ]] && findings+=("fichero .env"$'\t'"$f")
done < <(incoming_paths | awk -F/ '$NF == ".env"' | sort -u)

((${#findings[@]})) || exit 0

log=docs/seguridad/registro-de-bloqueos.md
mkdir -p "$(dirname "$log")"
[[ -f $log ]] || echo "# Registro de bloqueos del hook datos-que-no-salen" >"$log"
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)

{
  echo "Commit bloqueado por .claude/hooks/datos-que-no-salen.sh:"
  for item in "${findings[@]}"; do
    rule=${item%%$'\t'*} file=${item#*$'\t'}
    echo "- regla: $rule — archivo: $file"
    echo "- $now BLOQUEADO — regla: $rule — archivo: $file" >>"$log"
  done
  echo "Sustituye el dato por uno inventado (correos con dominio example.com) y vuelve a intentarlo. No desactives ni te saltes este hook."
} >&2
exit 2
