# E2 - Gestión de tareas

| Campo | Valor |
|---|---|
| Origen | `docs/prd/flowsync-mvp.md`, sección 5 |
| Estado | Propuesta |
| Historias | 9 |

Épica núcleo del MVP. Es lo único que FlowSync construye de cero: hoy el backend solo tiene autenticación y no existe el concepto de tarea en ninguna capa.

## Historias

Convención de identificadores: `FS-nnn`. Es **convención interna del equipo**, vive en el título y las etiquetas de Jira, nunca como clave de Jira. Jira asigna sus propias claves.

| ID | Historia | RF que cubre | Estado | Jira |
|---|---|---|---|---|
| FS-101 | Crear una tarea | RF-01 | Pendiente de enriquecer | LID-17 |
| FS-102 | Ver la lista de tareas del equipo | RF-02 | Pendiente de enriquecer | LID-18 |
| FS-103 | Asignar responsable al crear la tarea | RF-03 | Pendiente de enriquecer | LID-19 |
| FS-104 | Reasignar el responsable de una tarea | RF-03 | Pendiente de enriquecer | LID-21 |
| FS-105 | Cambiar el estado de una tarea en dos clics | RF-04 | Pendiente de enriquecer | LID-20 |
| FS-118 | Fecha de vencimiento y tareas vencidas | RF-05 | **Enriquecida** | LID-5 |
| FS-142 | Filtrar la lista por estado | RF-06 | **Enriquecida** | LID-11 |
| FS-106 | Corregir el título de una tarea | RF-08 | Pendiente de enriquecer | LID-22 |
| FS-107 | Retirar una tarea de la lista activa | RF-09 | Bloqueada por D-06 | LID-23 |

Épica en Jira: **LID-4**. Las claves `LID-nnn` las asigna Jira; `FS-nnn` es convención interna y vive en el título y las etiquetas.

Dos historias están enriquecidas con caminos felices y casos borde, siguiendo el patrón del módulo: no se enriquecen las nueve de golpe, se enriquecen las que van a implementarse primero.

FS-106 y FS-107 nacieron como huecos detectados al descomponer: el PRD describía cómo nacen y evolucionan las tareas, pero no cómo se corrigen ni cómo desaparecen. La revisión adversarial confirmó el hallazgo y el PRD incorporó RF-08 y RF-09.

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
