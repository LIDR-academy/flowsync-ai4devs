# Cómo se revisa este repositorio

Instrucciones para quien revisa un cambio, humano o agente. Las convenciones del proyecto están en
`CLAUDE.md`; esto es otra cosa: **qué decir, qué callar y con qué pruebas.**

## Qué es grave

Un hallazgo **grave** es uno de estos cuatro. Solo estos:

1. **Contradice la spec.** El código incumple un scenario de `openspec/specs/<capability>/spec.md`.
   La spec manda sobre el código ([ADR 0001](docs/adr/0001-openspec-como-fuente-de-verdad.md)). Cita
   el requisito y el scenario que se rompe.
2. **Publica o expone lo que no debe.** Un campo de más en una respuesta —email, hash, token—, o una
   ruta sin `middleware.auth()` que debería llevarlo.
3. **Se rompe con una entrada alcanzable.** Un id no numérico, un parámetro inventado, una fecha que
   no existe, un cuerpo vacío. «Romperse» incluye responder `200` a lo que debía ser un error y `500`
   a lo que debía ser un `422`.
4. **Deja el contrato desincronizado.** Toca rutas, controladores, validadores o transformers sin
   regenerar `docs/api/openapi.json` ni poner al día `docs/capabilities/<nombre>/README.md`.

Todo lo demás es **sugerencia**: nombres, estructura, duplicación, comentarios, un test que faltaría,
una abstracción más limpia. Decirlo está bien. Presentarlo como si fuera grave, no.

## Tope de sugerencias

**Cinco sugerencias por revisión como máximo**, las cinco que más valgan. El resto **no se enumera**:
una línea al final con cuántas son y de qué van.

> Otras 12 sugerencias menores: 7 de nombres, 3 de duplicación, 2 de comentarios.

Los hallazgos graves no tienen tope. Si hay nueve, van los nueve.

## Dónde no se reporta

Nada de esto se comenta, ni aunque esté mal:

- **Lo que ya vigila otra comprobación.** Formato (`prettier`), lint (`eslint` en backend, `oxlint`
  en frontend), tipos (`npm run typecheck`, `npm run build`), tests (`node ace test`) y la deriva del
  documento OpenAPI (`npm run openapi:check`, en CI). Si un check lo caza, el comentario sobra.
- **Código generado**: `backend/database/schema.ts`, `backend/.adonisjs/`, `docs/api/openapi.json` y
  `frontend/src/components/ui/` (shadcn). Se regeneran; no se editan a mano.
- **Ficheros que el cambio no toca**, salvo que el cambio los rompa.
- **`node_modules/`, lockfiles y `tmp/`.**
- **El estilo del proyecto**: `semi: false`, comillas simples, comentarios en castellano, imports por
  subpath (`#models/*`). Es deliberado, no un descuido.
- **La versión del stack.** AdonisJS 7, Lucid 22, VineJS 4, TypeScript 6, React 19 y Vite 8 van por
  delante de la documentación que te sabes. Que una API no te suene no es un hallazgo: compruébala en
  los `.d.ts` de `node_modules` antes de decir nada.

## Cita o calla

Para afirmar que el código **se comporta** de una manera, cita `fichero.ts:línea` con lo que has
leído ahí. Sin cita, no se afirma.

**Deducirlo del nombre no vale.** Un `listTasksValidator` puede aceptar cualquier texto, un
`task_assignee_transformer` puede estar publicando el email, un `isOverdueOn` puede tener el signo
cambiado, y un comentario puede afirmar lo contrario de lo que hace la línea de debajo. El nombre
dice la intención; la línea dice el comportamiento, y son cosas distintas.

Un hallazgo grave sin cita no es grave: es una sospecha. Va como sugerencia, o no va.
