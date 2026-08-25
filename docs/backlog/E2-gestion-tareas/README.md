# E2 - Gestión de tareas

| Campo | Valor |
|---|---|
| Origen | `docs/prd/flowsync-mvp.md`, sección 5 |
| Estado | Propuesta |
| Historias | 9 |

Épica núcleo del MVP. Es lo único que FlowSync construye de cero: hoy el backend solo tiene autenticación y no existe el concepto de tarea en ninguna capa.

## Historias

Convención de identificadores: `FS-nnn`. Es **convención interna del equipo**, vive en el título y las etiquetas de Jira, nunca como clave de Jira. Jira asigna sus propias claves.

| ID | Historia | RF que cubre | Estado |
|---|---|---|---|
| FS-101 | Crear una tarea | RF-01 | Pendiente de enriquecer |
| FS-102 | Ver la lista de tareas del equipo | RF-02 | Pendiente de enriquecer |
| FS-103 | Asignar responsable al crear la tarea | RF-03 | Pendiente de enriquecer |
| FS-104 | Reasignar el responsable de una tarea | RF-03 | Pendiente de enriquecer |
| FS-105 | Cambiar el estado de una tarea en dos clics | RF-04 | Pendiente de enriquecer |
| FS-118 | Fecha de vencimiento y tareas vencidas | RF-05 | **Enriquecida** |
| FS-142 | Filtrar la lista por estado | RF-06 | **Enriquecida** |
| FS-106 | Editar el título de una tarea | RF-01 | Pendiente de enriquecer |
| FS-107 | Eliminar una tarea | -- | Pendiente de enriquecer |

Dos historias están enriquecidas con caminos felices y casos borde, siguiendo el patrón del módulo: no se enriquecen las nueve de golpe, se enriquecen las que van a implementarse primero.

FS-107 no cubre ningún RF del PRD. Es un hueco detectado al descomponer: el PRD describe cómo nacen y evolucionan las tareas, pero no cómo desaparecen. Queda anotado como decisión de producto abierta, no como requisito asumido.

## Validación INVEST

| Historia | I | N | V | E | S | T | Nota |
|---|---|---|---|---|---|---|---|
| FS-101 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| FS-102 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Depende de FS-101: sin tareas no hay lista que ver |
| FS-103 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Depende de FS-101 |
| FS-104 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Depende de FS-103 |
| FS-105 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Depende de FS-102 |
| FS-118 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Depende de FS-101 y FS-102 |
| FS-142 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Depende de FS-102 y FS-105 |
| FS-106 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Depende de FS-101 |
| FS-107 | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | No negociada: falta decisión de producto |

Ninguna historia salvo FS-101 es realmente independiente, y eso es esperable en una épica que construye un dominio desde cero. La primera crea la entidad y el resto cuelga de ella. Lo relevante no es forzar la independencia, es que el orden del backlog respete esas dependencias.
