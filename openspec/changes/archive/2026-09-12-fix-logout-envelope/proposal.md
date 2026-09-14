## Why

**H-03**, severidad media, abierto desde el Módulo 2. Todas las respuestas de éxito de la API van envueltas en `{ data }` salvo una: el cierre de sesión devuelve `{"message": "Logged out successfully"}` plano. Reproducido el 2026-09-12 contra el servidor de desarrollo con una cuenta de sonda: `200 {"message":"Logged out successfully"}`.

Estuvo abierto a propósito y **documentado como es**, y eso tuvo un precio que ya no compensa:

- Un cliente con un desenvolvedor genérico obtiene `undefined` en silencio. El nuestro no lo sufre solo porque `lib/api.ts` descarta ese cuerpo.
- La spec viva lo consagra como contrato: su escenario «Cierre de sesión correcto» exige la forma sin envoltorio.
- El revisor de CI tiene que recordarlo como excepción (`REVIEW.md`), y el contrato versionado lo explica en una descripción.
- El requisito «Forma de las respuestas de la API» dice «envolver los **datos de cuenta**», que es exactamente la redacción por la que la excepción cabía sin contradecirlo: un mensaje de cierre no es un dato de cuenta.

## What Changes

- El cierre de sesión responde `200 {"data": {"message": "Logged out successfully"}}`. Mismo código, mismo mensaje, dentro del envoltorio.
- La regla de forma pasa de «los datos de cuenta» a **toda respuesta de éxito de esta capability**, para que la próxima excepción sí contradiga un requisito.
- **BREAKING** para cualquier cliente que lea `message` en la raíz. El frontend del proyecto no lo lee.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `auth`: se modifican «Cierre de sesión» (escenario de la respuesta correcta) y «Forma de las respuestas de la API» (alcance del envoltorio).

## Impact

- Backend: `AccessTokensController.destroy` y el esquema `LogoutResponse` del contrato.
- Contrato: `docs/api/openapi.json` regenerado.
- Frontend: sin cambios de código. `logout` en `lib/api.ts` ya descarta el cuerpo.
- Sin dependencias nuevas, sin migración.
