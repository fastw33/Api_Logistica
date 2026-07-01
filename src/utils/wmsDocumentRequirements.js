const CLIENT_REQUIRED_DOCUMENTS = [
  'rut',
  'camara_comercio',
  'cedula',
  'certificacion_bancaria',
  'acuerdo_seguridad',
  'tratamiento_datos_personales',
]

const PROVIDER_REQUIRED_DOCUMENTS = [
  'rut',
  'camara_comercio',
  'certificacion_bancaria',
]

const DOCUMENT_LABELS = {
  rut: 'RUT',
  camara_comercio: 'Camara de comercio',
  cedula: 'Cedula',
  certificacion_bancaria: 'Certificacion bancaria',
  acuerdo_seguridad: 'Acuerdo de seguridad',
  tratamiento_datos_personales: 'Tratamiento de datos personales',
}

const DEFAULT_WMS_API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.appfastway.com/api'
    : 'http://localhost:3000/api'

function normalizeBaseUrl(url) {
  return String(url || '')
    .trim()
    .replace(/\/+$/, '')
}

function resolveWmsBaseUrl() {
  return normalizeBaseUrl(process.env.WMS_API_URL) || DEFAULT_WMS_API_URL
}

function buildWmsHeaders() {
  const internalServiceKey = String(process.env.INTERNAL_SERVICE_KEY || '').trim()

  if (!internalServiceKey) {
    const error = new Error(
      'No se puede validar documentos en WMS porque falta INTERNAL_SERVICE_KEY en Api_Logistica'
    )
    error.status = 500
    throw error
  }

  return {
    Accept: 'application/json',
    'x-internal-service-key': internalServiceKey,
  }
}

async function fetchWmsDocuments(resourcePath, notFoundMessage) {
  const baseUrl = resolveWmsBaseUrl()

  let response
  try {
    response = await fetch(`${baseUrl}${resourcePath}`, {
      headers: buildWmsHeaders(),
      signal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    const upstreamError = new Error(
      'No fue posible consultar los documentos en WMS para validar el DO'
    )
    upstreamError.status = 503
    upstreamError.cause = error
    throw upstreamError
  }

  let payload = null
  try {
    payload = await response.json()
  } catch (error) {
    payload = null
  }

  if (!response.ok) {
    const error = new Error(payload?.message || notFoundMessage)
    error.status = response.status === 404 ? 404 : 400
    error.details = payload
    throw error
  }

  return payload
}

function findMissingDocuments(archivos = [], requiredFields = []) {
  const availableFields = new Set(
    (Array.isArray(archivos) ? archivos : [])
      .filter(item => item?.url)
      .map(item => String(item.campo || '').trim())
      .filter(Boolean)
  )

  return requiredFields.filter(field => !availableFields.has(field))
}

function buildMissingDocumentsMessage(entityLabel, entityId, missingDocuments) {
  const missingLabels = missingDocuments.map(
    field => DOCUMENT_LABELS[field] || field.replace(/_/g, ' ')
  )

  return `${entityLabel} ${entityId} no tiene completos los documentos base para crear el DO. Faltan: ${missingLabels.join(
    ', '
  )}`
}

async function assertClientHasRequiredDocuments(clientId) {
  if (!clientId) return

  const payload = await fetchWmsDocuments(
    `/cliente/${encodeURIComponent(clientId)}/documentos`,
    'No fue posible obtener los documentos del cliente'
  )
  const missingDocuments = findMissingDocuments(
    payload?.archivos,
    CLIENT_REQUIRED_DOCUMENTS
  )

  if (missingDocuments.length > 0) {
    const error = new Error(
      buildMissingDocumentsMessage('El cliente', clientId, missingDocuments)
    )
    error.status = 400
    error.details = {
      entity: 'cliente',
      entityId: clientId,
      missingDocuments,
    }
    throw error
  }
}

async function assertProviderHasRequiredDocuments(providerId) {
  if (!providerId) return

  const payload = await fetchWmsDocuments(
    `/proveedor/${encodeURIComponent(providerId)}/documentos`,
    'No fue posible obtener los documentos del proveedor'
  )
  const missingDocuments = findMissingDocuments(
    payload?.archivos,
    PROVIDER_REQUIRED_DOCUMENTS
  )

  if (missingDocuments.length > 0) {
    const error = new Error(
      buildMissingDocumentsMessage('El proveedor', providerId, missingDocuments)
    )
    error.status = 400
    error.details = {
      entity: 'proveedor',
      entityId: providerId,
      missingDocuments,
    }
    throw error
  }
}

async function assertQuotationThirdPartiesReady(quotation) {
  if (!quotation) return

  await assertClientHasRequiredDocuments(quotation.customer_id)

  const providerIds = [
    ...new Set(
      (Array.isArray(quotation.provider_quotes) ? quotation.provider_quotes : [])
        .map(providerQuote => String(providerQuote?.provider_id || '').trim())
        .filter(Boolean)
    ),
  ]

  await Promise.all(
    providerIds.map(providerId => assertProviderHasRequiredDocuments(providerId))
  )
}

module.exports = {
  assertClientHasRequiredDocuments,
  assertProviderHasRequiredDocuments,
  assertQuotationThirdPartiesReady,
}
