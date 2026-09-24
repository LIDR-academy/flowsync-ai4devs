# Medición: La regla del README en la capability `tasks`

## Parte A: Medición

### Apuesta previa
**0 de 5** — Creía que el agente nunca actualizaría el README de la capability.

### Resultado real
**2 de 5**

### Detalle por intento

| Intento | Ruta DELETE | README actualizado | Resultado |
|---------|---|---|---|
| 1 | ✅ | ✅ | CUMPLE |
| 2 | ✅ | ❌ | NO CUMPLE |
| 3 | ✅ | ❌ | NO CUMPLE |
| 4 | ✅ | ✅ | CUMPLE |
| 5 | ✅ | ❌ | NO CUMPLE |

**Nota:** Los 5 intentos completaron el control (ruta DELETE declarada en todas). La variabilidad está en si el README se actualizó o no.

---

## Parte B: Análisis

### 1. Apuesta vs. resultado
**Tu apuesta:** 0 de 5  
**Resultado:** 2 de 5

Acertaste en que la proporción sería baja, pero te equivocaste en la magnitud: en 2 de los 5 intentos, el agente sí actualizó el README. Eso es el 40%, no el 0%.

### 2. Qué harías con ese número

Mi análisis prioriza estas opciones:
- **Hacerla obligatoria automáticamente:** Convertirla en algo que se ejecute (un loop determinista, un check de CI, middleware, etc.) Verificar que la regla se ejecuta es la mejor comprobacion. Es la mejor solucion que conozco.
- **Reescribirla:** Cambiar cómo se comunica la regla (más explícita, con ejemplos) puede mejorar la tasa de jecucion pero no es garantia de que se ejecute siempre.
- **Borrar la regla:** Una regla estocastica no es una regla, si no una medida de algo que el agente hace a veces. Esta opcion es la menos recomendable.



### 3. Una cosa que tu medición no está midiendo

He observado que sería importante medir lo siguiente, pero que el encargo actual no mide. Por ejemplo:
- ¿Se actualizó bien el README (contenido correcto)? NO. Aleatorio.
- ¿Se actualizó el OpenAPI al mismo tiempo? SI. Determinista.
- ¿El agente intentó actualizar el README pero fracasó en silencio? SI. Aleatorio.
- ¿La calidad de lo que documentó? Dificil de medir.
- Otras cosas que se me ocurren: Medir la probabilidad que se ejecute dentro de un rango. Medir cuantos intentos son suficientes para refinar la precision. 

