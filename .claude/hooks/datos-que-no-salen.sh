#!/usr/bin/env bash
# datos-que-no-salen — hook PreToolUse (matcher Bash).
#
# Antes de un `git commit`, mira las líneas que van a entrar y bloquea (exit 2)
# si encuentra una clave con forma reconocible, un correo con dominio real o un
# fichero `.env`. Nunca imprime ni registra el valor encontrado: solo la regla
# y el archivo, porque un registro que repite el dato es otra copia del dato.
#
# Compatible con el bash 3.2 de macOS.
set -uo pipefail

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null)
[[ "$cmd" == *"git commit"* ]] || exit 0

cd "${CLAUDE_PROJECT_DIR:-$PWD}" 2>/dev/null || exit 0
root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

gitq() { git -c core.quotepath=off "$@"; }

# Líneas añadidas de un diff, como "archivo<TAB>línea".
added_lines() {
  gitq diff "$@" -U0 --no-color --no-ext-diff 2>/dev/null |
    awk '/^\+\+\+ /{f=substr($0,5); sub(/^b\//,"",f); next} /^\+/{print f "\t" substr($0,2)}'
}

# Un archivo que git aún no sigue entra entero (los binarios se saltan).
whole_file() {
  [[ -f "$1" ]] && grep -Iq . "$1" 2>/dev/null || return 0
  awk -v f="$1" '{print f "\t" $0}' "$1"
}

lines=$(added_lines --cached)
names=$(gitq diff --cached --name-only --diff-filter=d 2>/dev/null)

# Si el mismo comando prepara cambios, lo que aún no está en el índice también entra.
with_add=0
[[ "$cmd" == *"git add"* ]] && with_add=1
all_re='git commit[^;&|]*[[:space:]](-[[:alpha:]]*a[[:alpha:]]*|--all)([[:space:]]|$)'
with_all=0
[[ "$cmd" =~ $all_re ]] && with_all=1

if (( with_add || with_all )); then
  lines+=$'\n'$(added_lines)
  names+=$'\n'$(gitq diff --name-only --diff-filter=d 2>/dev/null)
fi

if (( with_add )); then
  untracked=$(gitq ls-files --others --exclude-standard 2>/dev/null)

  # `git add -f` mete archivos ignorados (un .env, por ejemplo): se miran los
  # ignorados que el propio comando nombra.
  force_re='git add[^;&|]*[[:space:]](-f|--force)([[:space:]]|$)'
  if [[ "$cmd" =~ $force_re ]]; then
    read -ra toks <<< "$(tr ';&|()' '     ' <<< "$cmd")"
    while IFS= read -r ign; do
      [[ -z "$ign" || "$ign" == */ ]] && continue
      for tok in "${toks[@]}"; do
        tok=${tok//\"/}; tok=${tok//\'/}; tok=${tok#./}
        [[ -n "$tok" ]] || continue
        if [[ "$ign" == "$tok" || "$ign" == */"$tok" ]]; then
          untracked+=$'\n'"$ign"
          break
        fi
      done
    done < <(gitq ls-files --others --ignored --exclude-standard --directory 2>/dev/null)
  fi

  while IFS= read -r f; do
    [[ -n "$f" ]] || continue
    names+=$'\n'"$f"
    lines+=$'\n'$(whole_file "$f")
  done <<< "$untracked"
fi

hits=""
hit() { hits+="$1"$'\t'"$2"$'\n'; }

# Regla 1: claves con forma reconocible.
key_re='AKIA[0-9A-Z]{16}|sk-ant-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}|AIza[0-9A-Za-z_-]{35}|xox[bpa]-[A-Za-z0-9-]{10,}|-----BEGIN ([A-Z0-9]+ )*PRIVATE KEY-----'
app_re='^[[:space:]]*(export[[:space:]]+)?APP_KEY=[^[:space:]]'
# Regla 2: correos cuyo dominio no sea de ejemplo.
mail_re='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'

while IFS=$'\t' read -r f l; do
  [[ -n "$f" ]] || continue
  if [[ "$l" =~ $key_re || "$l" =~ $app_re ]]; then
    hit "regla 1 (clave)" "$f"
  fi
  if [[ "$l" =~ $mail_re ]]; then
    while IFS= read -r addr; do
      dom=$(tr '[:upper:]' '[:lower:]' <<< "${addr#*@}")
      dom=${dom%.}
      case "$dom" in
        example.com | example.org | example.net | github.com) ;;
        *) hit "regla 2 (correo)" "$f"; break ;;
      esac
    done < <(grep -oE "$mail_re" <<< "$l")
  fi
done < <(grep -E "$key_re|APP_KEY=|@" <<< "$lines")

# Regla 3: un fichero llamado exactamente .env, en cualquier carpeta.
while IFS= read -r n; do
  [[ "${n##*/}" == ".env" ]] && hit "regla 3 (.env)" "$n"
done <<< "$names"

[[ -n "$hits" ]] || exit 0

log="docs/seguridad/registro-de-bloqueos.md"
mkdir -p "${log%/*}"
[[ -f "$log" ]] || echo "# Registro de bloqueos del hook datos-que-no-salen" > "$log"
now=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "datos-que-no-salen: commit bloqueado." >&2
while IFS=$'\t' read -r rule f; do
  [[ -n "$rule" ]] || continue
  echo "  - $rule en $f" >&2
  echo "- $now BLOQUEADO $rule \`$f\`" >> "$log"
done < <(sort -u <<< "$hits")
echo "Sustituye el dato por uno inventado (un correo de example.com, una clave falsa sin forma real) y vuelve a intentarlo. No desactives ni te saltes este hook." >&2
exit 2
