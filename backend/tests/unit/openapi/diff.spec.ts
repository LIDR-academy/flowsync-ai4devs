import { test } from '@japa/runner'
import { describeDifference, diffDocuments, formatValue } from '#openapi/diff'

test.group('openapi diff', () => {
  test('dos documentos iguales no tienen diferencias', ({ assert }) => {
    const document = { openapi: '3.0.0', paths: { '/tasks': { get: { responses: { 200: {} } } } } }

    assert.deepEqual(diffDocuments(document, structuredClone(document)), [])
  })

  test('un valor cambiado se reporta con su ruta y los dos valores', ({ assert }) => {
    const differences = diffDocuments(
      { components: { schemas: { Task: { properties: { title: { type: 'number' } } } } } },
      { components: { schemas: { Task: { properties: { title: { type: 'string' } } } } } }
    )

    assert.deepEqual(differences, [
      {
        kind: 'distinto',
        path: 'components.schemas.Task.properties.title.type',
        versioned: 'number',
        generated: 'string',
      },
    ])
  })

  test('lo que solo está en el versionado sobra y lo que solo está en el generado falta', ({
    assert,
  }) => {
    const differences = diffDocuments(
      { paths: { '/legacy': { get: {} } } },
      { paths: { '/tasks/{id}/due-date': { put: {} } } }
    )

    assert.deepEqual(
      differences.map(({ kind, path }) => ({ kind, path })),
      [
        { kind: 'sobra', path: 'paths./legacy' },
        { kind: 'falta', path: 'paths./tasks/{id}/due-date' },
      ]
    )
  })

  test('una rama ausente se reporta una vez, sin enumerar lo que hay dentro', ({ assert }) => {
    const differences = diffDocuments(
      {},
      { paths: { '/tasks': { get: { responses: { 200: {}, 401: {}, 422: {} } } } } }
    )

    assert.lengthOf(differences, 1)
    assert.equal(differences[0].path, 'paths')
  })

  test('las listas se comparan por posición y sobra o falta el elemento', ({ assert }) => {
    const differences = diffDocuments(
      { required: ['title', 'status'] },
      { required: ['title', 'estado', 'dueDate'] }
    )

    assert.deepEqual(differences, [
      { kind: 'distinto', path: 'required.[1]', versioned: 'status', generated: 'estado' },
      { kind: 'falta', path: 'required.[2]', generated: 'dueDate' },
    ])
  })

  test('un tipo distinto en la misma ruta es un valor cambiado, no una rama nueva', ({
    assert,
  }) => {
    const differences = diffDocuments({ security: [] }, { security: { bearer: [] } })

    assert.lengthOf(differences, 1)
    assert.equal(differences[0].kind, 'distinto')
    assert.equal(differences[0].path, 'security')
  })

  test('los valores largos se recortan para que quepan en una línea', ({ assert }) => {
    const formatted = formatValue({ description: 'x'.repeat(200) })

    assert.lengthOf(formatted, 80)
    assert.isTrue(formatted.endsWith('…'))
  })

  test('cada diferencia se describe con su etiqueta y su ruta', ({ assert }) => {
    const [distinto, sobra, falta] = [
      { kind: 'distinto' as const, path: 'info.version', versioned: '9.9.9', generated: '1.0.0' },
      { kind: 'sobra' as const, path: 'paths./legacy', versioned: {} },
      { kind: 'falta' as const, path: 'paths./tasks', generated: {} },
    ].map(describeDifference)

    assert.match(distinto, /^distinto\s+info\.version: "9\.9\.9" → "1\.0\.0"$/)
    assert.match(sobra, /^sobra en el versionado\s+paths\.\/legacy: \{\}$/)
    assert.match(falta, /^falta en el versionado\s+paths\.\/tasks: \{\}$/)
  })
})
