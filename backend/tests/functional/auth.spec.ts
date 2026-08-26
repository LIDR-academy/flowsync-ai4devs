import User from '#models/user'
import { errores, invalido } from '#tests/helpers/api'
import { test } from '@japa/runner'

/**
 * Deriva de openspec/specs/auth/spec.md. Cada caso nombra el requisito del que
 * sale, para que dentro de seis meses se sepa si un fallo rompe una regla de
 * negocio o solo una decisión de implementación.
 */
const cuenta = {
  fullName: 'Ada Lovelace',
  email: 'ada@flowsync.test',
  password: 'contrasena123',
  passwordConfirmation: 'contrasena123',
}

test.group('auth · Alta de cuenta', () => {
  test('un alta correcta crea la cuenta y devuelve una credencial utilizable', async ({
    client,
    assert,
  }) => {
    const alta = await client.post('/api/v1/auth/signup').json(cuenta)

    alta.assertStatus(200)
    assert.properties(alta.body().data, ['token', 'user'])
    assert.equal(alta.body().data.user.email, cuenta.email)

    // Comprueba la base, no solo la respuesta: es lo que valida que el arnés
    // habla con el mismo almacén que la aplicacion.
    await assert.exists({ table: 'users', email: cuenta.email })

    const perfil = await client.get('/api/v1/account/profile').bearerToken(alta.body().data.token)

    perfil.assertStatus(200)
  })

  test('el nombre puede llegar nulo, pero el campo debe viajar', async ({ client, assert }) => {
    const conNulo = await client.post('/api/v1/auth/signup').json({ ...cuenta, fullName: null })

    conNulo.assertStatus(200)
    assert.isNull(conNulo.body().data.user.fullName)

    const { fullName, ...sinCampo } = cuenta
    assert.isString(fullName)

    const omitido = await client
      .post('/api/v1/auth/signup')
      .json(invalido({ ...sinCampo, email: 'otra@flowsync.test' }))

    omitido.assertStatus(422)
  })

  test('la contraseña no sale en ninguna respuesta', async ({ client, assert }) => {
    const alta = await client.post('/api/v1/auth/signup').json(cuenta)
    assert.notProperty(alta.body().data.user, 'password')

    const perfil = await client.get('/api/v1/account/profile').bearerToken(alta.body().data.token)

    assert.notProperty(perfil.body().data, 'password')
  })
})

test.group('auth · Unicidad y requisitos de la contraseña', () => {
  test('un email ya registrado se rechaza señalando el campo', async ({ client, assert }) => {
    await client.post('/api/v1/auth/signup').json(cuenta)
    const repetido = await client.post('/api/v1/auth/signup').json(cuenta)

    repetido.assertStatus(422)
    assert.equal(errores(repetido)[0].field, 'email')
    assert.lengthOf(await User.query().where('email', cuenta.email), 1)
  })

  test('la contraseña debe medir entre 8 y 32 caracteres', async ({ client }) => {
    const corta = 'a'.repeat(7)
    const larga = 'a'.repeat(33)

    const conCorta = await client.post('/api/v1/auth/signup').json({
      ...cuenta,
      password: corta,
      passwordConfirmation: corta,
    })
    conCorta.assertStatus(422)

    const conLarga = await client.post('/api/v1/auth/signup').json({
      ...cuenta,
      password: larga,
      passwordConfirmation: larga,
    })
    conLarga.assertStatus(422)
  })

  test('la repetición debe coincidir', async ({ client, assert }) => {
    const respuesta = await client
      .post('/api/v1/auth/signup')
      .json({ ...cuenta, passwordConfirmation: 'otradistinta123' })

    respuesta.assertStatus(422)
    assert.equal(errores(respuesta)[0].field, 'passwordConfirmation')
  })

  test('informa de todos los problemas a la vez, no solo del primero', async ({
    client,
    assert,
  }) => {
    const respuesta = await client
      .post('/api/v1/auth/signup')
      .json(invalido({ fullName: null, email: 'no-es-un-email', password: 'corta' }))

    respuesta.assertStatus(422)
    const campos = errores(respuesta).map((e) => e.field)
    assert.includeMembers(campos, ['email', 'password'])
    assert.isAbove(errores(respuesta).length, 1)
  })
})

test.group('auth · Un fallo de acceso no revela si la cuenta existe', () => {
  test('contraseña incorrecta y cuenta inexistente dan el mismo resultado', async ({
    client,
    assert,
  }) => {
    await client.post('/api/v1/auth/signup').json(cuenta)

    const conPasswordMala = await client
      .post('/api/v1/auth/login')
      .json({ email: cuenta.email, password: 'incorrectisima' })

    const cuentaInexistente = await client
      .post('/api/v1/auth/login')
      .json({ email: 'nadie@flowsync.test', password: 'incorrectisima' })

    // Compara la respuesta entera, no solo el código: la propiedad que se
    // protege es que nada permita distinguir los dos casos.
    assert.equal(conPasswordMala.status(), cuentaInexistente.status())
    assert.deepEqual(conPasswordMala.body(), cuentaInexistente.body())
  })
})

test.group('auth · Protección y ciclo de vida de la sesión', () => {
  test('sin credencial y con credencial inventada se deniega igual', async ({ client, assert }) => {
    const sinNada = await client.get('/api/v1/account/profile')
    const inventada = await client
      .get('/api/v1/account/profile')
      .bearerToken('oat_XX.inventadisima')

    sinNada.assertStatus(401)
    assert.equal(sinNada.status(), inventada.status())
  })

  test('cerrar sesión invalida la credencial usada', async ({ client }) => {
    const alta = await client.post('/api/v1/auth/signup').json(cuenta)
    const token = alta.body().data.token

    await client.post('/api/v1/account/logout').bearerToken(token)

    const despues = await client.get('/api/v1/account/profile').bearerToken(token)

    despues.assertStatus(401)
  })

  test('con dos sesiones abiertas, cerrar una no cierra la otra', async ({ client }) => {
    await client.post('/api/v1/auth/signup').json(cuenta)

    const credenciales = { email: cuenta.email, password: cuenta.password }
    const primera = await client.post('/api/v1/auth/login').json(credenciales)
    const segunda = await client.post('/api/v1/auth/login').json(credenciales)

    await client.post('/api/v1/account/logout').bearerToken(primera.body().data.token)

    const cerrada = await client
      .get('/api/v1/account/profile')
      .bearerToken(primera.body().data.token)
    cerrada.assertStatus(401)

    const viva = await client.get('/api/v1/account/profile').bearerToken(segunda.body().data.token)
    viva.assertStatus(200)
  })
})
