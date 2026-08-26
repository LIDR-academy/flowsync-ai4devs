> Los grupos 1 a 4 son backend y se completan antes de tocar el frontend.
> Este cambio **no escribe pruebas**: R-7 sigue abierto y la base de pruebas tiene su propio cambio. La verificación es manual, contra los escenarios de `specs/tasks/spec.md`.

## 1. Persistencia

- [ ] 1.1 Crear la migración de la tabla de tareas con título, responsable y estado, y verificar que se ejecuta limpia sobre la base actual sin tocar `users` ni `auth_access_tokens`
- [ ] 1.2 Regenerar el esquema y verificar que la clase generada de tarea aparece con los tres campos y que el fichero queda formateado
- [ ] 1.3 Comprobar que la migración es reversible: deshacerla elimina la tabla y deja el esquema como estaba

## 2. Dominio

- [ ] 2.1 Declarar el conjunto cerrado de estados en un único punto del backend, con los identificadores estables de D2, y verificar que no queda ningún literal de estado suelto en otro sitio
- [ ] 2.2 Crear el modelo de tarea extendiendo la clase generada, con la relación hacia su responsable, y verificar que carga el responsable sin consultarlo aparte

## 3. Validación

- [ ] 3.1 Crear el validador de creación aceptando **solo** el título, con recorte de extremos antes de validar (D5) y la guarda de longitud de D6, y verificar que un título vacío, uno de solo espacios y uno excesivo se rechazan señalando el campo
- [ ] 3.2 Crear el validador de actualización aceptando **solo** el estado contra el conjunto cerrado, y verificar que un estado inexistente se rechaza indicando los admitidos

## 4. API

- [ ] 4.1 Crear el transformer de tarea con los campos de la fila y el mínimo del responsable (D7), y verificar que no expone datos de cuenta que la lista no pinta
- [ ] 4.2 Implementar listar tareas del espacio, devolviendo todas sin filtrar ni reordenar (D10), y verificar que responde con el envoltorio habitual del proyecto
- [ ] 4.3 Implementar crear tarea resolviendo el responsable desde la sesión (D3) y el estado inicial en el servidor, y verificar que la petición no admite responsable ni estado
- [ ] 4.4 Implementar actualizar el estado de una tarea (D4), y verificar que no admite título ni responsable
- [ ] 4.5 Registrar las tres rutas bajo el grupo protegido, y verificar que sin sesión las tres deniegan el acceso
- [ ] 4.6 Verificar contra la API los escenarios de la spec que son de backend: título vacío, título de solo espacios, título excesivo, estado inexistente, creación con responsable y estado por defecto, y acceso sin sesión

## 5. Cliente de la API

- [ ] 5.1 Añadir los tipos de tarea y el conjunto de estados al frontend, derivados de los identificadores de D2, y verificar que el typecheck pasa
- [ ] 5.2 Añadir las tres funciones de acceso en el único punto de contacto con el backend, desenvolviendo la respuesta como el resto, y verificar que ningún componente llama a la red por su cuenta
- [ ] 5.3 Extender la traducción de errores para los campos y reglas nuevos, y verificar que un título vacío y un estado inválido se explican en castellano

## 6. Pantalla

- [ ] 6.1 Construir la fila de tarea con título, responsable y estado, resolviendo el caso del responsable sin nombre, y verificar que no muestra fechas ni marcas de vencimiento
- [ ] 6.2 Construir el control de estado con los tres destinos como botones (D9), y verificar que cambiar de estado cuesta un solo clic
- [ ] 6.3 Construir el formulario de creación pidiendo únicamente el título, y verificar que no ofrece ni sugiere responsable, estado ni fecha
- [ ] 6.4 Construir el estado vacío que explica qué es la lista y ofrece crear la primera tarea, y verificar que aparece cuando el espacio no tiene ninguna
- [ ] 6.5 Ensamblar la pantalla de lista con carga, error y vacío, incluyendo la actualización optimista con reversión al fallar (D8), y verificar que un fallo devuelve la fila a su estado real y lo explica
- [ ] 6.6 Reutilizar únicamente componentes existentes de `ui/`, y verificar que el cambio no añade ninguno ni edita los que hay

## 7. Rutas y navegación

- [ ] 7.1 Registrar la ruta de la lista como protegida y hacerla destino por defecto tras entrar, y verificar que sin sesión lleva al acceso y con sesión no se queda en el perfil
- [ ] 7.2 Verificar que el perfil sigue accesible y que se puede navegar entre las dos pantallas

## 8. Verificación de punta a punta

- [ ] 8.1 Recorrer en el navegador los escenarios de la spec que son de frontend: crear con solo el título, ver la fila con las tres cosas, cambiar estado en un clic, y el espacio vacío
- [ ] 8.2 Verificar con dos cuentas distintas que la lista es la misma para ambas y que no existe ninguna vista de tareas propias
- [ ] 8.3 Comprobar que `npm run build` y `npm run lint` pasan limpios en frontend, y `npm run typecheck` y `npm run lint` en backend

## 9. Auditoría del cambio

- [ ] 9.1 Revisar el diff completo y verificar que no coló: ninguna prueba, ninguna dependencia nueva, ningún componente nuevo en `ui/`, ninguna fecha de vencimiento, ningún filtro, ningún endpoint de más, ninguna regla de orden
- [ ] 9.2 Verificar que el conjunto de estados sigue declarado una sola vez por lado y que ningún rótulo en castellano se usa como identificador
