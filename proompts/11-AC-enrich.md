De las historias que acabas de listar, coge la de la fecha de vencimiento y las tareas vencidas. Si te salieron separadas (poner o quitar la fecha por un lado, ver si se ha pasado de plazo por otro), consolídalas en UNA sola historia antes de seguir: para nosotros es una única historia y se llama FS-118.
Escribe sus criterios de aceptación en formato Given/When/Then, redactados en español (DADO / CUANDO / ENTONCES).
Reglas MUY importantes:
- Un criterio de historia es una REGLA DE NEGOCIO observable: qué es verdad para el usuario. NO uses endpoints, status codes ni nombres de campo internos (nada de "PATCH /tasks/:id", "422", "isOverdue"). Ese detalle técnico es de la fase de implementación, no de aquí.
- Incluye el camino feliz Y los edge cases / errores que se me puedan olvidar.
- Marca los criterios que propongas tú para mi revisión.