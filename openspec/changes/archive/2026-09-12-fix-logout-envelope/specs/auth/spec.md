## MODIFIED Requirements

### Requirement: Cierre de sesión

El sistema SHALL revocar el token presentado al recibir `POST /api/v1/account/logout`, de forma que ese token deje de servir a partir de ese momento, sin afectar a los demás tokens de la misma cuenta.

#### Scenario: Cierre de sesión correcto

- **WHEN** se envía `POST /api/v1/account/logout` con un token válido
- **THEN** la respuesta es `200` con `{"data": {"message": "Logged out successfully"}}`, y no hay ninguna clave `message` fuera de `data`

#### Scenario: El token revocado ya no vale

- **WHEN** se vuelve a usar un token con el que ya se cerró sesión
- **THEN** la respuesta es `401`

#### Scenario: Las demás sesiones siguen abiertas

- **WHEN** una cuenta tiene dos sesiones abiertas y se cierra una de ellas
- **THEN** el token de la otra sesión sigue autenticando con normalidad

### Requirement: Forma de las respuestas de la API

El sistema SHALL responder siempre en JSON, envolver en una clave `data` **toda respuesta de éxito** de esta capability -no solo las que llevan datos de cuenta-, y no exponer nunca la contraseña ni su hash en ninguna respuesta.

#### Scenario: JSON aunque el cliente pida HTML

- **WHEN** se envía cualquier petición de esta capability con `Accept: text/html`
- **THEN** la respuesta llega en JSON, también en los casos de error

#### Scenario: Toda respuesta de éxito va envuelta

- **WHEN** el registro, el inicio de sesión, la consulta del perfil o el cierre de sesión responden con éxito
- **THEN** el cuerpo es un objeto cuya única clave de primer nivel es `data`

#### Scenario: La contraseña nunca sale

- **WHEN** se obtiene una cuenta por registro, login o consulta de perfil
- **THEN** el objeto devuelto no contiene ningún campo con la contraseña ni con su hash
