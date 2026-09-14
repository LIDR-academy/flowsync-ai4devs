## Context

`providers/api_provider.ts` inyecta `ctx.serialize()`, que envuelve en `{ data }`, y la convención del proyecto es que toda respuesta pase por ahí. `AccessTokensController.destroy` es el único método que devuelve un objeto literal sin pasar por `serialize()`. Venía así en el andamiaje del curso y nunca se tocó.

## Goals / Non-Goals

**Goals:** que el cierre de sesión cumpla la convención, y que la spec viva pase a exigirla en lugar de consagrar la excepción.

**Non-Goals:** cambiar el código de estado, el mensaje o la semántica de revocación. Tocar el frontend.

## Decisions

### D1 · Envolver el mensaje, no quitar el cuerpo

Se responde `200 {"data": {"message": "Logged out successfully"}}` pasando el objeto por `serialize()`.

**Alternativa descartada: `204 No Content`.** Es la respuesta más honesta para una operación que no devuelve nada, y el frontend la soportaría: `request()` ya tolera un cuerpo que no se puede parsear. Se descarta porque cambia **dos** cosas del contrato -código y cuerpo- para cerrar un hallazgo que solo trata de una, y porque dejaría al cierre de sesión como la única respuesta de éxito sin cuerpo, que es otra excepción con otra forma.

### D2 · La regla de forma se amplía en la spec, no solo en el código

El requisito «Forma de las respuestas de la API» decía «envolver los datos de cuenta», y un mensaje de cierre no es un dato de cuenta. Por esa redacción H-03 convivió con el requisito sin contradecirlo. Se amplía a toda respuesta de éxito de la capability, con un escenario que lo recorre.

## Risks / Trade-offs

- **Cliente externo que lea `message` en la raíz** → recibe `undefined`. No hay ninguno conocido: el único cliente es `frontend/`, que descarta el cuerpo. Se declara como BREAKING en la propuesta.
- **Una prueba que compruebe solo `data.message`** seguiría en verde si alguien añadiera un `message` también en la raíz. Por eso el escenario exige que `data` sea la única clave de primer nivel.
