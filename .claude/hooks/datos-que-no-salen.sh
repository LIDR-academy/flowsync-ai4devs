#!/usr/bin/env bash
# datos-que-no-salen — hook PreToolUse (matcher Bash).
# Bloquea un `git commit` si lo que entra lleva una clave reconocible (regla 1),
# un correo que no es de ejemplo (regla 2) o un fichero .env (regla 3).
# Sale con 2 si bloquea, con 0 en cualquier otro caso. Nunca imprime ni registra
# el valor encontrado: solo la regla y el fichero.
#
# Los patrones de la regla 1 llevan un corchete dentro del prefijo (p. ej. `[_]`)
# para que este mismo fichero no se bloquee a sí mismo al commitearlo.
set -uo pipefail

cmd=$(jq -r '.tool_input.command // empty' 2>/dev/null) || exit 0
[[ -n $cmd ]] || exit 0
grep -Eq 'git[[:space:]]+commit' <<<"$cmd" || exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
root=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$root" || exit 0

tmp=$(mktemp) || exit 0
trap 'rm -f "$tmp"' EXIT

# stdin: diff unificado (-U0). stdout: «fichero<TAB>línea añadida».
added() {
  awk '
    /^diff --git /  { hdr = 1; next }
    /^@@/           { hdr = 0; next }
    hdr && /^\+\+\+ / { f = ($0 == "+++ /dev/null") ? "" : substr($0, 7); next }
    !hdr && /^\+/   { if (f != "") print f "\t" substr($0, 2) }
  '
}
diff_args=(-c core.quotepath=off diff -U0 --no-color --no-ext-diff --diff-filter=ACMR
  --src-prefix=a/ --dst-prefix=b/)

# Lo que entra por el índice.
git "${diff_args[@]}" --cached | added >>"$tmp"
names=$(git -c core.quotepath=off diff --cached --name-only --diff-filter=ACMR)

# Si el mismo comando hace `git add`, lo que aún no está en el índice también entra.
if grep -Eq 'git[[:space:]]+add' <<<"$cmd"; then
  git "${diff_args[@]}" | added >>"$tmp"
  names+=$'\n'$(git -c core.quotepath=off diff --name-only --diff-filter=ACMR)
  while IFS= read -r -d '' f; do
    names+=$'\n'"$f"
    if [[ -f $f ]] && grep -Iq . -- "$f"; then
      awk -v f="$f" '{ print f "\t" $0 }' "$f" >>"$tmp"
    fi
  done < <(git -c core.quotepath=off ls-files --others --exclude-standard -z)
  # `git add -f .env` salta el .gitignore: se mira también lo que el comando nombra.
  names+=$'\n'$(tr -s ' \t;&|()"'"'" '\n' <<<"$cmd")
fi

findings=""
add_finding() { findings+="$1"$'\t'"$2"$'\n'; }

# Regla 1: clave con forma reconocible.
sq="'"
key_re='AKIA[0-9A-Z]{16}|sk-an[t]-|ghp[_]|github_pa[t]_|AIza[0-9A-Za-z_-]{35}|xox[bpa]-'
key_re+='|-----BEGIN ([A-Z]+ )*PRIVATE KEY-----'
key_re+="|(^|[[:space:]])(export[[:space:]]+)?APP_KEY[[:space:]]*=[[:space:]]*[\"$sq]?[^[:space:]\"$sq#]"
while IFS= read -r f; do
  [[ -n $f ]] && add_finding 1 "$f"
done < <(LC_ALL=C grep -aE -e "$key_re" "$tmp" | cut -f1 | sort -u)

# Regla 2: correo cuyo dominio no es example.com/org/net ni github.com.
while IFS= read -r f; do
  [[ -n $f ]] && add_finding 2 "$f"
done < <(awk -F'\t' '
  {
    line = substr($0, length($1) + 2)
    while (match(line, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z][A-Za-z]+/)) {
      dom = tolower(substr(line, RSTART, RLENGTH)); sub(/^[^@]*@/, "", dom)
      line = substr(line, RSTART + RLENGTH)
      if (dom != "example.com" && dom != "example.org" && dom != "example.net" && dom != "github.com") {
        print $1; break
      }
    }
  }' "$tmp" | sort -u)

# Regla 3: fichero .env (nombre exacto, en cualquier carpeta).
while IFS= read -r f; do
  [[ -n $f ]] && add_finding 3 "$f"
done < <(awk -F/ '$NF == ".env"' <<<"$names" | sort -u)

[[ -n $findings ]] || exit 0

registro="docs/seguridad/registro-de-bloqueos.md"
mkdir -p "$(dirname "$registro")"
[[ -e $registro ]] || echo "# Registro de bloqueos de datos-que-no-salen" >"$registro"
ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
nombre_regla() {
  case $1 in
    1) echo "regla 1 (clave con forma reconocible)" ;;
    2) echo "regla 2 (correo fuera de example.com/org/net y github.com)" ;;
    3) echo "regla 3 (fichero .env)" ;;
  esac
}

while IFS=$'\t' read -r regla f; do
  [[ -n $regla ]] || continue
  echo "$ts BLOQUEADO regla $regla $f" >>"$registro"
  echo "datos-que-no-salen: BLOQUEADO por la $(nombre_regla "$regla") en $f." >&2
done <<<"$findings"
echo "Sustituí el dato por uno inventado (p. ej. ada@example.com) y volvé a intentar el commit. No desactives el hook ni te lo saltes. Queda registrado en $registro." >&2
exit 2
