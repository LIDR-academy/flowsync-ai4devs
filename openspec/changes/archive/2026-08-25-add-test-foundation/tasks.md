> El grupo 1 va **antes** que cualquier prueba: sin aislamiento, la primera suite escribe sobre el fichero de desarrollo.
> Los casos salen de los escenarios de `openspec/specs/auth/spec.md` y `openspec/specs/tasks/spec.md`. Ninguno se inventa aquí.

## 1. Aislar la base de datos

- [x] 1.1 Hacer que la conexión elija el fichero según el entorno (D1), y verificar que en desarrollo sigue apuntando al de siempre
- [x] 1.2 Declarar en `.env.test` lo que el entorno de prueba necesita, y verificar que arrancar la suite no modifica el fichero de desarrollo: comparar su fecha de modificación antes y después
- [x] 1.3 Ignorar el fichero de base de datos de test en git, y verificar con `git status` que no aparece tras ejecutar la suite
- [x] 1.4 Hacer que la suite migre desde cero al arrancar y no conserve estado entre ejecuciones (D2), y verificar ejecutándola dos veces seguidas con el mismo resultado

## 2. Primer caso, que valida el arnés

- [x] 2.1 Escribir un único caso funcional que cree una cuenta por la API y compruebe que existe en la base, y verificar que pasa
- [x] 2.2 Ejecutar la suite dos veces seguidas y verificar que la segunda no falla por datos que dejó la primera. Es la prueba de que D1 y D2 funcionan

## 3. Suite de `auth`

Deriva de `openspec/specs/auth/spec.md`. Cada caso nombra su requisito (D6).

- [x] 3.1 Alta de cuenta: alta correcta, nombre nulo aceptado, campo del nombre ausente rechazado
- [x] 3.2 Unicidad del email y requisitos de la contraseña: email repetido, contraseña corta, contraseña larga, repetición que no coincide
- [x] 3.3 Validación acumulada: varios campos inválidos a la vez devuelven todos los problemas, cada uno con su campo
- [x] 3.4 Que un fallo de acceso no revele si la cuenta existe: contraseña incorrecta y cuenta inexistente dan **el mismo** resultado. Verificar que compara la respuesta entera, no solo el código
- [x] 3.5 Perfil y protección: consulta con credencial válida, la contraseña nunca sale, sin credencial y con credencial inventada se deniega igual
- [x] 3.6 Ciclo de vida de la sesión: cerrar sesión invalida la credencial usada, y con dos sesiones abiertas cerrar una no cierra la otra

## 4. Suite de `tasks`

Deriva de `openspec/specs/tasks/spec.md`.

- [x] 4.1 Crear: un título basta, y nace a nombre de quien crea y en el estado inicial
- [x] 4.2 Título obligatorio: vacío y de solo espacios se rechazan igual, señalando el campo
- [x] 4.3 Título excesivo: se avisa y **no** se guarda ninguna versión recortada. Verificar consultando después que no existe ninguna tarea con el título truncado
- [x] 4.4 Estados: un estado fuera del conjunto se rechaza enumerando los admitidos, y un rótulo en castellano tampoco vale como identificador
- [x] 4.5 Que no se pueda falsificar: enviar responsable y estado al crear no tiene efecto, y enviar título al actualizar tampoco (D3 y D4 del cambio anterior)
- [x] 4.6 Tarea inexistente: actualizar una que no existe se rechaza con la forma de error del proyecto, y la respuesta **no** contiene traza ni rutas de fichero
- [x] 4.7 Lista compartida: dos cuentas distintas obtienen el mismo conjunto de tareas
- [x] 4.8 Protección: las tres rutas sin sesión deniegan el acceso

## 5. Runner del frontend

- [x] 5.1 Instalar el runner elegido en D5 y añadir su script, y verificar que ejecuta sin ninguna prueba todavía
- [x] 5.2 Configurarlo para que resuelva el alias `@/*` igual que la aplicación, y verificar importando desde `@/lib/api` en una prueba mínima

## 6. Pruebas de `lib/api.ts`

- [x] 6.1 Desenvolver la respuesta: una respuesta correcta devuelve el contenido sin el envoltorio
- [x] 6.2 Traducción de errores por regla, cubriendo las que usan los dos validadores del backend, y verificar que el mensaje sale en castellano
- [x] 6.3 Desglose por campo: un error de validación coloca cada mensaje bajo su campo
- [x] 6.4 Fallo de red: se distingue de un error de credenciales y lo dice
- [x] 6.5 Verificar que estas pruebas fallan si se cambia un mensaje del diccionario, que es el fallo silencioso que describe **H-05**

## 7. Cierre

- [x] 7.1 Ejecutar las dos suites completas y verificar que pasan en limpio, más `lint` y `typecheck` en ambos proyectos
- [x] 7.2 Actualizar `docs/hallazgos.md`: H-01 y H-02 dejan de estar abiertos, con la fecha y cómo se resolvieron
- [x] 7.3 Declarar en el propio cambio qué escenarios de las dos specs quedan **sin cubrir** y por qué, para que el hueco sea conocido y no una omisión silenciosa

## 8. Auditoría del cambio

- [x] 8.1 Verificar que el diff no contiene **ningún cambio de comportamiento de producto**. Si alguna prueba obligó a tocar código de aplicación, es un defecto: se anota en `docs/hallazgos.md` y se saca a su propio cambio
- [x] 8.2 Verificar que la única dependencia nueva es el runner aprobado, y que el fichero de base de datos de test no se ha colado en el repositorio

## Escenarios sin cubrir, y por qué

De los 62 escenarios de las dos specs vivas quedan fuera los siguientes.
Se declaran aquí para que sean un hueco conocido y no una omisión silenciosa (D3).

**Lo que solo se observa en pantalla.** No hay runner de navegador y el cambio no añade uno (D4).

| Escenario | Spec | Verificado a mano en |
|---|---|---|
| El flujo de creación no pide nada más que el título | `tasks` | Fase 3.4 del Módulo 3 |
| Cambiar el estado desde la lista, sin abrir ni confirmar | `tasks` | Fase 3.4 |
| Los tres estados son el único destino ofrecido | `tasks` | Fase 3.4 |
| El espacio vacío se explica y ofrece crear la primera | `tasks` | Fase 3.4 |
| Cada fila muestra título, responsable y estado | `tasks` | Fase 3.4 |
| El cambio de estado se refleja de inmediato, y revierte si falla | `tasks` | Fase 3.4, interceptando `fetch` |
| Todo el vertical de pantallas de acceso y registro | `auth` | Módulo 1 |

**Lo que es una ausencia, no un comportamiento.** «No existe forma de configurar estados», «no hay vista de tareas propias», «no se puede añadir un estado».
Una prueba no demuestra que algo no exista; como mucho comprueba que una ruta concreta no responde.
Lo que sí está cubierto es su consecuencia observable: el conjunto de estados es cerrado y la lista es única para todos.

**Lo que depende de una decisión de producto sin tomar.**

- **PA-7**, qué transiciones de estado son legales. Hoy se admiten todas, y la prueba «los tres identificadores admitidos se aceptan» consagra ese hecho a propósito. Cuando PA-7 se decida, esa prueba tendrá que cambiar.
- **PA-9**, dónde está la frontera de «título demasiado largo». La prueba usa `TITLE_MAX_LENGTH` en vez del número, de modo que sigue al guardia técnico y no fija la regla de producto.

**Lo que sería consagrar un defecto.** **H-11**, el email distingue mayúsculas y minúsculas.
La spec de `auth` calla sobre ello a propósito: escribir una prueba que fije la conducta actual convertiría el defecto en contrato.
Se arregla en su propio cambio, y ahí nace su prueba.

## Nota de auditoría

`app/validators/task.ts` pasa a **exportar** `TITLE_MAX_LENGTH`, que ya existía.
Es un cambio de visibilidad, no de comportamiento: ninguna respuesta de la API cambia.
Se hace para que la prueba de título excesivo siga al guardia técnico en lugar de repetir el número, que es lo que la dejaría obsoleta en silencio cuando PA-9 se resuelva.
