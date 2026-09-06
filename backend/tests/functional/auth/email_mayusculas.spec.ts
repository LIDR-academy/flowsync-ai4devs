import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { errores } from '#tests/helpers/api'

/**
 * H-11: el email no distingue mayúsculas de minúsculas.
 *
 * Se arregló en el Módulo 3, sobre `s3/start`, y **el arreglo no cruzó a
 * `s4/start`**: la rama del curso llega a la misma funcionalidad por otro
 * camino y trae su propio validador, sin normalización. El hallazgo estaba
 * marcado «Resuelto» y estaba vivo. Estas pruebas vienen con el arreglo para
 * que no vuelva a depender de que alguien se acuerde de mirar.
 */
const cuenta = {
  fullName: 'Ada Lovelace',
  email: 'ada@flowsync.test',
  password: 'secreto123',
  passwordConfirmation: 'secreto123',
}

test.group('Auth | el email no distingue mayúsculas', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('un alta repetida con otras mayúsculas se rechaza como duplicada', async ({
    client,
    assert,
  }) => {
    await client.post('/api/v1/auth/signup').json(cuenta)

    const repetido = await client
      .post('/api/v1/auth/signup')
      .json({ ...cuenta, email: 'Ada@FlowSync.Test' })

    // Rechazo de validación, no error de servidor: si la normalización ocurriera
    // después de comprobar la unicidad, esto sería un 500 contra el índice de la
    // base en lugar de un «ese email ya está registrado».
    repetido.assertStatus(422)
    assert.equal(errores(repetido)[0].field, 'email')
    assert.lengthOf(await User.query().where('email', cuenta.email), 1)
  })

  test('se entra con el email escrito de otra forma', async ({ client, assert }) => {
    await client.post('/api/v1/auth/signup').json(cuenta)

    const acceso = await client
      .post('/api/v1/auth/login')
      .json({ email: 'ADA@FLOWSYNC.TEST', password: cuenta.password })

    acceso.assertStatus(200)
    assert.equal(acceso.body().data.user.email, cuenta.email)
  })

  test('la dirección se guarda en minúsculas, venga como venga', async ({ client, assert }) => {
    const alta = await client
      .post('/api/v1/auth/signup')
      .json({ ...cuenta, email: 'AdA@FlowSync.Test' })

    alta.assertStatus(200)
    assert.equal(alta.body().data.user.email, 'ada@flowsync.test')
    await assert.exists({ table: 'users', email: 'ada@flowsync.test' })
  })

  test('ninguna familia de proveedor sufre transformaciones extra', async ({ client, assert }) => {
    // `normalizeEmail` trata aparte a Gmail, Outlook, Yahoo, iCloud y Yandex, y
    // cada familia trae su propia transformación destructiva activada por
    // defecto. Cubrir solo Gmail dejaba las otras cuatro sin vigilar, y es en
    // Yandex donde estaba el defecto: convertía yandex.com y ya.ru a yandex.ru,
    // reabriendo este mismo hallazgo por otra puerta.
    //
    // Cada caso usa la transformación destructiva **propia de esa familia**:
    // Gmail quita puntos y convierte googlemail.com, Yahoo separa con guion y no
    // con «+», y Yandex unifica todos sus dominios. Un caso con la sintaxis
    // equivocada pasa siempre y no vigila nada.
    const casos = [
      ['Ada.L+tag@Gmail.com', 'ada.l+tag@gmail.com'],
      ['Ada.L+tag@GoogleMail.com', 'ada.l+tag@googlemail.com'],
      ['Ada.L+tag@Outlook.com', 'ada.l+tag@outlook.com'],
      ['Ada.L-tag@Yahoo.com', 'ada.l-tag@yahoo.com'],
      ['Ada.L+tag@iCloud.com', 'ada.l+tag@icloud.com'],
      ['Ada.L+tag@Yandex.COM', 'ada.l+tag@yandex.com'],
      ['Ada.L@Ya.ru', 'ada.l@ya.ru'],
    ]

    for (const [enviado, esperado] of casos) {
      const alta = await client.post('/api/v1/auth/signup').json({ ...cuenta, email: enviado })

      alta.assertStatus(200)
      assert.equal(alta.body().data.user.email, esperado)
      await assert.exists({ table: 'users', email: esperado })
    }
  })

  test('no se tocan los puntos ni la etiqueta tras el «+»', async ({ client, assert }) => {
    // Quitarlos cambiaría la identidad de la cuenta: hay quien usa `+etiqueta` a
    // propósito para separar su correo.
    const conEtiqueta = await client
      .post('/api/v1/auth/signup')
      .json({ ...cuenta, email: 'Ada.Lovelace+FlowSync@Gmail.com' })

    conEtiqueta.assertStatus(200)
    assert.equal(conEtiqueta.body().data.user.email, 'ada.lovelace+flowsync@gmail.com')
  })

  /**
   * El validador solo no lo hace imposible: cualquier escritura que no pase por
   * él reabre el defecto. El índice único sobre `lower(email)` es la segunda
   * línea, y se comprueba insertando el duplicado por debajo del validador.
   *
   * Su límite es el alfabeto latino sin acentos, que es donde funciona el
   * `lower()` de SQLite; fuera de ahí protege el validador, que normaliza
   * Unicode completo. No es una garantía total, y por eso se dice.
   */
  test('el duplicado tampoco entra saltándose el validador', async ({ assert }) => {
    const fila = { fullName: cuenta.fullName, password: cuenta.password }

    await User.create({ ...fila, email: 'ada@flowsync.test' })

    await assert.rejects(() => User.create({ ...fila, email: 'ADA@FLOWSYNC.TEST' }))
  })
})
