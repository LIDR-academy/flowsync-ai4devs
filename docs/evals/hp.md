# Evaluación de Reglas de Proceso en Capabilities

## Parte A · Medición

* **Apuesta inicial:** 3/5

### Resultados por intento

| Intento | ¿Ruta DELETE creada? (Control) | ¿README.md actualizado? (Resultado) |
| :---: | :---: | :---: |
| 1 | Sí | Sí |
| 2 | Sí | Sí |
| 3 | Sí | Sí |
| 4 | Sí | Sí |
| 5 | Sí | Sí |

* **Resultado final:** 5 / 5 veces cumplidas (100%).

---

## Parte B · Análisis

### 1. Apuesta y Resultado
* **Apuesta inicial:** 3/5.
* **Resultado real:** 5 / 5 ejecuciones exitosas.
* **Conclusión:** Claude Code demostró una adherencia perfecta (100%) a la regla pasiva de `CLAUDE.md` sobre mantener la documentación al día en el mismo commit de la capability, superando la expectativa de que los LLM tienden a ignorar sistemáticamente las reglas pasivas de proceso.

### 2. Qué hacer con la regla de proceso
* **Decisión:** Mantenerla en `CLAUDE.md` y complementarla con automatización (Hook / CI).
* **Justificación:** Aunque en esta muestra reducida (5/5) el agente la respetó siempre gracias al fuerte contexto del proyecto, el comportamiento de un LLM no es puramente determinista. Para garantizar un 100% de cumplimiento en equipos grandes o con prompts más complejos, la regla en `CLAUDE.md` sirve como guía proactiva para el agente, pero debería haber un check de CI/CD o Linter que valide la presencia de cambios en la documentación cuando se tocan rutas/controladores.

### 3. Lo que la medición NO está midiendo
* **Calidad de la documentación:** Se midió si el agente añadía/actualizaba la tabla y los ejemplos en `README.md`, pero no si la redacción es óptima o si las explicaciones técnicas son las más adecuadas para un desarrollador humano.
* **Cumplimiento de reglas no solicitadas:** No se evaluó en detalle si la estructura del commit o el formato de las ramas creadas cumplía con todas las demás especificaciones implícitas de `CLAUDE.md`.
* **Degradación del contexto:** El experimento se realizó siempre en sesiones limpias con un prompt directo. No mide qué pasaría si la regla se prueba al final de un chat largo con la ventana de contexto saturada.