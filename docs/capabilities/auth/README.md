# Capability: `auth`

La puerta de entrada: crear una cuenta, entrar con email y contraseña, conservar la sesión entre visitas y cerrarla. Sin sesión válida no se accede a ningún dato de cuenta ni a ninguna tarea.

> **Dónde está la verdad.** Las reglas viven en **[`openspec/specs/auth/spec.md`](../../../openspec/specs/auth/spec.md)**, y este README **no las repite**: enlaza a cada una y dice dónde está implementada. Si algo de aquí y la spec no concuerdan, manda la spec ([ADR-0001](../../adr/0001-openspec-como-fuente-de-verdad.md)).
>
> La spec se escribió por ingeniería inversa sobre código que ya existía, en el Módulo 3. Es un atajo que OpenSpec desaconseja y se tomó a propósito una vez; lo que salió al contrastarla está en [`docs/hallazgos.md`](../../hallazgos.md), H-03, H-04 y H-06.

## Endpoints

Todos bajo `/api/v1`, declarados en [`backend/start/routes.ts`](../../../backend/start/routes.ts).

| Método y ruta | Entrada | Controlador | Sesión | Devuelve |
|---|---|---|---|---|
| `POST /auth/signup` | `{ fullName, email, password, passwordConfirmation }` | [`NewAccountController.store`](../../../backend/app/controllers/new_account_controller.ts) | no | `200` · `{ user, token }` |
| `POST /auth/login` | `{ email, password }` | [`AccessTokensController.store`](../../../backend/app/controllers/access_tokens_controller.ts) | no | `200` · `{ user, token }`; `400` si las credenciales no valen |
| `GET /account/profile` | - | [`ProfileController.show`](../../../backend/app/controllers/profile_controller.ts) | sí | `200` · la cuenta del token |
| `POST /account/logout` | - | [`AccessTokensController.destroy`](../../../backend/app/controllers/access_tokens_controller.ts) | sí | `200` · `{ message }` y el token deja de valer |

Toda respuesta de éxito va envuelta en `{ "data": ... }`, **también la de cerrar sesión**: hasta el 2026-09-12 esa salía sin envolver, y era H-03. Una ruta protegida sin token, con uno inventado o con uno revocado responde `401`.

La cuenta sale siempre por [`UserTransformer`](../../../backend/app/transformers/user_transformer.ts):

```json
{ "id": 1, "fullName": "Ada Lovelace", "email": "ada@example.com", "initials": "AL",
  "createdAt": "...", "updatedAt": "..." }
```

`fullName` puede llegar `null`: es nulable, no opcional (H-04). La contraseña y su hash no salen nunca.

## Reglas de negocio: dónde vive cada una

| Área | Implementada en | Requisito que manda |
|---|---|---|
| Registrarse devuelve un token ya utilizable | `NewAccountController.store` | [Registro de una cuenta nueva](../../../openspec/specs/auth/spec.md#requirement-registro-de-una-cuenta-nueva) |
| Email válido de hasta 254 caracteres, contraseña de 8 a 32, confirmación igual | `signupValidator` · [`validators/user.ts`](../../../backend/app/validators/user.ts) | [Validación de los datos de registro](../../../openspec/specs/auth/spec.md#requirement-validación-de-los-datos-de-registro) |
| Un email, una cuenta, sin distinguir mayúsculas | `email()` normaliza a minúsculas **antes** de `unique`, y dos migraciones lo imponen en la base (H-11) | [Un email, una sola cuenta](../../../openspec/specs/auth/spec.md#requirement-un-email-una-sola-cuenta) |
| Credenciales incorrectas responden igual exista o no la cuenta | `User.verifyCredentials` · [`models/user.ts`](../../../backend/app/models/user.ts) | [Inicio de sesión con email y contraseña](../../../openspec/specs/auth/spec.md#requirement-inicio-de-sesión-con-email-y-contraseña) |
| El perfil sirve también para comprobar un token | `ProfileController.show` | [Consulta del perfil de la sesión activa](../../../openspec/specs/auth/spec.md#requirement-consulta-del-perfil-de-la-sesión-activa) |
| Cerrar sesión revoca solo el token usado | `AccessTokensController.destroy` | [Cierre de sesión](../../../openspec/specs/auth/spec.md#requirement-cierre-de-sesión) |
| Todo `/account` exige sesión | `.use(middleware.auth())` sobre el grupo · `start/routes.ts` | [Protección de los recursos de cuenta](../../../openspec/specs/auth/spec.md#requirement-protección-de-los-recursos-de-cuenta) |
| JSON, envuelto en `data`, sin contraseña | [`providers/api_provider.ts`](../../../backend/providers/api_provider.ts) y `UserTransformer` | [Forma de las respuestas de la API](../../../openspec/specs/auth/spec.md#requirement-forma-de-las-respuestas-de-la-api) |
| Iniciales desde el nombre, o desde el email si no hay nombre | getter `initials` · `models/user.ts` | [Iniciales de la cuenta](../../../openspec/specs/auth/spec.md#requirement-iniciales-de-la-cuenta) |

Los tokens son **opacos** y se guardan en la tabla `auth_access_tokens` (`DbAccessTokensProvider`). **No caducan**: dejan de valer al cerrar sesión con ellos.

## En el frontend

| Área | Implementada en | Requisito que manda |
|---|---|---|
| Pantallas de acceso y perfil | [`pages/register-page.tsx`](../../../frontend/src/pages/register-page.tsx), [`pages/login-page.tsx`](../../../frontend/src/pages/login-page.tsx), [`pages/profile-page.tsx`](../../../frontend/src/pages/profile-page.tsx) | [Pantalla de registro](../../../openspec/specs/auth/spec.md#requirement-pantalla-de-registro), [de inicio de sesión](../../../openspec/specs/auth/spec.md#requirement-pantalla-de-inicio-de-sesión) y [de perfil](../../../openspec/specs/auth/spec.md#requirement-pantalla-de-perfil) |
| Errores en castellano, bajo su campo | `ApiError` · [`lib/api.ts`](../../../frontend/src/lib/api.ts) y `use-auth-form.ts`. Depende de los nombres de regla de VineJS, que fija `nombres_de_regla.spec.ts` (H-05) | [Errores comprensibles en los formularios de acceso](../../../openspec/specs/auth/spec.md#requirement-errores-comprensibles-en-los-formularios-de-acceso) |
| La sesión sobrevive a recargar | Token en `localStorage` bajo `flowsync.token`, revalidado contra el perfil al arrancar · [`auth/auth-provider.tsx`](../../../frontend/src/auth/auth-provider.tsx). Guardarlo ahí es deuda aceptada (H-06) | [Persistencia de la sesión entre visitas](../../../openspec/specs/auth/spec.md#requirement-persistencia-de-la-sesión-entre-visitas) |
| Un `401` en cualquier llamada cierra la sesión y explica por qué | `onUnauthorized` en `lib/api.ts`, con un solo suscriptor en el proveedor (H-13, H-37) | [Recuperación de una sesión que ya no vale](../../../openspec/specs/auth/spec.md#requirement-recuperación-de-una-sesión-que-ya-no-vale) |
| Servidor caído no es credencial rechazada | `auth-provider.tsx`: cierra en memoria y **conserva** el token (H-38) | [Aviso cuando el servidor no está disponible](../../../openspec/specs/auth/spec.md#requirement-aviso-cuando-el-servidor-no-está-disponible) |
| Qué pantallas ve quien tiene sesión y quien no | [`routes/protected-route.tsx`](../../../frontend/src/routes/protected-route.tsx) y [`public-only-route.tsx`](../../../frontend/src/routes/public-only-route.tsx) | [Acceso a las pantallas según el estado de la sesión](../../../openspec/specs/auth/spec.md#requirement-acceso-a-las-pantallas-según-el-estado-de-la-sesión) |

## Cómo se prueba en local

```bash
cd backend && node ace test --files=signup      # o login, session, email_mayusculas, initials
cd frontend && npm test                          # lib/api.ts: traducción de errores y 401
cd frontend && npm run test:e2e                  # token revocado y servidor caído, en navegador
```

Las pruebas están en [`backend/tests/functional/auth/`](../../../backend/tests/functional/auth/) y en [`frontend/e2e/sesion.e2e.ts`](../../../frontend/e2e/sesion.e2e.ts). Qué requisito cubre cada una y cuáles de pantalla siguen sin prueba, en [`docs/trazabilidad.md`](../../trazabilidad.md).

A mano, con el backend arrancado:

```bash
# Registro: devuelve la cuenta y un token
curl -s -X POST http://localhost:3333/api/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com","password":"secreto123","passwordConfirmation":"secreto123"}'

# Login con el mismo email en mayúsculas: entra igual
curl -s -X POST http://localhost:3333/api/v1/auth/login \
  -H 'Content-Type: application/json' -d '{"email":"ADA@example.com","password":"secreto123"}'

# Perfil y cierre de sesión, con el token de la respuesta anterior
curl -s http://localhost:3333/api/v1/account/profile -H "Authorization: Bearer $TOKEN"
curl -s -X POST http://localhost:3333/api/v1/account/logout -H "Authorization: Bearer $TOKEN"
```

Esto escribe en la base de desarrollo. Para dejarla como estaba, `node ace migration:fresh`.
