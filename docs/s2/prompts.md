# Prompts — Sesión 2 (copiar/pegar)

## Idea difusa (referencia)
```
Quiero que FlowSync sea una herramienta para que los equipos remotos sepan en qué
trabaja cada uno sin reuniones de sincronización. Algo tipo tareas compartidas pero
más en tiempo real y menos rollo que Jira.
```

## Demo 1 — Discovery (plan mode: Shift+Tab)
```
Actúa como product partner escéptico. Aquí tienes una idea difusa para FlowSync
[pegar párrafo]. Antes de proponer nada, hazme las 5 preguntas que más reducirían
la incertidumbre sobre el problema, los usuarios y el alcance. No asumas; pregunta.
Ten en cuenta el estado actual del repo (auth y perfil ya existen; no hay tareas aún).
```
```
Con mis respuestas, propón el alcance de un MVP: problema, usuarios, propuesta de
valor, alcance (in) y NO-alcance (out). Sé agresivo recortando: es un MVP. Justifica
cada exclusión.
```

## Demo 2 — Generar el PRD
```
Con el alcance que acabamos de consensuar, redacta un PRD de MVP para FlowSync en
docs/prd/flowsync-mvp.md. Estructura: 1) Problema y contexto, 2) Usuarios y JTBD,
3) Propuesta de valor, 4) Alcance / NO-alcance, 5) Requisitos funcionales (RF-1…,
con MUST/SHOULD/MAY), 6) Requisitos no funcionales, 7) Restricciones (stack actual:
AdonisJS 7 + React 19; auth y perfil ya existen, las tareas se planifican aquí),
8) Métricas de éxito. Sé concreto y testable. No inventes cifras de mercado; si algo
es supuesto, márcalo como [SUPUESTO].
```

## Demo 2 — La IA cuestiona (el wow)
```
Actúa ahora como PM adversarial y critica TU PROPIO PRD: ¿qué supuestos son débiles?
¿qué requisito es ambiguo o no testable? ¿qué métrica no se puede medir de verdad?
Propón mejoras concretas, pero no reescribas: lista las objeciones.
```

## Cierre
```
/commit
```
