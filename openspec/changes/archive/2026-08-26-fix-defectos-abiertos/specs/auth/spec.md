## MODIFIED Requirements

### Requirement: Unicidad del email

El sistema SHALL rechazar un alta cuyo email ya pertenezca a otra cuenta, indicando cuál es el campo en conflicto, y SHALL considerar el mismo email escrito con distinta combinación de mayúsculas y minúsculas como el mismo email.

#### Scenario: Email ya registrado

- **WHEN** se intenta crear una cuenta con un email que ya existe
- **THEN** el alta se rechaza
- **AND** el mensaje señala el email como campo responsable
- **AND** no se crea ninguna cuenta

#### Scenario: El mismo email escrito de otra forma

- **WHEN** se intenta crear una cuenta con un email que ya existe, escrito con otra combinación de mayúsculas
- **THEN** el alta se rechaza igual que si se hubiera escrito idéntico
- **AND** sigue existiendo una sola cuenta con ese email

### Requirement: Inicio de sesión

El sistema SHALL entregar una credencial de acceso a quien presente el email y la contraseña de una cuenta existente, con independencia de cómo escriba las mayúsculas del email.

#### Scenario: Credenciales correctas

- **WHEN** se presenta el email y la contraseña de una cuenta existente
- **THEN** la respuesta incluye los datos públicos de la cuenta y una credencial de acceso

#### Scenario: El email escrito con otras mayúsculas

- **WHEN** se presenta la contraseña correcta y el email de la cuenta escrito con otra combinación de mayúsculas
- **THEN** se entrega la credencial igual que si se hubiera escrito como al darse de alta

### Requirement: La sesión sobrevive a recargar

La aplicación SHALL conservar la sesión entre recargas de página, y SHALL comprobar contra el sistema que la sesión conservada sigue siendo válida antes de darla por buena.

#### Scenario: Recargar con sesión abierta

- **WHEN** la persona recarga la página teniendo sesión abierta
- **THEN** sigue dentro, sin volver a introducir credenciales

#### Scenario: Sesión revocada mientras tanto

- **WHEN** la sesión conservada ha dejado de ser válida
- **THEN** la aplicación la descarta y lleva a la pantalla de acceso
- **AND** explica por qué se perdió la sesión

#### Scenario: Mientras se comprueba no se expulsa

- **WHEN** la comprobación de la sesión conservada todavía no ha terminado
- **THEN** la aplicación muestra que está cargando
- **AND** no lleva a la pantalla de acceso todavía

#### Scenario: El sistema no responde al comprobar

- **WHEN** la comprobación de la sesión conservada falla por algo que no es un rechazo de la credencial
- **THEN** la aplicación no da la credencial por perdida
- **AND** basta con volver a intentarlo cuando el sistema responda

## ADDED Requirements

### Requirement: Una credencial rechazada cierra la sesión en el momento

Cuando el sistema rechace la credencial en cualquier operación, y no solo al arrancar, la aplicación SHALL descartar la sesión y llevar a la pantalla de acceso explicando por qué. NO SHALL dejar a la persona en una pantalla que le pida iniciar sesión sin permitirle llegar a ella.

#### Scenario: La credencial deja de valer con la aplicación abierta

- **WHEN** una operación cualquiera se rechaza porque la credencial ya no vale
- **THEN** la aplicación descarta la sesión
- **AND** lleva a la pantalla de acceso explicando por qué se perdió

#### Scenario: No queda ninguna pantalla sin salida

- **WHEN** la sesión se pierde estando en una pantalla privada
- **THEN** la persona puede llegar a la pantalla de acceso sin recargar

#### Scenario: Un fallo que no es de credencial no cierra la sesión

- **WHEN** una operación falla porque el sistema no responde o devuelve un error propio
- **THEN** la sesión se conserva
- **AND** la persona sigue dentro
