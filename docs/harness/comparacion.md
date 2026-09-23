# Comparación de experimento: Claude Code sin harness vs. con harness

**Autor:** Ricardo Gabriel Martínez Zorrero\
**Tarea evaluada:** FLOW-6

## Parte A: comparación

  -----------------------------------------------------------------------
  Criterio                Sin harness             Con harness
  ----------------------- ----------------------- -----------------------
  **1. Archivos tocados** 19 archivos.            24 archivos.

  **2. Convenciones       Buenas prácticas de     Las mismas convenciones
  respetadas**            seguridad, dejando las  observadas sin harness,
                          credenciales en `.env`, además de la
                          y separación de la      arquitectura con
                          lógica de vista y       **Factory / Interface /
                          controlador.            Builder** indicada en
                                                  el harness, comentarios
                                                  en español y
                                                  comentarios orientados
                                                  a guiar a futuros
                                                  programadores en tareas
                                                  de mantenimiento.

  **2. Convenciones no    No se identificó        **Cumplimiento parcial
  respetadas**            ninguna convención      de la convención de
                          explícitamente indicada comentarios:** aunque
                          que incumpliera, ya que el código de
                          no existía `CLAUDE.md`  implementación sí
                          ni restricciones        incluyó comentarios en
                          adicionales en la tarea español orientados a
                          de Jira.                futuros
                                                  desarrolladores, en los
                                                  archivos de tests no
                                                  agregó dichos
                                                  comentarios y el cuerpo
                                                  de los tests quedó en
                                                  inglés.

  **3. Intervenciones**   0\. Se utilizó el       0\. Se utilizó el
                          prompt una sola vez.    prompt una sola vez.

  **4. Arreglos manuales  Corregir el idioma de   Sustituir el logo de
  antes de mostrarlo al   varios comentarios;     Google por una imagen y
  equipo**                implementar la          completar la
                          estructura de Factory / documentación de los
                          Interface / Builder;    tests con comentarios
                          sustituir el dibujo     en español orientados a
                          vectorial del logo de   futuros
                          Google por una imagen.  desarrolladores.
  -----------------------------------------------------------------------

## Parte B: las tres líneas

1.  **Piezas montadas y cuál costó más de lo esperado.** Se montaron el
    MCP de Jira, la versión correspondiente de Node y la librería Ally.
    Lo que consumió más tiempo fue Node: el ejercicio indicaba
    compatibilidad con Node 20+, pero al ejecutar `npm install` varias
    librerías requerían Node 24 o superior. Fue necesario instalar NVM
    manualmente en Windows, descargar una versión más reciente y ajustar
    el entorno para que utilizara esa versión.

2.  **Primera diferencia observada entre las dos salidas.** La primera
    diferencia claramente observable fue la inclusión, en la ejecución
    con harness, de archivos de arquitectura para implementar el patrón
    Interface / Factory / Builder. También se observó una mejora notable
    en la calidad de los comentarios, especialmente en su utilidad como
    guía para mantenimientos futuros.

3.  **Algo escrito en el harness que el agente no cumplió.** El harness
    indicaba crear comentarios en español que explicaran el código y
    sirvieran de referencia a futuros programadores. **Esta instrucción
    se cumplió en el código de implementación, pero no al 100% en los
    tests:** los archivos de pruebas no incluyeron esos comentarios y el
    cuerpo de los tests quedó en inglés.

## Prompt utilizado en ambas instancias

``` text
Eres un experto en desarrollo de software.
Realiza la implementación de la tarea identificada como FLOW-6
Asegúrate que el código compile correctamente después de realizados los cambios.
Realiza las pruebas necesarias para verificar que la funcionalidad se haya implementado correctamente.
Guarda los cambios realizados en una memoria técnica en el archivo FLOW-6.MD
```
