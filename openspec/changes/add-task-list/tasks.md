## 1. Modelo de datos

- [ ] 1.1 Crear la migración de la tabla de tareas con identificador, título, estado (texto, por defecto `pending`), responsable como clave ajena al usuario y las marcas de creación y actualización — **sin ninguna columna de vencimiento**; verificar que `node ace migration:run` la aplica sin error
- [ ] 1.2 Comprobar que la ejecución de la migración ha regenerado `database/schema.ts` con la clase de la tarea y sus columnas, y que el fichero no se ha editado a mano
- [ ] 1.3 Añadir al modelo de tarea únicamente la relación con su responsable, y verificar en `node ace repl` que una tarea creada devuelve su usuario al precargarla

## 2. Validación y serialización

- [ ] 2.1 Definir la constante compartida del límite de longitud del título (200, provisional por PA-9 en su vertiente de RF-6) y el conjunto cerrado de los tres identificadores de estado, en un solo sitio reutilizable por los validadores
- [ ] 2.2 Escribir el validador de creación: solo título, con recorte de espacios de los extremos, longitud mínima 1 y máxima el límite compartido; verificar a mano que título ausente, vacío y de solo espacios dan el mismo 422 con el campo del título
- [ ] 2.3 Escribir el validador de actualización: estado dentro del conjunto cerrado y responsable existente, ambos opcionales; verificar que un estado en castellano o con otra capitalización da 422 y que un responsable inexistente da 422 sobre su propio campo
- [ ] 2.4 Escribir el transformer de la tarea exponiendo identificador, título, estado y un responsable con solo identificador y nombre completo; verificar en la respuesta real que **no** aparece el correo ni las fechas de la cuenta del responsable

## 3. API

- [ ] 3.1 Implementar el listado de todas las tareas del espacio con el responsable precargado, sin aplicar ningún criterio de ordenación explícito; verificar con dos cuentas distintas que ambas reciben el mismo conjunto
- [ ] 3.2 Implementar la creación: valida, crea con estado `pending` y con la cuenta autenticada como responsable, y devuelve 201 con la tarea serializada; verificar que un alta con solo título nace pendiente y a nombre de quien la crea
- [ ] 3.3 Implementar la actualización de estado y responsable de cualquier tarea sin exigir ser su responsable, devolviendo la tarea ya actualizada y 404 si el identificador no existe; verificar cambiando el estado de una tarea ajena y luego con un identificador inventado
- [ ] 3.4 Registrar el grupo de rutas de tareas bajo `/api/v1` con el middleware de autenticación, **sin ruta de lectura individual ni de borrado**; verificar con `node ace list:routes` que aparecen exactamente tres rutas de tareas
- [ ] 3.5 Comprobar que las tres rutas responden 401 sin token y con un token revocado, y que ninguna devuelve datos en ese caso
- [ ] 3.6 Arrancar el dev server para regenerar el mapa de controladores y el registro de `.adonisjs/`, y verificar con `npm run typecheck` y `npm run lint` que el diff generado compila; dejarlo listo para commitear

## 4. Cliente de la API en el frontend

- [ ] 4.1 Añadir los tipos de la tarea y de su responsable, y el tipo del conjunto cerrado de estados, reflejando exactamente lo que devuelve el transformer
- [ ] 4.2 Añadir al único punto de contacto con la API las tres llamadas (listar, crear, actualizar), desenvolviendo el `{ data }` y reutilizando el envío del token; verificar que una llamada sin sesión válida produce el error de sesión caducada ya existente
- [ ] 4.3 Extender la traducción de errores para que los campos del título, del estado y del responsable tengan etiqueta en castellano; verificar que un título demasiado largo llega a la pantalla como una frase legible y no como el mensaje crudo del validador
- [ ] 4.4 Permitir el verbo de actualización en el envoltorio de `fetch` si todavía no lo admite, y verificar que la actualización llega al backend con su cuerpo

## 5. Pantalla de la lista

- [ ] 5.1 Crear la página de la lista con los componentes de interfaz ya presentes (sin `shadcn add` y sin dependencias nuevas): carga inicial, aviso de error y el conjunto de filas
- [ ] 5.2 Implementar la fila con título, responsable y estado, resolviendo «Sin nombre» sobre el nombre recortado de espacios y sin mostrar nunca correo ni identificador; verificar con una cuenta sin nombre puesto
- [ ] 5.3 Traducir los tres identificadores de estado a «Pendiente», «En curso» y «Hecho» en un único punto de la pantalla; verificar que ningún identificador interno llega a la vista
- [ ] 5.4 Implementar el grupo de tres botones de estado en la fila, con el actual marcado, sin diálogo de confirmación ni campos; verificar que cambiar el estado son un clic y que los tres destinos están visibles sin interacción previa
- [ ] 5.5 Aplicar el cambio de estado de forma optimista y devolver la fila a su estado anterior explicando el fallo si la petición se rechaza; verificar apagando el backend a mitad de un cambio
- [ ] 5.6 Implementar el formulario de creación con **solo** el campo del título y su límite de longitud, que añade la tarea a la lista sin recargar ni navegar, deshabilita la acción mientras dura el envío y vacía el campo al terminar
- [ ] 5.7 Mostrar el problema del título junto al propio campo reutilizando el componente de error de campo existente; verificar con el campo vacío, con solo espacios y con un título pasado de largo
- [ ] 5.8 Implementar el estado vacío que explica qué es la lista y ofrece crear la primera tarea; verificar sobre una base de datos sin tareas
- [ ] 5.9 Revisar la pantalla completa contra las tres prohibiciones del alcance: ninguna fecha ni marca de vencida, ninguna señal de presencia o actividad, ningún selector de responsable, orden, filtro o vista de «mis tareas»

## 6. Navegación

- [ ] 6.1 Registrar la ruta de la lista como ruta protegida, conservando el perfil en la suya; verificar que con sesión se llega a las dos
- [ ] 6.2 Unificar el destino por defecto en una sola constante y hacer que la usen tanto el guard de rutas públicas como la regla comodín (hoy el literal `/profile` está duplicado y sin atar en los dos sitios); verificar que tras iniciar sesión, tras registrarse y al abrir una dirección desconocida se aterriza en el mismo lugar: la lista
- [ ] 6.3 Añadir desde la lista el acceso al perfil; verificar que el perfil sigue mostrando los datos de la cuenta y su cierre de sesión
- [ ] 6.4 Verificar que sin sesión la dirección de la lista lleva al inicio de sesión, y que con sesión el inicio de sesión y el registro llevan a la lista

## 7. Cierre

- [ ] 7.1 Pasar `npm run lint` y `npm run typecheck` en `backend/`, y `npm run lint` y `npm run build` en `frontend/`, y dejar ambos en verde
- [ ] 7.2 Recorrer a mano los escenarios de la spec delta con dos cuentas distintas abiertas —lista compartida idéntica, alta con solo título, título inválido, cambio de estado sobre una tarea ajena, estado vacío— y anotar cualquier desviación antes de dar el change por implementado
