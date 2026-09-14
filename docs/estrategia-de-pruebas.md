# Estrategia de pruebas

> Qué capa cubre qué, cuándo merece una prueba su coste, y qué **no** se mide. Una página. El número de pruebas no está aquí a propósito: lo da `CLAUDE.md` y lo contrasta CI.
>
> Escrita el 2026-09-13. Qué escenario cubre cada prueba, en [`trazabilidad.md`](trazabilidad.md).

## Las capas, y qué decide cada una

| Capa | Runner | Dónde | Qué fija | Qué no ve |
|---|---|---|---|---|
| **Unitaria** | Japa `unit` | `backend/tests/unit/` | Reglas puras de los modelos: `isOverdueOn`, `initials`. Sin base ni HTTP, en milisegundos, y el fallo dice qué condición se rompió | Que la regla llegue por el cable |
| **Unitaria** | Vitest | `frontend/src/lib/*.test.ts` | El único punto de contacto con la API: desenvolver `{ data }`, traducir errores a castellano, el aviso de 401; y dónde entra en pantalla una tarea nueva | Nada que monte un componente |
| **Integración** | Japa `functional` | `backend/tests/functional/` | La API real contra la base de pruebas: cada escenario de la spec que se observa en una respuesta HTTP, la forma de los errores, el aislamiento de la base, los nombres de regla que el frontend traduce | La pantalla |
| **Navegador** | Playwright | `frontend/e2e/` | Lo que solo se ve en pantalla y ninguna otra capa veía: un token revocado, el servidor caído, dónde entra una tarea creada y que la fila no salta | Cuesta segundos por caso; por eso son pocas |
| **Contrato** | `openapi:check` | CI | Que `docs/api/openapi.json` sea lo que el código genera | Que el contrato sea correcto: eso lo revisa una persona, y el revisor de CI |
| **Documentación** | `verificar-docs.mjs` | CI | Que lo que los documentos afirman del código sea cierto | Si un documento sigue siendo útil |
| **Las comprobaciones mismas** | `mutaciones.mjs` | CI | Que cada comprobación se ponga en rojo con el defecto que dice cubrir | Defectos que nunca existieron |

## Dónde va una prueba nueva

1. **Una regla de dominio** (una condición, un cálculo): unitaria en `tests/unit/`, y **además** el escenario por la API si la spec lo describe como respuesta. La unitaria dice qué se rompió; la funcional, que sigue saliendo por el cable.
2. **Un escenario de la spec que se observa en una respuesta HTTP**: funcional, un caso por escenario, citando el requisito en la cabecera del fichero.
3. **Un escenario que solo se observa en pantalla**: Playwright, solo si nada más lo ve. Preparar el estado por la API, comprobar en pantalla.
4. **Un bug**: primero la prueba que lo reproduce en rojo, en la capa más baja que lo vea; luego el arreglo. CI rechaza el `fix:` sin prueba (R-08).
5. **Una comprobación nueva** (verificador, CI, hook): su entrada en el catálogo de mutaciones, vista morder por su motivo.

## Lo que no se mide, y por qué

- **Porcentaje de cobertura de líneas.** La métrica es qué escenario de la spec tiene prueba, no qué línea se ejecuta. Un 90 % con la regla de vencida sin el tercer caso es lo que había en `s4/start` (H-15).
- **Rendimiento.** Se midió una vez a mano (crear una tarea, 21 ms de mediana en build de producción) y no hay umbral en CI: sin usuarios reales no hay número que defender.
- **Requisitos de pantalla, la mayoría.** Declarados sin prueba en `trazabilidad.md` §3.2. Se cubren cuando algo se rompe una vez, no antes.

## Reglas que no se negocian

- La suite **nunca** escribe en la base de desarrollo: `bin/test.ts` fuerza `NODE_ENV=test` y `config/database.ts` elige el fichero ([ADR-0003](adr/0003-aislamiento-de-la-base-de-datos-en-pruebas.md)).
- Cada fichero funcional aísla sus casos con `withGlobalTransaction()`.
- Japa y Playwright no corren a la vez: comparten puerto 3334 y base, a propósito.
- El número de pruebas vive en `CLAUDE.md` y en ningún otro sitio; `scripts/recuento-pruebas.mjs` lo contrasta con lo que ejecuta cada runner.
