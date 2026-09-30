#!/usr/bin/env bash
# Hook PreToolUse (matcher Bash): no deja pasar un `git commit` que meta en el
# repositorio una clave con forma reconocible, un correo de un dominio real o un
# fichero .env. Si bloquea, sale con 2, dice qué regla y en qué archivo, y deja
# una línea en docs/seguridad/registro-de-bloqueos.md. Nunca escribe el valor.
set -uo pipefail

entrada="$(cat)"
comando="$(jq -r '.tool_input.command // empty' <<<"$entrada")"
[[ "$comando" =~ git[[:space:]]+commit ]] || exit 0

dir="$(jq -r '.cwd // empty' <<<"$entrada")"
cd "${dir:-${CLAUDE_PROJECT_DIR:-.}}" 2>/dev/null || exit 0
raiz="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$raiz" || exit 0

# Regla 1. Cada patrón está escrito de forma que no se reconozca a sí mismo
# (`gh[p]_` no contiene la secuencia que busca), para que este script se pueda commitear.
CLAVE="AKIA[0-9A-Z]{16}|sk-an[t]-|gh[p]_|github_pa[t]_|AIza[0-9A-Za-z_-]{35}|xox[bpa]-"
CLAVE+="|-----BEGIN[A-Z ]*PRIVATE KE[Y][A-Z ]*-----"
CLAVE+="|^[[:space:]]*(export[[:space:]]+)?APP_KE[Y]=[\"']?[^[:space:]\"'#]"
# Regla 2. Dominios reservados para ejemplos y pruebas, y el de GitHub.
CORREO='[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}'
PERMITIDOS='example\.(com|org|net)|github\.com'

git() { command git -c core.quotepath=off "$@"; }

# Líneas añadidas de un archivo según de dónde entra: el índice, los cambios sin
# preparar o un archivo nuevo sin seguimiento (entero; nada si es binario).
lineas_nuevas() {
  case "$1" in
    indice) git diff --cached --unified=0 --no-color --no-ext-diff -- "$2" | sed -n '/^@@/,$s/^+//p' ;;
    sin_preparar) git diff --unified=0 --no-color --no-ext-diff -- "$2" | sed -n '/^@@/,$s/^+//p' ;;
    nuevo) grep -I '' -- "$2" 2>/dev/null ;;
  esac
}

hallazgos=""
revisar() {
  local archivo="$2" lineas
  [[ "${archivo##*/}" == .env ]] && hallazgos+="fichero-env"$'\t'"$archivo"$'\n'
  lineas="$(lineas_nuevas "$1" "$archivo")"
  [[ -n "$lineas" ]] || return 0
  grep -qE "$CLAVE" <<<"$lineas" && hallazgos+="clave"$'\t'"$archivo"$'\n'
  [[ -n "$(grep -oE "$CORREO" <<<"$lineas" | sed 's/.*@//' | tr '[:upper:]' '[:lower:]' | grep -vxE "$PERMITIDOS")" ]] &&
    hallazgos+="correo"$'\t'"$archivo"$'\n'
}

while IFS= read -r f; do [[ -n "$f" ]] && revisar indice "$f"; done < <(git diff --cached --name-only --diff-filter=d)
# Si el mismo comando prepara archivos (`git add`, o `git commit -a`), lo que va a
# entrar todavía no está en el índice cuando corre este hook.
AGREGA='git[[:space:]]+add'
TODO='commit.*[[:space:]](-[A-Za-z]*a[A-Za-z]*|--all)([[:space:]]|$)'
if [[ "$comando" =~ $AGREGA || "$comando" =~ $TODO ]]; then
  while IFS= read -r f; do [[ -n "$f" ]] && revisar sin_preparar "$f"; done < <(git diff --name-only --diff-filter=d)
fi
if [[ "$comando" =~ $AGREGA ]]; then
  while IFS= read -r f; do [[ -n "$f" ]] && revisar nuevo "$f"; done < <(git ls-files --others --exclude-standard)
fi

[[ -n "$hallazgos" ]] || exit 0

registro="docs/seguridad/registro-de-bloqueos.md"
mkdir -p "${registro%/*}"
[[ -f "$registro" ]] || echo "# Registro de bloqueos del hook datos-que-no-salen" >"$registro"
ahora="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

while IFS=$'\t' read -r regla archivo; do
  [[ -n "$regla" ]] || continue
  echo "- $ahora BLOQUEADO $regla \`$archivo\`" >>"$registro"
  case "$regla" in
    clave) que="una clave con forma reconocible" ;;
    correo) que="un correo de un dominio real (solo pasan example.com, example.org, example.net y github.com)" ;;
    fichero-env) que="un fichero .env" ;;
  esac
  echo "datos-que-no-salen: BLOQUEADO por la regla «$regla» en $archivo: lleva $que." >&2
done < <(printf '%s' "$hallazgos" | sort -u)

echo "Sustituye el dato por uno inventado (o saca el .env del commit) y vuelve a intentarlo. No desactives ni te saltes este hook. El bloqueo queda en $registro." >&2
exit 2
