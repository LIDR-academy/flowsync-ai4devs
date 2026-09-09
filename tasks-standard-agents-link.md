# Tareas para corregir la vinculación de `AGENTS.md`

Este plan implementa la propuesta recomendada en
`standard-agents-link.md`: ambos nombres deben ser archivos regulares con el
mismo contenido operativo completo y una verificación automática de igualdad.

## Resultado esperado

- `AGENTS.md` deja de ser un symlink mal formado.
- `AGENTS.md` contiene la guía completa que hoy está en `CLAUDE.md`.
- `CLAUDE.md` y `AGENTS.md` permanecen byte a byte iguales.
- La divergencia futura falla de forma visible en la validación del repositorio.
- El comportamiento es válido en Windows y sistemas Unix.

## Plan de modificación

### 1. Registrar el estado inicial

- [ ] Confirmar que la rama de trabajo no es `main` ni `s1/start`.
- [ ] Guardar el estado de trabajo y no sobrescribir cambios ajenos.
- [ ] Ejecutar `git ls-tree HEAD -- AGENTS.md CLAUDE.md`.
- [ ] Confirmar que el estado actual muestra `AGENTS.md` como `120000` y
      `CLAUDE.md` como `100644`.

### 2. Convertir `AGENTS.md` en archivo regular completo

- [ ] Eliminar el índice de symlink de `AGENTS.md` sin eliminar el contenido
      canónico de `CLAUDE.md`.
- [ ] Crear `AGENTS.md` como archivo regular.
- [ ] Copiar el contenido completo de `CLAUDE.md` a `AGENTS.md`, preservando el
      texto, el orden de las secciones y la codificación UTF-8.
- [ ] Evitar mantener la versión abreviada actual y retirar el título ambiguo
      que hace parecer que el archivo es `CLAUDE.md`.
- [ ] Comprobar que Git muestra ambos archivos con modo `100644`.

### 3. Definir la fuente operativa y el procedimiento de edición

- [ ] Declarar en la documentación de contribución que los dos archivos deben
      permanecer idénticos.
- [ ] Elegir `CLAUDE.md` como archivo canónico de edición por ser la guía
      existente y más completa.
- [ ] Indicar que cualquier cambio en la guía debe propagarse a
      `AGENTS.md` en el mismo commit.
- [ ] No introducir enlaces simbólicos ni redirecciones textuales como
      sustituto de la guía completa.

### 4. Añadir una comprobación automática

- [ ] Crear un script pequeño y portable que compare `AGENTS.md` y
      `CLAUDE.md` byte a byte.
- [ ] Hacer que el script termine con código distinto de cero si falta uno de
      los archivos o si sus contenidos divergen.
- [ ] Emitir un mensaje de error que indique cómo corregir la divergencia.
- [ ] Integrar el script en el comando de validación ya usado por el proyecto
      o en el workflow de CI, evitando exigir dependencias nuevas.
- [ ] Añadir una prueba positiva con los archivos iguales y una prueba
      negativa que demuestre que una diferencia se detecta.

### 5. Validar en los sistemas soportados

- [ ] Ejecutar la comprobación en Windows PowerShell.
- [ ] Ejecutar la comprobación en un entorno Unix o equivalente.
- [ ] Revisar el resultado de `git ls-tree HEAD -- AGENTS.md CLAUDE.md`.
- [ ] Revisar que `git cat-file -p HEAD:AGENTS.md` muestre el documento
      completo y no una ruta como `CLAUDE.md`.
- [ ] Probar un checkout limpio y verificar que ambos nombres siguen siendo
      archivos regulares legibles.

### 6. Validación final y cierre

- [ ] Ejecutar la validación del repositorio correspondiente.
- [ ] Ejecutar `git diff --check`.
- [ ] Revisar que el diff solo incluya la conversión de `AGENTS.md`, la
      comprobación automática, su integración y la documentación necesaria.
- [ ] Actualizar `standard-agents-link.md` para reflejar la implementación
      final, sustituyendo el diagnóstico temporal si deja de ser aplicable.
- [ ] Crear el commit con un mensaje convencional que describa la corrección.

## Criterios de aceptación

La modificación se considera terminada únicamente cuando se cumplen todos
estos criterios:

1. `git ls-tree` muestra `100644` para `AGENTS.md` y `CLAUDE.md`.
2. La comparación automática devuelve éxito con el estado final.
3. La comparación falla cuando se introduce una diferencia deliberada.
4. Ninguno de los dos archivos contiene un symlink, una ruta aislada o una
   redirección que requiera interpretación adicional.
5. Un agente que cargue solo `AGENTS.md` recibe las mismas reglas que uno que
   cargue solo `CLAUDE.md`.
6. La validación funciona sin depender de permisos especiales para crear
   symlinks.

## Riesgo residual aceptado

La estrategia conserva dos copias físicas, por lo que una edición manual puede
dejarlas temporalmente divergentes. La comprobación automática limita ese
riesgo al impedir que la divergencia pase inadvertida por la validación o se
integre en la rama protegida. La alternativa de symlink tiene menos
duplicación, pero un riesgo de compatibilidad mayor en el entorno Windows
observado.