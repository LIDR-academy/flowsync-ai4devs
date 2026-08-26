# Cómo se revisa en FlowSync

Calibración del revisor —el de CI (`.github/workflows/revisor.yml`) y el subagente local
`adversarial-reviewer`—. Léela entera antes de mirar el cambio.

## 1. Qué es grave aquí

Solo estas cinco cosas. Todo lo demás es sugerencia.

- **Contradice un scenario de `openspec/specs/`.** La spec es la fuente de verdad. Cita el
  scenario por su título; sin scenario, no es grave.
- **Un camino que falla en silencio.** Devuelve `200` donde la spec pide un error, ignora un
  parámetro inválido, o deja la interfaz cargando sin salida.
- **Una respuesta filtra datos que la spec no autoriza** junto al recurso que devuelve.
- **Una ruta que debería exigir sesión y no la exige.**
- **El código contradice lo que su propio comentario, su README o la spec dicen que hace.**
  Esa mentira es lo que hace que un fallo sobreviva a la siguiente lectura.

## 2. Sugerencias: tres, y el resto contadas

Nada de lo anterior es una sugerencia; nada de lo siguiente es grave: cobertura de tests que
no protege un hallazgo grave, estructura alternativa con el mismo comportamiento, rendimiento
sin una medición detrás, nombres, comentarios.

**Máximo 3 sugerencias menores por revisión**, las de más valor. El resto no se detalla: una
sola línea al final del resumen con el recuento por categoría — «7 menores más: 4 de nombres,
3 de cobertura». Veinte comentarios menores entierran el que importa.

## 3. Dónde no se reporta

Nada de esto entra en la revisión, ni como sugerencia:

- **Generado:** `backend/.adonisjs/`, `backend/database/schema.ts`, `docs/api/openapi.json`,
  `frontend/src/components/ui/` (shadcn), `package-lock.json`.
- **Ya vigilado por otra comprobación** — si falla, falla ahí y con mejor mensaje:
  formato y estilo (`npm run lint`, oxlint, Prettier), tipos (`npm run typecheck`,
  `npm run build`), tests (`npm test`) y si el documento OpenAPI se ha quedado atrás
  (workflow `OpenAPI`, `npm run openapi:check`).
- **Fuera del cambio:** deuda preexistente que el diff no toca.
- **Ya dicho:** un hallazgo que ya tiene un comentario en este PR.

## 4. Afirmar exige haber mirado

Para decir que algo se comporta de una manera, **cita `fichero:línea` del sitio donde lo has
visto**, abierto con Read. Un nombre es una hipótesis, no una prueba: `listTasksValidator` no
demuestra que valide nada, y un validador que acepta cualquier cadena se llama igual que uno
que no.

El diff tampoco basta: enseña las líneas cambiadas, no lo que las rodea. Abre el fichero.

Si no has podido abrirlo, dilo — «no verificado: no pude leer X» es un hallazgo honesto.
Afirmarlo igualmente no lo es, y aquí cuesta más una revisión que hay que comprobar que una
que se deja algo.
