## 1. Reproducir

- [x] 1.1 Reproducir H-03 contra el servidor de desarrollo con una cuenta de sonda, y dejar constancia de la respuesta: `200 {"message":"Logged out successfully"}` (2026-09-12)

## 2. Pruebas primero

- [x] 2.1 `session.spec.ts`: el cierre de sesión devuelve `{ data: { message } }` y `data` es la única clave de primer nivel. Verla en rojo contra el código actual
- [x] 2.2 Una prueba que recorra las cuatro respuestas de éxito de `auth` y exija `data` como única clave de primer nivel

## 3. Backend

- [x] 3.1 Pasar la respuesta de `AccessTokensController.destroy` por `serialize()`
- [x] 3.2 Cambiar `LogoutResponse` del contrato para que declare el envoltorio, y regenerar `docs/api/openapi.json`
- [x] 3.3 Ver las pruebas de 2.1 y 2.2 en verde, y verlas en rojo otra vez devolviendo el objeto plano (R-14)

## 4. Cierre

- [x] 4.1 Reproducir de nuevo contra el servidor de desarrollo: la respuesta ya va envuelta
- [x] 4.2 Comprobar en navegador que cerrar sesión desde el perfil sigue llevando a la pantalla de acceso sin aviso
- [x] 4.3 Cerrar H-03 en `docs/hallazgos.md` y retirarlo de los huecos declarados en `REVIEW.md` y en `docs/recorrido-por-modulo.md`
- [x] 4.4 `verificar-docs.mjs`, `openapi:check`, lint, typecheck y las dos suites en verde
