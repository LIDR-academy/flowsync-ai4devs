#!/usr/bin/env bash
# Guardarraíl de la regla del README: no deja terminar si backend/start/routes.ts
# declara un verbo HTTP que ningún README de docs/capabilities/ menciona.
# Tonto a propósito: mira verbos, no rutas. Solo actúa si el caso pone EVAL_GUARDARRAIL=1,
# para no cambiar el resultado de las demás demos, que cargan este mismo plugin.
[ "${EVAL_GUARDARRAIL:-}" = "1" ] || exit 0
entrada="$(cat)"
# Si ya se bloqueó una vez, no se insiste: evita un bucle si el agente no sabe arreglarlo.
echo "$entrada" | grep -q '"stop_hook_active": *true' && exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -f backend/start/routes.ts ] || exit 0
faltan=""
for v in get post put patch delete; do
  if grep -qE "router[[:space:]]*\.[[:space:]]*$v[[:space:]]*\(" backend/start/routes.ts; then
    V=$(printf '%s' "$v" | tr '[:lower:]' '[:upper:]')
    cat docs/capabilities/*/README.md 2>/dev/null | grep -q "$V" || faltan="$faltan $V"
  fi
done
[ -z "$faltan" ] && exit 0
echo "Regla del README: backend/start/routes.ts declara$faltan y ningún README de docs/capabilities/ lo documenta. Añade su fila a la tabla «Endpoints» del README de su capability antes de terminar." >&2
exit 2
