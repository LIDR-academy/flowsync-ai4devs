import { test } from '@japa/runner'
import { diffDocuments, formatDifference } from '#openapi/diff'

/**
 * El comparador que usa `openapi:check` para explicar por qué falla. Lo que se
 * fija aquí es la clasificación —valor distinto, rama que sobra, rama que
 * falta— y que una rama ausente se reporte una sola vez en vez de enumerar
 * todas sus claves.
 */
test.group('OpenAPI | diff', () => {
  test('dos documentos iguales no dan ninguna diferencia', ({ assert }) => {
    const document = { info: { title: 'FlowSync API' }, paths: { '/api/v1/tasks': { get: {} } } }

    assert.deepEqual(diffDocuments(document, structuredClone(document)), [])
  })

  test('un valor distinto se reporta en su ruta', ({ assert }) => {
    const differences = diffDocuments(
      { info: { version: '9.9.9' } },
      { info: { version: '1.0.0' } }
    )

    assert.deepEqual(differences, [
      { path: 'info.version', kind: 'changed', versioned: '9.9.9', regenerated: '1.0.0' },
    ])
  })

  test('una clave que solo está en el versionado sobra', ({ assert }) => {
    const differences = diffDocuments({ paths: { '/tasks': { get: {} } } }, { paths: {} })

    assert.deepEqual(differences, [
      { path: 'paths["/tasks"]', kind: 'extra', versioned: { get: {} } },
    ])
  })

  test('una clave que solo está en el regenerado falta', ({ assert }) => {
    const differences = diffDocuments({ components: {} }, { components: { schemas: { Task: {} } } })

    assert.deepEqual(differences, [
      { path: 'components.schemas', kind: 'missing', regenerated: { Task: {} } },
    ])
  })

  test('una rama ausente se reporta una vez, no clave a clave', ({ assert }) => {
    const responses = { 200: {}, 401: {}, 404: {}, 422: {} }
    const differences = diffDocuments({ get: { responses } }, { get: {} })

    assert.lengthOf(differences, 1)
    assert.equal(differences[0].path, 'get.responses')
  })

  test('los elementos de un array se comparan por posición', ({ assert }) => {
    const differences = diffDocuments({ enum: ['pending', 'done'] }, { enum: ['pending'] })

    assert.deepEqual(differences, [{ path: 'enum[1]', kind: 'extra', versioned: 'done' }])
  })

  test('un cambio de forma en el mismo sitio es un cambio de valor', ({ assert }) => {
    const differences = diffDocuments({ security: [] }, { security: { bearer: [] } })

    assert.lengthOf(differences, 1)
    assert.equal(differences[0].kind, 'changed')
  })

  test('cada diferencia se imprime en una línea legible', ({ assert }) => {
    const [changed] = diffDocuments({ info: { version: '9.9.9' } }, { info: { version: '1.0.0' } })

    assert.equal(formatDifference(changed), 'info.version: versionado "9.9.9" · regenerado "1.0.0"')
  })

  test('un valor largo se recorta al imprimirlo', ({ assert }) => {
    const [missing] = diffDocuments({}, { schemas: { description: 'x'.repeat(500) } })

    const line = formatDifference(missing)
    assert.isBelow(line.length, 140)
    assert.include(line, '…')
  })
})
