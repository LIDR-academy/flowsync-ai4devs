#!/usr/bin/env bash
# PreToolUse (matcher Bash). Bloquea `git commit` cuando lo que va a entrar en
# el índice trae una clave reconocible, un correo real o el fichero `.env`.
# Nunca imprime ni registra el valor encontrado: solo la regla y el fichero.
set -uo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG_FILE="$PROJECT_DIR/docs/seguridad/registro-de-bloqueos.md"

entrada_json="$(cat)"
comando="$(printf '%s' "$entrada_json" | jq -r '.tool_input.command // empty')"

case "$comando" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

incluir_sin_preparar=0
case "$comando" in
  *"git add"*) incluir_sin_preparar=1 ;;
esac

# Regla 1: claves con forma reconocible (AWS, Anthropic, GitHub, Google,
# Slack, bloque de clave privada, o la variable APP_KEY con un valor real).
#
# Los tokens puramente literales (Anthropic, GitHub, la variable de app) se
# construyen aquí concatenando dos trozos entre comillas adyacentes: el valor
# final que usa `grep` es el correcto, pero el propio código fuente de este
# fichero deja de contener el token seguido y no se autodetecta como fuga al
# entrar él mismo en un commit.
_tok_anthropic='sk-ant''-'
_tok_ghp='ghp''_'
_tok_ghpat='github_pat''_'
_tok_appkey='APP_KEY''=.+'
SECRET_REGEX="AKIA[0-9A-Z]{16}|${_tok_anthropic}|${_tok_ghp}|${_tok_ghpat}|AIza[0-9A-Za-z_-]{35}|xox[bpa]-|-----BEGIN[A-Z ]*PRIVATE KEY-----|${_tok_appkey}"

# Regla 2: dominios de correo que SÍ se admiten porque son de ejemplo/prueba.
DOMINIOS_PERMITIDOS=" example.com example.org example.net github.com "

bloquear() {
  local regla="$1" archivo="$2"
  local marca
  marca="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  mkdir -p "$(dirname -- "$LOG_FILE")"
  if [ ! -f "$LOG_FILE" ]; then
    printf '%s\n' "# Registro de commits bloqueados por datos-que-no-salen.sh (fecha UTC, regla, archivo — nunca el valor encontrado)" > "$LOG_FILE"
  fi
  printf '%s BLOQUEADO regla=%s archivo=%s\n' "$marca" "$regla" "$archivo" >> "$LOG_FILE"

  case "$regla" in
    clave-reconocible)
      echo "Bloqueado: clave o secreto con forma reconocible en '$archivo'. Sustituye el valor real por uno inventado y reintenta el commit." >&2
      ;;
    email-no-permitido)
      echo "Bloqueado: correo con dominio real en '$archivo'. Sustituye el correo por uno inventado (dominio example.com) y reintenta el commit." >&2
      ;;
    archivo-env)
      echo "Bloqueado: el fichero '.env' entra en el commit ('$archivo'). Quítalo (usa .env.example) y reintenta." >&2
      ;;
  esac
  exit 2
}

# Contenido que EL COMMIT AÑADE para un fichero dado, según de dónde venga.
contenido_anadido() {
  local origen="$1" archivo="$2"
  case "$origen" in
    staged)
      git -C "$PROJECT_DIR" diff --cached -- "$archivo" 2>/dev/null | grep -a '^+' | grep -av '^+++'
      ;;
    unstaged)
      git -C "$PROJECT_DIR" diff -- "$archivo" 2>/dev/null | grep -a '^+' | grep -av '^+++'
      ;;
    untracked)
      # Fichero nuevo sin seguimiento: todo su contenido es "añadido".
      cat -- "$PROJECT_DIR/$archivo" 2>/dev/null
      ;;
  esac
}

# Reglas 1 y 2 sobre el contenido añadido de un fichero.
chequear_contenido() {
  local archivo="$1" contenido="$2"

  if printf '%s\n' "$contenido" | grep -aqE "$SECRET_REGEX"; then
    bloquear "clave-reconocible" "$archivo"
  fi

  local correo dominio dominio_min
  while IFS= read -r correo; do
    [ -z "$correo" ] && continue
    dominio="${correo#*@}"
    dominio_min="$(printf '%s' "$dominio" | tr '[:upper:]' '[:lower:]')"
    case "$DOMINIOS_PERMITIDOS" in
      *" $dominio_min "*) continue ;;
      *) bloquear "email-no-permitido" "$archivo" ;;
    esac
  done < <(printf '%s\n' "$contenido" | grep -aoE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
}

# Ficheros que ENTRAN en el commit: preparados siempre; si el comando también
# hace `git add`, además los que aún están sin preparar y los nuevos sin
# seguimiento (el `add` todavía no ha corrido cuando este hook se ejecuta).
mapfile -t FICHEROS_PREPARADOS < <(git -C "$PROJECT_DIR" diff --cached --name-status 2>/dev/null | awk -F'\t' '$1 != "D" { print $2 }')

FICHEROS_SIN_PREPARAR=()
FICHEROS_SIN_SEGUIR=()
if [ "$incluir_sin_preparar" -eq 1 ]; then
  mapfile -t FICHEROS_SIN_PREPARAR < <(git -C "$PROJECT_DIR" diff --name-status 2>/dev/null | awk -F'\t' '$1 != "D" { print $2 }')
  mapfile -t FICHEROS_SIN_SEGUIR < <(git -C "$PROJECT_DIR" ls-files --others --exclude-standard 2>/dev/null)
fi

for archivo in "${FICHEROS_PREPARADOS[@]}"; do
  [ -z "$archivo" ] && continue
  chequear_contenido "$archivo" "$(contenido_anadido staged "$archivo")"
done
for archivo in "${FICHEROS_SIN_PREPARAR[@]}"; do
  [ -z "$archivo" ] && continue
  chequear_contenido "$archivo" "$(contenido_anadido unstaged "$archivo")"
done
for archivo in "${FICHEROS_SIN_SEGUIR[@]}"; do
  [ -z "$archivo" ] && continue
  chequear_contenido "$archivo" "$(contenido_anadido untracked "$archivo")"
done

# Regla 3: el fichero `.env` exacto entre lo que entra (`.env.example` no cuenta).
for archivo in "${FICHEROS_PREPARADOS[@]}" "${FICHEROS_SIN_PREPARAR[@]}" "${FICHEROS_SIN_SEGUIR[@]}"; do
  [ -z "$archivo" ] && continue
  if [ "$(basename -- "$archivo")" = ".env" ]; then
    bloquear "archivo-env" "$archivo"
  fi
done

exit 0
