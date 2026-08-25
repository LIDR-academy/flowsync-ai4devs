# Cómo se revisa en este repo

Instrucciones para quien revisa código aquí — el subagente `adversarial-reviewer`, el
workflow `revisor.yml` o una persona. Solo para revisiones: cómo se trabaja está en
`CLAUDE.md`.

## Qué es un hallazgo grave

Solo estas seis cosas. Si no encaja en ninguna, no es grave:

1. **Contradice un scenario de `openspec/specs/`.** La spec manda sobre el código
   ([ADR 0001](docs/adr/0001-openspec-como-fuente-de-verdad.md)). Cita el Requirement, el
   Scenario y el input concreto que lo rompe.
2. **Deja de distinguir dos cosas que la spec exige distinguir** — un `422` que se convierte
   en lista vacía, un error de red que se muestra como «no hay nada».
3. **Filtra datos de cuenta** en una respuesta o en la interfaz.
4. **Deja al usuario ante una pantalla en carga eterna o ante una afirmación falsa.**
5. **Un comentario afirma un comportamiento que el código no tiene.** Cuenta como grave por sí
   solo: desactiva la revisión de quien lea después. Los dos bugs reales de esta capability son
   exactamente eso.
6. **Contrato sin actualizar**: el cambio toca rutas, controladores, validadores o transformers
   y no lleva `docs/api/openapi.json` y el diff de `backend/.adonisjs/` en el mismo commit.

## Qué no pasa de sugerencia

Nombres, orden de funciones y colocación de ficheros. Estilo que el formateador no marca.
Refactors «por claridad» sin un defecto detrás. Falta de tests en general —salvo que falte
justo el scenario que el cambio dice cumplir—. Optimizaciones sin medir, en un proyecto de
práctica contra SQLite local. «Se podría añadir X» cuando ninguna spec pide X.

## Tope de sugerencias

**Máximo 5 sugerencias menores por revisión**, las cinco de más valor. El resto **no se
enumera**: una línea al final contándolas por categoría — «12 más: 6 de nombres, 4 de
comentarios, 2 de estructura». Si no hay nada grave, se dice en una frase y se acabó; rellenar
con observaciones menores entrena a que no se lea ninguna.

## Dónde no se reporta

- **Código generado**: `backend/database/schema.ts`, `backend/.adonisjs/`,
  `frontend/src/components/ui/` (shadcn). Se regeneran; el hallazgo, si lo hay, está en la
  fuente que los genera.
- **Lo que ya vigila otra comprobación del repo** — si falla, falla ahí, con mejor detalle:
  | Ya lo vigila | No lo reportes |
  |---|---|
  | `npm run lint` / `format` (eslint + prettier, oxlint en el frontend) y el hook `PostToolUse` | formato, comillas, punto y coma, reglas de lint |
  | `npm run typecheck` y `npm run build` | errores de tipos |
  | `npm run openapi:check` y `.github/workflows/openapi.yml` | el diff del documento OpenAPI campo a campo — solo si falta del commit |
  | `node ace test` | tests que están en rojo |
- `openspec/changes/archive/`: historia, no código vivo.
- Decisiones ya registradas en `docs/adr/`. Discrepar de un ADR es proponer un ADR nuevo, no
  levantar un hallazgo.

## Cita la línea o no lo afirmes

Toda afirmación sobre cómo se comporta el código lleva `fichero:línea` de donde lo has visto.
No se deduce de un nombre, ni de un comentario —en este repo los comentarios han mentido—, ni
de que «así se suele hacer». «Valida», «filtra», «protege», «ignora» exigen la línea que lo
hace. Si no has abierto el fichero, formúlalo como pregunta o no lo digas.

**Un hallazgo sin fichero:línea se descarta sin discutirlo.**
