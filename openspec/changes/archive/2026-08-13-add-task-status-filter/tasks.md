> **Todas las tareas están hechas.** Este change documenta comportamiento que ya
> estaba implementado y funcionando en el repositorio cuando se escribió: no hay
> nada que implementar. La lista de abajo es el registro de lo que se hizo, no un
> plan de trabajo.

## 1. El alcance por defecto de la lista

- [x] 1.1 Declarar en el modelo de tarea el conjunto de estados que devuelve la lista sin acotar, escrito explícito y no como `TASK_STATUSES` menos `'done'` (decisión 2 del diseño)
- [x] 1.2 Hacer que la consulta de la lista, sin filtro, acote a ese conjunto en lugar de devolver todo el espacio
- [x] 1.3 Comprobar contra el servidor real que una tarea en `done` deja de salir en la lista sin acotar, y que el orden y los datos por tarea siguen siendo los mismos que antes

## 2. Acotar la lista por estado

- [x] 2.1 Escribir el validador de la lista con `status` **opcional** y acotado al enum de los tres estados, de modo que un valor inventado no llegue nunca al controlador (decisión 1 del diseño)
- [x] 2.2 Ramificar la consulta antes de ejecutarla: un estado pedido acota a ese estado; la ausencia de estado acota a la vista por defecto
- [x] 2.3 Verificar los tres caminos contra el servidor real: cada estado válido, la ausencia de filtro, y un estado válido sin ninguna tarea, que devuelve `200` con lista vacía y no un error
- [x] 2.4 Verificar que un estado inventado devuelve `422` señalando el campo `status` y **no** una lista vacía, y que su respuesta es distinguible de la del filtro válido sin resultados
- [x] 2.5 Confirmar que acotar es solo lectura: ninguna tarea cambia de estado, responsable ni fecha al consultarla filtrada
- [x] 2.6 Confirmar que la lista acotada sigue exigiendo sesión y responde `401` sin token válido
- [x] 2.7 Arrancar el servidor para regenerar los tipos del cliente y commitear el diff de `.adonisjs/`
- [x] 2.8 Dejar el backend en verde de lint, formato y typecheck

## 3. El control de filtro en la interfaz

- [x] 3.1 Reflejar en los tipos compartidos del frontend el conjunto de estados de la vista por defecto, como espejo del backend, con el comentario que ata ambos sitios (decisión 5 del diseño)
- [x] 3.2 Permitir que la llamada a la lista, en el único punto de contacto con la API, lleve el estado pedido
- [x] 3.3 Construir el control con botones nativos dentro de un grupo etiquetado, con el estado aplicado anunciado y operable enteramente con el teclado (decisión 7 del diseño)
- [x] 3.4 Nombrar la primera opción por lo que enseña —«Pendientes y en curso»— y no como un «Todas»
- [x] 3.5 Aceptar en el control un valor que puede no ser ninguno de los tres estados y, en ese caso, no marcar ninguna opción
- [x] 3.6 Comprobar a mano que elegir un estado sustituye al anterior en lugar de sumarse, y que quitar el filtro devuelve a la vista por defecto

## 4. El filtro en la dirección de la lista

- [x] 4.1 Leer y escribir el estado pedido en el parámetro `status` de la URL, sin guardarlo en ningún otro sitio (decisión 4 del diseño)
- [x] 4.2 Hacer que quitar el filtro borre el parámetro en lugar de poner uno que diga «todas»
- [x] 4.3 Recargar la lista cada vez que cambia el estado pedido, cancelando la petición anterior si aún viaja
- [x] 4.4 Comprobar a mano que la vista acotada se comparte por enlace, que «atrás» deshace el filtro, y que entrar en la lista sin pedir nada da siempre la vista por defecto

## 5. Los cuatro finales de una lista sin filas

- [x] 5.1 Guardar el error de filtro inválido en un estado propio, separado del error genérico de carga, para que no puedan compartir salida (decisión 6 del diseño)
- [x] 5.2 Mostrar ante un filtro inválido un aviso que diga que el problema es lo pedido y no la ausencia de trabajo, con un camino de vuelta a la vista por defecto
- [x] 5.3 Mostrar ante un filtro válido sin resultados un mensaje propio, sin tono de error
- [x] 5.4 Resolver cuántas tareas hechas hay —con una segunda consulta acotada, y solo cuando la vista por defecto vuelve vacía y no hay filtro puesto— para distinguir «no queda nada abierto» de «el espacio está vacío»
- [x] 5.5 Mostrar en el primero de esos dos casos cuántas tareas terminadas hay y un camino para verlas, y reservar la bienvenida del espacio vacío para cuando de verdad no haya ninguna tarea creada
- [x] 5.6 Recorrer a mano los cuatro finales y confirmar que ninguno reutiliza el mensaje de otro

## 6. Lo que sale de la vista no se pierde

- [x] 6.1 Pintar la lista aplicando el mismo predicado que el servidor, para que un cambio de estado saque la fila en el acto sin volver a pedir la lista
- [x] 6.2 Avisar adónde ha ido una tarea que un cambio propio saca de la vista actual, y confirmar que se vuelve a encontrar acotando por su nuevo estado
- [x] 6.3 Avisar, al crear una tarea con un filtro puesto que no sea «Pendiente», de que ha nacido pendiente y por eso no aparece en esta vista
- [x] 6.4 Confirmar que si el cambio de estado no cuaja la fila vuelve al estado real y el aviso desaparece
- [x] 6.5 Dejar el frontend en verde de lint, formato y build

## 7. Fuera de alcance, y verificado como tal

- [x] 7.1 Confirmar que no existe ninguna forma de acotar la lista por responsable ni por ninguna dimensión que no sea el estado
- [x] 7.2 Confirmar que aplicar o quitar un filtro no cambia lo que ve nadie más: la lente es personal, el contenido es compartido
- [x] 7.3 Dejar constancia de que **no se escriben tests** —incumpliendo a conciencia los puntos de prueba del DoD de FS-142.1— y de que **CA-11, CA-12 y CA-14 no se implementan**, por no existir lista viva en el producto
