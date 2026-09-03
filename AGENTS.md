# Guía del repositorio

## Estructura del proyecto y organización de módulos

FlowSync está organizado como un pequeño monorepo full-stack:

- `frontend/` contiene el cliente React 19 + TypeScript + Vite. Los puntos de entrada de la interfaz están en `frontend/src/`; los archivos estáticos están en `frontend/public/` y las imágenes e iconos en `frontend/src/assets/`.
- `backend-spring/` es la API actual con Spring Boot (Java 21). El código está en `src/main/java/com/flowsync/`, las migraciones de Flyway en `src/main/resources/db/migration/` y las pruebas en `src/test/java/`.
- `backend/` contiene la implementación AdonisJS/TypeScript y sirve como referencia de paridad de la API. Los controladores, modelos, validadores y migraciones están en `backend/app/` y `backend/database/`.
- No hagas commit de `data/` generado, archivos de compilación, dependencias ni secretos.

## Comandos de compilación, pruebas y desarrollo

Ejecuta los comandos desde el directorio del módulo correspondiente:

```bash
cd backend-spring && ./mvnw spring-boot:run  # run API on :8080
cd backend-spring && ./mvnw test             # run Java tests
cd backend-spring && ./mvnw verify           # tests plus Spotless validation
cd backend-spring && ./mvnw spotless:apply   # format Java sources
cd frontend && npm install && npm run dev    # run Vite on :5173
cd frontend && npm run build                 # type-check and production build
cd frontend && npm run lint                  # run Oxlint
cd backend && npm run dev                    # run legacy Adonis API
cd backend && npm test                       # run Japa tests
```

## Estilo de código y convenciones de nombres

Usa una indentación de dos espacios para TypeScript/React y sigue las reglas configuradas de Prettier/ESLint. Usa `PascalCase` para componentes React y clases Java, `camelCase` para miembros y `snake_case` para archivos de Adonis, como `profile_controller.ts`. Spotless aplica el formato de Java mediante Google Java Format. Mantén los DTO, controladores, servicios y migraciones dentro de los límites de sus módulos actuales.

## Guías para las pruebas

Las pruebas de Spring usan soporte de JUnit/Spring Boot y siguen el patrón `*Test.java`; ejecútalas con `./mvnw test`. Las pruebas de Adonis usan Japa y se ejecutan con `npm test`; mantén su configuración aislada de los datos de desarrollo.

## Convenciones para commits y pull requests

Usa asuntos de commit concisos e imperativos, opcionalmente con un alcance; por ejemplo, `fix(backend): validate login payload` o `docs: update setup instructions`. Los pull requests deben explicar el cambio, identificar los módulos afectados, enlazar la incidencia o tarea correspondiente e incluir capturas para cambios visibles del frontend. Indica los comandos de verificación ejecutados y cualquier cambio en variables de entorno o migraciones.

## Consejos de seguridad y configuración

Usa variables de entorno para los secretos de despliegue, especialmente `JWT_SECRET`. Nunca hagas commit de archivos `.env`, tokens, contraseñas ni archivos locales de la base de datos H2. Conserva el contrato documentado de respuestas y autenticación de la API al modificar cualquiera de los backends.


## Reglas de proceso

- Antes de modificar código de una feature, crea una rama `feat/<slug>`.
- No hagas commits directos en `main` ni `feature/spring-boot-migration`.
- Antes de implementar, inspecciona el contrato real del backend y presenta un plan.
- Al cerrar la tarea, usa `$commit` sobre cambios staged.
- Abre un PR con `gh pr create` y documenta cambios y pruebas.
- Después del PR, delega una revisión al agente `adversarial-reviewer`.
- No des por cerrada la tarea si fallan tests, formatter o existe un hallazgo crítico.
- Cuando el PR exista, actualiza Jira a “En revisión” y comenta la URL.
- El resumen durable vive en Jira/PR; la respuesta final debe ser breve.
