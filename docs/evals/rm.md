# Evaluacion

## Parte A

### Prediccion

Mi apuesta es que en 4 de 5 ejecuciones el README quedara actualizado

### Encargo

```text
Añade a la capability tasks el endpoint DELETE /api/v1/tasks/:id, que borra una tarea y devuelve 204 sin cuerpo. Impleméntalo en el controlador que ya existe y declara su ruta junto a las demás de tasks.
```

### Comprobaciones

Primero se comprobo que la ruta DELETE quedara declarada y despues se reviso si el README de la capability tasks mencionaba el nuevo endpoint

### Resultados

| Ejecucion | Control | README |
| --------- | ------- | ------ |
| 1         | PASS    | PASS   |
| 2         | PASS    | FAIL   |
| 3         | PASS    | FAIL   |
| 4         | PASS    | PASS   |
| 5         | PASS    | FAIL   |

### Resultado

El README quedo actualizado en 3 de 5 ejecuciones

## Parte B

### Apuesta y resultado

Mi apuesta fue de 4 de 5 y el resultado fue de 3 de 5 ejecuciones con el README actualizado

### Que haria con la regla

Convertiria la regla en algo que se ejecute automaticamente porque la medicion muestra que escribir la regla en CLAUDE.md no garantiza que el README se actualice en cada intento

