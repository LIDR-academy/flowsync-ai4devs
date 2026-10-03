#!/usr/bin/env bash
# Hook PreToolUse (matcher Bash): datos-que-no-salen.
#
# Antes de un `git commit`, mira solo las líneas añadidas de lo que va a entrar
# y bloquea (exit 2) si encuentra un secreto reconocible, un correo fuera de los
# dominios permitidos o un archivo llamado exactamente `.env`. Nunca imprime ni
# registra el valor encontrado: solo la regla y el archivo.
#
# Los patrones de secreto se escriben partidos ('sk''-ant-') para que este mismo
# archivo no los contenga literalmente y se pueda commitear.
set -uo pipefail

input=$(cat)
cmd=$(jq -r '.tool_input.command // empty' <<<"$input" 2>/dev/null) || exit 0

# Solo actúa ante `git commit`; cualquier otro comando sale sin rastro.
[[ "$cmd" == *"git commit"* ]] || exit 0

cwd=$(jq -r '.cwd // empty' <<<"$input" 2>/dev/null)
[[ -n "$cwd" && -d "$cwd" ]] && cd "$cwd"
repo=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
cd "$repo" || exit 0
proyecto=${CLAUDE_PROJECT_DIR:-$repo}
registro="$proyecto/docs/seguridad/registro-de-bloqueos.md"

con_add=0
[[ "$cmd" == *"git add"* ]] && con_add=1

git_q() { git -c core.quotepath=off "$@"; }

# Archivos que van a entrar en el commit.
archivos() {
  git_q diff --cached --name-only --diff-filter=ACMR
  if ((con_add)); then
    git_q diff --name-only --diff-filter=ACMR
    git_q ls-files --others --exclude-standard
  fi
}

# Flujo "archivo<TAB>línea añadida". El contenido de los `.env` no se lee: ya
# quedan bloqueados por su nombre.
lineas_añadidas() {
  local filtro='/^\+\+\+ /{ f=substr($0,5); sub(/^b\//,"",f); next }
                /^\+/{ n=split(f,p,"/"); if (p[n] != ".env") print f "\t" substr($0,2) }'
  git_q diff --cached -U0 --no-color --no-ext-diff | awk "$filtro"
  if ((con_add)); then
    git_q diff -U0 --no-color --no-ext-diff | awk "$filtro"
    while IFS= read -r -d '' f; do
      [[ -f "$f" && "$(basename -- "$f")" != ".env" ]] || continue
      grep -Iq . -- "$f" 2>/dev/null || continue
      awk -v f="$f" '{ print f "\t" $0 }' "./$f"
    done < <(git ls-files -z --others --exclude-standard)
  fi
}

hallazgos=()
anota() { hallazgos+=("$1"$'\t'"$2"); }

# Regla 3: archivo llamado exactamente `.env`, en cualquier carpeta. Incluye
# rutas que el propio comando añade (`git add -f backend/.env`), que al estar
# ignoradas no aparecen como archivos sin seguimiento.
while IFS= read -r f; do
  [[ "$(basename -- "$f")" == ".env" ]] && anota "archivo .env" "$f"
done < <(
  archivos
  if ((con_add)); then
    tr -s ' \t;&|()' '\n' <<<"$cmd" | grep -E '(^|/)\.env$'
  fi
)

flujo=$(lineas_añadidas)

# Regla 1: secretos con forma reconocible.
secretos=(
  "secreto (clave de AWS)|AKIA[0-9A-Z]{16}"
  "secreto (clave de Anthropic)|sk""-ant-"
  "secreto (token de GitHub)|gh""p_"
  "secreto (token de GitHub)|github""_pat_"
  "secreto (clave de Google)|AI""za[0-9A-Za-z_-]{35}"
  "secreto (token de Slack)|xox""[bpa]-"
  "secreto (clave privada)|-----BEGIN[A-Z0-9 ]*PRIVATE KEY-----"
  "secreto (APP_KEY con valor)|^[[:space:]]*(export[[:space:]]+)?APP""_KEY=[\"']?[^\"'[:space:]#]"
)
tab=$'\t'
for entrada in "${secretos[@]}"; do
  regla=${entrada%%|*}
  patron=${entrada#*|}
  # El patrón se aplica a la columna de contenido, no a la del archivo.
  if [[ "$patron" == ^* ]]; then
    patron="^[^$tab]*$tab(${patron#^})"
  else
    patron="^[^$tab]*$tab.*($patron)"
  fi
  while IFS= read -r f; do
    [[ -n "$f" ]] && anota "$regla" "$f"
  done < <(grep -E -- "$patron" <<<"$flujo" | cut -f1 | sort -u)
done

# Regla 2: correos fuera de los dominios permitidos.
permitidos=' example.com example.org example.net github.com '
while IFS=$'\t' read -r f linea; do
  while IFS= read -r correo; do
    dominio=$(tr '[:upper:]' '[:lower:]' <<<"${correo##*@}")
    if [[ "$permitidos" != *" $dominio "* ]]; then
      anota "correo fuera de los dominios permitidos" "$f"
      break
    fi
  done < <(grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' <<<"$linea")
done < <(grep -F '@' <<<"$flujo")

((${#hallazgos[@]})) || exit 0

mapfile -t hallazgos < <(printf '%s\n' "${hallazgos[@]}" | sort -u)

if [[ ! -f "$registro" ]]; then
  mkdir -p "$(dirname -- "$registro")"
  echo "# Registro de bloqueos del hook datos-que-no-salen" >"$registro"
fi
ahora=$(date -u +%Y-%m-%dT%H:%M:%SZ)

{
  echo "datos-que-no-salen: commit BLOQUEADO."
  for h in "${hallazgos[@]}"; do
    regla=${h%%$'\t'*}
    f=${h#*$'\t'}
    echo "- Regla: $regla. Archivo: $f"
    echo "- $ahora BLOQUEADO regla=\"$regla\" archivo=\"$f\"" >>"$registro"
  done
  echo "Sustituye el dato por uno inventado (correo en example.com, clave de ejemplo, .env -> .env.example) y vuelve a intentarlo."
  echo "No desactives ni te saltes este hook. Incluye docs/seguridad/registro-de-bloqueos.md en el commit como evidencia."
} >&2
exit 2
