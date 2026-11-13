const test = require('node:test')
const assert = require('node:assert/strict')
const {
  assertCounterpartyHasRequiredDocuments,
  assertQuotationThirdPartiesReady,
  fetchCounterpartyDisplayName,
} = require('../wmsDocumentRequirements')

const providerFields = ['rut', 'camara_comercio', 'certificacion_bancaria']
const clientFields = [
  ...providerFields,
  'cedula',
  'acuerdo_seguridad',
  'tratamiento_datos_personales',
]

function mockWms(t, respond) {
  const previousKey = process.env.INTERNAL_SERVICE_KEY
  const previousUrl = process.env.WMS_API_URL
  process.env.INTERNAL_SERVICE_KEY = 'test-service-key'
  process.env.WMS_API_URL = 'http://wms.test/api'
  t.after(() => {
    if (previousKey === undefined) delete process.env.INTERNAL_SERVICE_KEY
    else process.env.INTERNAL_SERVICE_KEY = previousKey
    if (previousUrl === undefined) delete process.env.WMS_API_URL
    else process.env.WMS_API_URL = previousUrl
  })

  const paths = []
  t.mock.method(globalThis, 'fetch', async url => {
    const path = new URL(url).pathname
    paths.push(path)
    const { status = 200, ...payload } = await respond(path)
    return { ok: status < 400, status, json: async () => payload }
  })
  return paths
}

function documents(fields) {
  return { archivos: fields.map(campo => ({ campo, url: `https://files.test/${campo}.pdf` })) }
}

for (const line of ['harvest', 'greenway']) {
  test(`${line}: valida la contraparte exclusivamente en proveedores`, async t => {
    const paths = mockWms(t, () => documents(providerFields))
    await assertQuotationThirdPartiesReady({ line_key: line, customer_id: '900123' })
    assert.deepEqual(paths, ['/api/proveedor/900123/documentos'])
  })

  test(`${line}: bloquea si falta un documento del proveedor`, async t => {
    mockWms(t, () => documents(['rut', 'camara_comercio']))
    await assert.rejects(
      assertQuotationThirdPartiesReady({ line_key: line, customer_id: '900123' }),
      error => {
        assert.equal(error.status, 400)
        assert.equal(error.details.entity, 'proveedor')
        assert.deepEqual(error.details.missingDocuments, ['certificacion_bancaria'])
        return true
      }
    )
  })

  test(`${line}: un proveedor inexistente no se busca como cliente`, async t => {
    const paths = mockWms(t, () => ({ status: 404, message: 'Proveedor no encontrado' }))
    await assert.rejects(
      assertQuotationThirdPartiesReady({ line_key: line, customer_id: '900123' }),
      { status: 404 }
    )
    assert.deepEqual(paths, ['/api/proveedor/900123/documentos'])
  })

  test(`${line}: consulta el nombre del proveedor para la CT`, async t => {
    const paths = mockWms(t, () => ({ Nombre: 'Proveedor de materiales' }))
    assert.equal(await fetchCounterpartyDisplayName('900123', line), 'Proveedor de materiales')
    assert.deepEqual(paths, ['/api/proveedor/900123'])
  })
}

test('Fastway conserva los seis documentos de cliente y valida proveedores adicionales', async t => {
  const paths = mockWms(t, path => documents(path.includes('/cliente/') ? clientFields : providerFields))
  await assertQuotationThirdPartiesReady({
    line_key: 'fastway',
    customer_id: 'cliente-1',
    provider_quotes: [{ provider_id: 'transportista-1' }],
  })
  assert.deepEqual(paths, [
    '/api/cliente/cliente-1/documentos',
    '/api/proveedor/transportista-1/documentos',
  ])
})

test('Fastway sigue bloqueando documentos exclusivos de cliente faltantes', async t => {
  mockWms(t, () => documents(providerFields))
  await assert.rejects(
    assertQuotationThirdPartiesReady({ line_key: 'fastway', customer_id: 'cliente-1' }),
    error => {
      assert.equal(error.details.entity, 'cliente')
      assert.deepEqual(error.details.missingDocuments, [
        'cedula', 'acuerdo_seguridad', 'tratamiento_datos_personales',
      ])
      return true
    }
  )
})

test('Harvest valida todos los proveedores adicionales sin repetir la contraparte', async t => {
  const paths = mockWms(t, () => documents(providerFields))
  await assertQuotationThirdPartiesReady({
    line_key: 'harvest',
    customer_id: 'principal',
    provider_quotes: [
      { provider_id: 'principal' },
      { provider_id: 'otro' },
      { provider_id: 'otro' },
      { provider_id: '' },
    ],
  })
  assert.deepEqual(paths, [
    '/api/proveedor/principal/documentos',
    '/api/proveedor/otro/documentos',
  ])
})

test('Greenway bloquea cuando un proveedor adicional está incompleto', async t => {
  mockWms(t, path => documents(path.includes('/principal/') ? providerFields : []))
  await assert.rejects(
    assertQuotationThirdPartiesReady({
      line_key: 'greenway', customer_id: 'principal', provider_quotes: [{ provider_id: 'otro' }],
    }),
    error => {
      assert.equal(error.details.entityId, 'otro')
      assert.deepEqual(error.details.missingDocuments, providerFields)
      return true
    }
  )
})

test('La creación directa de DO usa proveedores y normaliza la línea', async t => {
  const paths = mockWms(t, () => documents(providerFields))
  await assertCounterpartyHasRequiredDocuments('NIT/1', ' Greenway ')
  assert.deepEqual(paths, ['/api/proveedor/NIT%2F1/documentos'])
})

test('Un archivo sin URL no satisface el requisito documental', async t => {
  mockWms(t, () => ({
    archivos: [...documents(['rut', 'camara_comercio']).archivos, { campo: 'certificacion_bancaria' }],
  }))
  await assert.rejects(
    assertCounterpartyHasRequiredDocuments('principal', 'harvest'),
    { status: 400 }
  )
})

test('Una falla de WMS bloquea el paso a DO', async t => {
  mockWms(t, () => { throw new Error('WMS no disponible') })
  await assert.rejects(
    assertCounterpartyHasRequiredDocuments('principal', 'greenway'),
    { status: 503 }
  )
})
