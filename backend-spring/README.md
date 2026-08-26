# FlowSync API (Spring Boot)

Migración del backend de FlowSync desde AdonisJS a Spring Boot. Cubre lo que
existe hoy en `../backend` (rama `s1/start`): signup, login, logout y
perfil autenticado.

## Stack

- Java 21
- Spring Boot 4.1 (Web, Data JPA, Security, Validation, Flyway)
- H2 embebido (archivo en `./data` para dev, en memoria para tests)
- JWT (jjwt) para autenticación stateless
- Flyway para migraciones versionadas (equivalente a `database/migrations/*.ts` de Lucid)
- Spotless + google-java-format para lint/format (equivalente a los scripts `lint`/`format` de Adonis)

## Requisitos

- JDK 21 (`java -version`)
- No requiere Maven instalado globalmente: usa el wrapper `./mvnw`

## Correr en desarrollo

```bash
cd backend-spring
./mvnw spring-boot:run
```

Arranca en `http://localhost:8080`. La base de datos H2 se persiste en
`./data/flowsync-dev.mv.db` (ignorada por git). Consola web disponible en
`http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/flowsync-dev`,
user `sa`, sin password).

El esquema lo crea Flyway al arrancar (`src/main/resources/db/migration/V1__create_users_table.sql`),
no Hibernate: `spring.jpa.hibernate.ddl-auto=validate` solo verifica que las
entidades coincidan con lo que Flyway ya migró.

## Correr tests

```bash
./mvnw test
```

Los tests usan H2 en memoria (`src/test/resources/application-test.properties`),
sin tocar la base de datos de desarrollo. Flyway corre igual ahí, sobre el
esquema en memoria.

## Lint / format

```bash
./mvnw spotless:check   # equivalente a "npm run lint"
./mvnw spotless:apply   # equivalente a "npm run format"
```

`./mvnw verify` corre tests + `spotless:check` (falla si el código no está
formateado).

## Variables de entorno (opcionales)

| Variable | Default | Descripción |
|---|---|---|
| `JWT_SECRET` | secreto de dev (cambiar en prod) | clave HMAC para firmar los JWT |
| `JWT_EXPIRATION_MINUTES` | `1440` (24h) | expiración del token |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | orígenes permitidos, separados por coma |

## Endpoints

| Método | Ruta | Auth | Equivalente Adonis |
|---|---|---|---|
| GET | `/` | No | `router.get('/', ...)` |
| POST | `/api/v1/auth/signup` | No | `NewAccountController.store` |
| POST | `/api/v1/auth/login` | No | `AccessTokensController.store` |
| GET | `/api/v1/account/profile` | Sí (Bearer JWT) | `ProfileController.show` |
| POST | `/api/v1/account/logout` | Sí (Bearer JWT) | `AccessTokensController.destroy` |

> Con JWT stateless no hay token que revocar del lado servidor: el logout
> real ocurre al descartar el token en el cliente. Si se necesita
> invalidación server-side, añadir una blacklist (p. ej. Redis).

## Contrato de respuesta (paridad con AdonisJS)

AdonisJS envuelve en `{ "data": ... }` solo las respuestas que pasan por
`ctx.serialize()` (ver `providers/api_provider.ts`); las que devuelven el
objeto plano (logout, `/`) no se envuelven. Este backend replica exactamente
ese comportamiento:

| Endpoint | Envuelto en `data` |
|---|---|
| `GET /` | No |
| `POST /api/v1/auth/signup` | Sí |
| `POST /api/v1/auth/login` | Sí |
| `GET /api/v1/account/profile` | Sí |
| `POST /api/v1/account/logout` | No |

Errores de validación (payload inválido o email duplicado) devuelven
**422** con el shape de VineJS: `{ "errors": [{ "message", "rule", "field" }] }`.
Cualquier ruta inexistente o excepción no prevista responde siempre JSON
(nunca la página Whitelabel HTML de Spring por defecto).

## Otros detalles de paridad con Adonis

- **Request id**: cada respuesta trae el header `X-Request-Id` (equivalente
  a `generateRequestId: true` en `config/app.ts`), y el mismo valor queda en
  el MDC de los logs (`%X{requestId}`) para correlacionar.
- **Headers de seguridad** (equivalente a `config/shield.ts`): `X-Frame-Options: DENY`
  en toda la API; se relaja a `SAMEORIGIN` únicamente en `/h2-console/**`
  (cadena de seguridad separada), nunca globalmente.

## Pendiente (fuera de alcance de este scaffold)

- Dominio de tareas/equipos (no existe todavía ni en el original Adonis).
- Migrar de H2 a Postgres para producción (cambiar `spring.datasource.url` y
  el driver; las migraciones de Flyway son SQL estándar y no deberían
  requerir cambios).
- CI y Testcontainers para tests de integración con Postgres real.
