#!/usr/bin/env bash
#
# Guardarraíl: impide que cierta clase de dato entre en el repositorio.
#
# Registrado como PreToolUse/Bash en .claude/settings.json. Recibe por la
# entrada estándar el JSON de la llamada; el comando viene en
# .tool_input.command, igual que en el hook de Prettier.
#
# Sale 0 y en silencio salvo que encuentre algo. Si encuentra algo sale 2,
# explica por la salida de error qué saltó y deja una línea en
# docs/seguridad/registro-de-bloqueos.md. El registro nunca lleva el dato:
# un registro que repite el dato es otra copia del dato.
#
set -uo pipefail

entrada="$(cat)"
comando="$(printf '%s' "$entrada" | jq -r '.tool_input.command // empty' 2>/dev/null)"

# Solo nos interesan los commits. Cualquier otro comando pasa sin decir nada.
case "$comando" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

raiz="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -n "$raiz" ] && cd "$raiz" 2>/dev/null || exit 0

# Si el mismo comando prepara los cambios, lo que todavía no está en el índice
# también va a entrar: hay que mirarlo igual.
tambien_add=0
case "$comando" in
  *"git add"*) tambien_add=1 ;;
esac

# --- Las tres reglas -------------------------------------------------------
#
# Los literales van partidos ("sk-""ant-") para que el propio fichero de reglas
# no dispare las reglas que define.

pat_claves='AKIA[A-Za-z0-9]{16}'
pat_claves="$pat_claves|sk-""ant-"
pat_claves="$pat_claves|ghp""_[A-Za-z0-9]"
pat_claves="$pat_claves|github""_pat""_"
pat_claves="$pat_claves|AIza[A-Za-z0-9_-]{35}"
pat_claves="$pat_claves|xox[bpa]-"
pat_claves="$pat_claves|-----BEGIN [A-Z ]*PRIVATE KEY-----"
pat_claves="$pat_claves|APP""_KEY=.+"

pat_correo='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
# Lista corta a propósito: los ejemplos y las pruebas de este repo ya usan los
# dominios reservados para ejemplos.
pat_dominios_ok='@(example\.(com|org|net)|github\.com)$'

registro="docs/seguridad/registro-de-bloqueos.md"

anota() { # $1 regla, $2 archivo
  mkdir -p "$(dirname "$registro")" 2>/dev/null
  if [ ! -f "$registro" ]; then
    printf '%s\n' "# Registro de bloqueos del hook datos-que-no-salen.sh — una línea por bloqueo, nunca el dato detectado." > "$registro"
  fi
  printf '%s BLOQUEADO regla=%s archivo=%s\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1" "$2" >> "$registro"
}

bloquea() { # $1 regla, $2 archivo, $3 qué es
  anota "$1" "$2"
  {
    echo "BLOQUEADO: $3."
    echo "  regla:   $1"
    echo "  archivo: $2"
    echo
    echo "  Sustituye el dato por uno inventado (para correos, un dominio de ejemplo"
    echo "  reservado) y vuelve a intentar el commit."
    echo "  No desactives este hook ni lo rodees. El bloqueo ya está anotado en"
    echo "  $registro, que se commitea con el resto."
  } >&2
  exit 2
}

# --- Qué va a entrar -------------------------------------------------------

entradas=()
while IFS= read -r f; do
  [ -n "$f" ] && entradas+=("indice:$f")
done < <(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null)

if [ "$tambien_add" -eq 1 ]; then
  while IFS= read -r f; do
    [ -n "$f" ] && entradas+=("trabajo:$f")
  done < <(git diff --name-only --diff-filter=ACMR 2>/dev/null)
  while IFS= read -r f; do
    [ -n "$f" ] && entradas+=("nuevo:$f")
  done < <(git ls-files --others --exclude-standard 2>/dev/null)
fi

[ ${#entradas[@]} -eq 0 ] && exit 0

# Solo las líneas AÑADIDAS. De un fichero nuevo sin seguimiento, todo es nuevo.
lineas_anadidas() {
  local origen="${1%%:*}" ruta="${1#*:}"
  case "$origen" in
    indice)  git diff --cached -- "$ruta" 2>/dev/null | grep '^+' | grep -v '^+++' | sed 's/^+//' ;;
    trabajo) git diff          -- "$ruta" 2>/dev/null | grep '^+' | grep -v '^+++' | sed 's/^+//' ;;
    nuevo)   cat -- "$ruta" 2>/dev/null ;;
  esac
}

# Regla 3: el fichero .env, ese nombre exacto, en cualquier carpeta.
# Los .env.example no cuentan: el nombre base no es ".env".
for e in "${entradas[@]}"; do
  ruta="${e#*:}"
  if [ "$(basename -- "$ruta")" = ".env" ]; then
    bloquea "fichero-env" "$ruta" "un fichero .env entre lo que entra en el repositorio"
  fi
done

# Reglas 1 y 2, sobre el contenido añadido.
for e in "${entradas[@]}"; do
  ruta="${e#*:}"
  texto="$(lineas_anadidas "$e")"
  [ -n "$texto" ] || continue

  if printf '%s\n' "$texto" | grep -qE "$pat_claves"; then
    bloquea "clave-reconocible" "$ruta" "una clave con forma reconocible en las líneas añadidas"
  fi

  if printf '%s\n' "$texto" \
    | grep -oE "$pat_correo" \
    | grep -qviE "$pat_dominios_ok"; then
    bloquea "correo-no-ejemplo" "$ruta" "una dirección de correo con un dominio que no es de ejemplo"
  fi
done

exit 0
