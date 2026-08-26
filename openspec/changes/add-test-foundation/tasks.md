> El grupo 1 va **antes** que cualquier prueba: sin aislamiento, la primera suite escribe sobre el fichero de desarrollo.
> Los casos salen de los escenarios de `openspec/specs/auth/spec.md` y `openspec/specs/tasks/spec.md`. Ninguno se inventa aquí.

## 1. Aislar la base de datos

- [ ] 1.1 Hacer que la conexión elija el fichero según el entorno (D1), y verificar que en desarrollo sigue apuntando al de siempre
- [ ] 1.2 Declarar en `.env.test` lo que el entorno de prueba necesita, y verificar que arrancar la suite no modifica el fichero de desarrollo: comparar su fecha de modificación antes y después
- [ ] 1.3 Ignorar el fichero de base de datos de test en git, y verificar con `git status` que no aparece tras ejecutar la suite
- [ ] 1.4 Hacer que la suite migre desde cero al arrancar y no conserve estado entre ejecuciones (D2), y verificar ejecutándola dos veces seguidas con el mismo resultado

## 2. Primer caso, que valida el arnés

- [ ] 2.1 Escribir un único caso funcional que cree una cuenta por la API y compruebe que existe en la base, y verificar que pasa
- [ ] 2.2 Ejecutar la suite dos veces seguidas y verificar que la segunda no falla por datos que dejó la primera. Es la prueba de que D1 y D2 funcionan

## 3. Suite de `auth`

Deriva de `openspec/specs/auth/spec.md`. Cada caso nombra su requisito (D6).

- [ ] 3.1 Alta de cuenta: alta correcta, nombre nulo aceptado, campo del nombre ausente rechazado
- [ ] 3.2 Unicidad del email y requisitos de la contraseña: email repetido, contraseña corta, contraseña larga, repetición que no coincide
- [ ] 3.3 Validación acumulada: varios campos inválidos a la vez devuelven todos los problemas, cada uno con su campo
- [ ] 3.4 Que un fallo de acceso no revele si la cuenta existe: contraseña incorrecta y cuenta inexistente dan **el mismo** resultado. Verificar que compara la respuesta entera, no solo el código
- [ ] 3.5 Perfil y protección: consulta con credencial válida, la contraseña nunca sale, sin credencial y con credencial inventada se deniega igual
- [ ] 3.6 Ciclo de vida de la sesión: cerrar sesión invalida la credencial usada, y con dos sesiones abiertas cerrar una no cierra la otra

## 4. Suite de `tasks`

Deriva de `openspec/specs/tasks/spec.md`.

- [ ] 4.1 Crear: un título basta, y nace a nombre de quien crea y en el estado inicial
- [ ] 4.2 Título obligatorio: vacío y de solo espacios se rechazan igual, señalando el campo
- [ ] 4.3 Título excesivo: se avisa y **no** se guarda ninguna versión recortada. Verificar consultando después que no existe ninguna tarea con el título truncado
- [ ] 4.4 Estados: un estado fuera del conjunto se rechaza enumerando los admitidos, y un rótulo en castellano tampoco vale como identificador
- [ ] 4.5 Que no se pueda falsificar: enviar responsable y estado al crear no tiene efecto, y enviar título al actualizar tampoco (D3 y D4 del cambio anterior)
- [ ] 4.6 Tarea inexistente: actualizar una que no existe se rechaza con la forma de error del proyecto, y la respuesta **no** contiene traza ni rutas de fichero
- [ ] 4.7 Lista compartida: dos cuentas distintas obtienen el mismo conjunto de tareas
- [ ] 4.8 Protección: las tres rutas sin sesión deniegan el acceso

## 5. Runner del frontend

- [ ] 5.1 Instalar el runner elegido en D5 y añadir su script, y verificar que ejecuta sin ninguna prueba todavía
- [ ] 5.2 Configurarlo para que resuelva el alias `@/*` igual que la aplicación, y verificar importando desde `@/lib/api` en una prueba mínima

## 6. Pruebas de `lib/api.ts`

- [ ] 6.1 Desenvolver la respuesta: una respuesta correcta devuelve el contenido sin el envoltorio
- [ ] 6.2 Traducción de errores por regla, cubriendo las que usan los dos validadores del backend, y verificar que el mensaje sale en castellano
- [ ] 6.3 Desglose por campo: un error de validación coloca cada mensaje bajo su campo
- [ ] 6.4 Fallo de red: se distingue de un error de credenciales y lo dice
- [ ] 6.5 Verificar que estas pruebas fallan si se cambia un mensaje del diccionario, que es el fallo silencioso que describe **H-05**

## 7. Cierre

- [ ] 7.1 Ejecutar las dos suites completas y verificar que pasan en limpio, más `lint` y `typecheck` en ambos proyectos
- [ ] 7.2 Actualizar `docs/hallazgos.md`: H-01 y H-02 dejan de estar abiertos, con la fecha y cómo se resolvieron
- [ ] 7.3 Declarar en el propio cambio qué escenarios de las dos specs quedan **sin cubrir** y por qué, para que el hueco sea conocido y no una omisión silenciosa

## 8. Auditoría del cambio

- [ ] 8.1 Verificar que el diff no contiene **ningún cambio de comportamiento de producto**. Si alguna prueba obligó a tocar código de aplicación, es un defecto: se anota en `docs/hallazgos.md` y se saca a su propio cambio
- [ ] 8.2 Verificar que la única dependencia nueva es el runner aprobado, y que el fichero de base de datos de test no se ha colado en el repositorio
