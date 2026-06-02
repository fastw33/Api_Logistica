const { toNumber } = require('./experimentalQuote.helpers')

function selectInternalService(payload) {
  const tipo = String(payload.tipo_servicio || '').toUpperCase()
  const modalidad = String(payload.modalidad || '').toUpperCase()
  const variant = String(payload.service_variant || '').toUpperCase()
  const volume = toNumber(payload.volumen)
  const containerSize = String(payload.container_size || '').trim()
  const containerCount = toNumber(payload.numero_contenedores)

  if (tipo === 'MARITIMO') {
    if (modalidad === 'LCL') {
      if (volume == null) {
        return { requiresManualValidation: false, validationErrors: ['volumen'] }
      }
      if (volume <= 0.2) {
        return { serviceCode: 'maritimo_lcl_0_2_metros', requiresManualValidation: false }
      }
      if (volume <= 8) {
        return { serviceCode: 'maritimo_lcl_hasta_8_metros', requiresManualValidation: false }
      }
      return {
        serviceCode: null,
        requiresManualValidation: true,
        reason: 'La operación marítima LCL supera el rango interno máximo de 8 m3',
      }
    }

    if (modalidad === 'FCL') {
      if (!containerCount || containerCount !== 1) {
        return {
          serviceCode: null,
          requiresManualValidation: true,
          reason: 'El tarifario marítimo FCL experimental solo cubre un contenedor por cotización',
        }
      }

      if (containerSize === '20') {
        return { serviceCode: 'maritimo_fcl_1x20', requiresManualValidation: false }
      }

      if (containerSize === '40') {
        return { serviceCode: 'maritimo_fcl_1x40', requiresManualValidation: false }
      }

      return {
        serviceCode: null,
        requiresManualValidation: true,
        reason: 'No se pudo clasificar el FCL sin container_size = 20 o 40',
      }
    }
  }

  if (tipo === 'AEREO') {
    if (modalidad === 'COURIER' || variant === 'COURIER') {
      return { serviceCode: 'aereo_courier', requiresManualValidation: false }
    }
    if (variant === 'TRIANGULACION') {
      return { serviceCode: 'aereo_triangulacion', requiresManualValidation: false }
    }
    if (variant === 'TARIFA_GLOBAL') {
      return { serviceCode: 'aereo_tarifa_global', requiresManualValidation: false }
    }
    return { serviceCode: 'aereo_general', requiresManualValidation: false }
  }

  if (tipo === 'ADUANERO') {
    return { serviceCode: 'agenciamiento_aduanero', requiresManualValidation: false }
  }

  if (tipo === 'TERRESTRE') {
    if (modalidad === 'OTM' || variant === 'OTM') {
      return { serviceCode: 'transporte_terrestre_otm', requiresManualValidation: false }
    }
    if (modalidad === 'FCL' || variant === 'FCL') {
      return { serviceCode: 'transporte_terrestre_fcl', requiresManualValidation: false }
    }
  }

  return {
    serviceCode: null,
    requiresManualValidation: true,
    reason: 'No se pudo clasificar la operación con certeza en el tarifario interno',
  }
}

module.exports = {
  selectInternalService,
}
