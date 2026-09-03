import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: que el responsable se pueda identificar, que
 * la tarea no filtre datos de la cuenta, y que una cuenta sin nombre siga
 * teniendo iniciales.
 *
 * El requisito habla de «una tarea, suelta o dentro de la lista», así que cada
 * scenario se comprueba en los dos sitios donde una tarea llega al cliente:
 * `GET /api/v1/tasks` y `GET /api/v1/tasks/:id`. Son dos transformers
 * distintos, y comprobar solo uno dejaría el otro sin red.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // La tarea suelta informa del vencimiento y por eso exige el día de quien
  // mira. Aquí no se prueba el vencimiento: es solo el parámetro que hace
  // falta para poder leer la tarea.
  const DIA_DE_REFERENCIA = '2026-08-20'

  /**
   * Deja creada una cuenta con una tarea a su nombre y devuelve lo necesario
   * para leerla por los dos caminos.
   */
  async function tareaDe(
    client: any,
    { fullName, email }: { fullName: string | null; email: string }
  ) {
    await User.create({ fullName, email, password: 'secreto123' })

    const login = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })
    const token = login.body().data.token as string

    const creada = await client
      .post('/api/v1/tasks')
      .header('Authorization', `Bearer ${token}`)
      .json({ title: 'Revisar el informe' })

    creada.assertStatus(201)

    return { token, id: creada.body().data.id as number }
  }

  /** El `assignee` de esa tarea tal y como lo devuelven la lista y la tarea suelta. */
  async function responsableEnAmbos(client: any, token: string, id: number) {
    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)
    lista.assertStatus(200)

    const suelta = await client
      .get(`/api/v1/tasks/${id}`)
      .qs({ today: DIA_DE_REFERENCIA })
      .header('Authorization', `Bearer ${token}`)
    suelta.assertStatus(200)

    const enLaLista = lista.body().data.find((tarea: any) => tarea.id === id)

    return { enLaLista: enLaLista.assignee, suelta: suelta.body().data.assignee }
  }

  test('el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const { token, id } = await tareaDe(client, {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    })

    const { enLaLista, suelta } = await responsableEnAmbos(client, token, id)

    for (const assignee of [enLaLista, suelta]) {
      assert.equal(assignee.fullName, 'Ada Lovelace')
      assert.equal(assignee.initials, 'AL')
    }
  })

  test('la tarea no filtra datos de la cuenta de su responsable', async ({ client, assert }) => {
    const { token, id } = await tareaDe(client, {
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
    })

    const { enLaLista, suelta } = await responsableEnAmbos(client, token, id)

    for (const assignee of [enLaLista, suelta]) {
      // El scenario dice «ni el email ni ningún otro dato de acceso», y el
      // requisito lo cierra: junto a la tarea no va NINGÚN otro dato de la
      // cuenta. Por eso se comprueba el juego de claves exacto y no solo la
      // ausencia del email: en cuanto un cliente recibe un dato de más, ya no
      // se le puede quitar sin romperlo.
      assert.deepEqual(Object.keys(assignee).sort(), ['fullName', 'id', 'initials'])
      assert.notInclude(JSON.stringify(assignee), 'ada@example.com')
    }

    // Y sobre el **cuerpo entero**, no solo sobre el objeto del responsable.
    // Mirar solo `assignee` deja pasar que el email cuelgue de la tarea, o de
    // la respuesta, por fuera de ese objeto: el juego de claves de arriba
    // seguiría siendo exacto y el dato estaría filtrado igual.
    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)
    const detalle = await client
      .get(`/api/v1/tasks/${id}?today=2026-09-02`)
      .header('Authorization', `Bearer ${token}`)

    for (const respuesta of [lista, detalle]) {
      assert.notInclude(JSON.stringify(respuesta.body()), 'ada@example.com')
    }
  })

  test('un responsable sin nombre llega sin nombre pero con iniciales', async ({
    client,
    assert,
  }) => {
    const { token, id } = await tareaDe(client, {
      fullName: null,
      email: 'sin-nombre@example.com',
    })

    const { enLaLista, suelta } = await responsableEnAmbos(client, token, id)

    for (const assignee of [enLaLista, suelta]) {
      // Nulo, no una cadena vacía ni el email colocado en su sitio: la
      // interfaz tiene que poder distinguir «no tiene nombre» para escribir
      // «Sin nombre», y las iniciales son lo que la deja representarlo sin
      // recurrir al email.
      assert.isNull(assignee.fullName)
      assert.equal(assignee.initials, 'SE')
      assert.notInclude(JSON.stringify(assignee), 'sin-nombre@example.com')
    }
  })
})
