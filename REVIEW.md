# Calibración del revisor

Instrucciones para revisar cambios en este repositorio. Mandan sobre cualquier criterio general:
si algo no encaja aquí, no se reporta.

## 1. Qué es grave y qué no pasa de sugerencia

**Grave** (repórtalo siempre, con severidad crítico/alto):

- El código contradice un scenario de `openspec/specs/`. Cita el scenario. La spec es el árbitro.
- Una respuesta de la API expone un dato de cuenta que su transformer no debía llevar
  (el email del responsable es el caso que ya ocurrió una vez).
- Una ruta que debía exigir sesión no la exige, o la exige y no lo comprueba.
- `docs/api/openapi.json` promete algo que el código no hace: el contrato miente.
- Un comentario o un docblock afirma un comportamiento que el código no tiene. La discrepancia es
  el hallazgo, y manda el código.
- Pérdida o corrupción de datos, o un cambio que rompe a un consumidor existente sin migración.

**Sugerencia** (medio o menos; nunca la vendas como defecto):

- Estilo, nombres, orden de las funciones, dónde vive un fichero.
- «Esto podría extraerse», «esto se podría reutilizar», preferencias de arquitectura.
- Cobertura de tests para algo que ningún requisito de la spec exige.
- Rendimiento sin una medida detrás.

## 2. Cuántas sugerencias caben

Máximo **cinco** sugerencias menores por revisión, las cinco que más valgan. El resto no se enumera:
se cierra con una línea del tipo «7 sugerencias menores más, no listadas». Los hallazgos graves no
tienen tope: van todos.

## 3. Dónde no reportar

- Lo que ya vigila otra comprobación de este repositorio: formato y lint (`npm run lint`,
  `npm run format`), tipos (`npm run typecheck`), lo que cubren los tests (`npm test`) y la deriva
  del contrato (`.github/workflows/openapi-check.yml`). Si una herramienta ya lo va a decir en rojo,
  tu comentario sobra.
- Ficheros generados: `backend/.adonisjs/`, `backend/database/schema.ts`, `docs/api/openapi.json`.
  Se revisa lo que los genera, no ellos.
- `frontend/src/components/ui/`: son componentes de shadcn/ui, no se editan a mano.
- `node_modules/`, `package-lock.json`, `backend/tmp/`.
- Ficheros que el cambio no toca, salvo que el cambio los rompa: entonces el hallazgo es el cambio.

## 4. Cita el fichero y la línea, o no lo afirmes

Para decir que algo se comporta de una manera tienes que haber leído la línea que lo hace, y la
citas como `ruta/fichero.ts:120`. No deduzcas el comportamiento del nombre de una función, de un
docblock, del nombre de un test ni del mensaje del commit: en este repositorio ya ha pasado que el
comentario dijera una cosa y el código hiciera la contraria.

Si sospechas algo pero no puedes señalar la línea, va en una sección aparte titulada **Sin
confirmar**, nunca mezclado con lo demostrado. Un hallazgo sin evidencia cuesta más de lo que vale.
