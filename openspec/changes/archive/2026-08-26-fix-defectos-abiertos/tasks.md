> Los tres defectos son independientes. Se ordenan por severidad, no por capa.
> Cada grupo deja el sistema funcionando: si hay que parar, se para entre grupos.

## 1. H-11 · El email identifica a la persona, no a sus mayúsculas

- [x] 1.1 Comprobar antes de tocar nada que en la base actual no haya dos cuentas que solo se diferencien en mayúsculas, y dejar constancia del resultado
- [x] 1.2 Normalizar el email en la entrada al sistema, antes de comprobar la unicidad, y verificar que un alta repetida con otras mayúsculas se rechaza señalando el email y no revienta con un error de servidor
- [x] 1.3 Normalizar también en el acceso, y verificar entrando con el email escrito de otra forma
- [x] 1.4 Normalizar las cuentas ya guardadas, y verificar que una cuenta creada antes del cambio sigue pudiendo entrar
- [x] 1.5 Apagar explícitamente las transformaciones por proveedor (D2), y verificar que una dirección con `+etiqueta` y otra con puntos llegan intactas salvo por las mayúsculas

## 2. H-13 · Ninguna pantalla sin salida

- [x] 2.1 Dar a `lib/api.ts` un punto donde avisar de que el sistema ha rechazado la credencial
- [x] 2.2 Engancharlo al proveedor de sesión para que descarte la sesión y deje escrito el motivo
- [x] 2.3 Verificar en navegador real: con la lista abierta, invalidar la credencial y comprobar que se llega a la pantalla de acceso **sin recargar**, y que explica por qué
- [x] 2.4 Verificar que un fallo que no es de credencial no cierra la sesión (cubierto por la prueba de Vitest sobre los tres casos: 500, corte de red y 422)

## 3. H-14 · Un dato, un valor

- [x] 3.1 Hacer que la respuesta de escritura devuelva lo persistido, tanto al crear como al actualizar
- [x] 3.2 Verificar comparando campo por campo la tarea que devuelve la escritura con la que devuelve la lectura siguiente

## 4. Pruebas

Derivan de los escenarios añadidos y modificados en los deltas de este cambio.

- [x] 4.1 `auth`: alta repetida con otras mayúsculas, y acceso con otras mayúsculas
- [x] 4.2 `auth`: una dirección con `+etiqueta` y con puntos sobrevive intacta salvo por las mayúsculas
- [x] 4.3 `tasks`: lo que devuelve crear y lo que devuelve actualizar coincide campo por campo con lo que devuelve leer
- [x] 4.4 Verificar que cada prueba nueva **falla** si se revierte su arreglo, para saber que muerde

## 5. Cierre

- [x] 5.1 Ejecutar las dos suites completas, más `lint`, `typecheck` y `build` en ambos proyectos
- [x] 5.2 Actualizar `docs/hallazgos.md`: H-11, H-13 y H-14 dejan de estar abiertos, con la fecha y cómo se resolvieron
- [x] 5.3 Verificar que el diff no toca nada fuera del alcance de este cambio, y que no añade dependencias

## 6. Correcciones de la revisión adversarial

El grupo 5 se archivó sin ejecutar, y era justo el que existía para pillar lo de abajo. Queda constancia.

- [x] 6.1 `yandex_convert_yandexru` seguía activo por no estar en la lista, y convertía `yandex.com` y `ya.ru` a `yandex.ru`: reabría H-11 por otra puerta. Apagado, y cubierto por prueba
- [x] 6.2 La migración normalizaba con `lower()` de SQL, que solo baja ASCII: dejaba `josÉ@…`, un valor que la aplicación nunca genera. Normaliza en JavaScript con la función que exporta el validador
- [x] 6.3 El 401 de la propia llamada de cierre de sesión disparaba el aviso, así que salir a propósito aterrizaba en el acceso con «tu sesión ha caducado». Silenciado para esa llamada, y cubierto por prueba
- [x] 6.4 La pantalla de la lista seguía sin salida para los errores que **no** son 401. Añadidos reintentar y cerrar sesión
- [x] 6.5 Índice único sobre `lower(email)`: el validador solo no hacía imposible el duplicado, y el apartado que lo afirmaba queda corregido
- [x] 6.6 Escritura y lectura se comparaban entre sí saliendo del mismo transformer, así que borrar un campo las dejaba iguales. Añadido el conjunto cerrado de campos de tarea
- [x] 6.7 Los casos por proveedor usaban la sintaxis equivocada y no vigilaban nada. Corregidos: las siete transformaciones destructivas tumban ahora una prueba cada una
- [x] 6.8 `npm run lint` del backend fallaba y se había reportado como limpio. Arreglado
- [x] 6.9 `.claude/launch.json` estaba fuera del alcance declarado. Retirado
