function getUniqueFieldError(err, field) {
  return err.errors?.find(item => item.path === field) || null
}

function getUniqueFieldValue(err, field) {
  return err.fields?.[field] ?? getUniqueFieldError(err, field)?.value ?? null
}

function logError(err, req, status) {
  if (status < 500) {
    console.warn('Error controlado:', {
      status,
      method: req.method,
      path: req.originalUrl,
      name: err.name,
      message: err.message,
    })
    return
  }

  console.error('Error atrapado:', err)
}

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500

  if (err.code === 'LIMIT_FILE_SIZE') {
    logError(err, req, 413)
    return res.status(413).json({
      error: true,
      message: 'El archivo supera el tamaño máximo permitido (10 MB)',
    })
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    logError(err, req, 400)
    return res.status(400).json({
      error: true,
      message: 'Se excedió el número máximo de archivos permitidos',
    })
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    logError(err, req, 400)
    return res.status(400).json({
      error: true,
      message: 'Campo de archivo no permitido.',
    })
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logError(err, req, 400)
    return res.status(400).json({
      error: true,
      message: 'JSON malformado. Revisa la estructura del body.',
    })
  }

  if (err.code === 'DUPLICATE_INVOICE_NUMBER') {
    logError(err, req, err.status || 409)
    return res.status(err.status || 409).json({
      error: true,
      code: err.code,
      field: err.field,
      value: err.value,
      message: err.message,
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const invoiceNumber = getUniqueFieldValue(err, 'invoice_number')

    logError(err, req, 409)

    if (invoiceNumber != null) {
      return res.status(409).json({
        error: true,
        code: 'DUPLICATE_INVOICE_NUMBER',
        field: 'invoice_number',
        value: invoiceNumber,
        message: `Ya existe una factura con el numero ${invoiceNumber}.`,
      })
    }

    return res.status(409).json({
      error: true,
      code: 'DUPLICATE_RECORD',
      message: 'Ya existe un registro con estos datos.',
      details: err.errors?.map(item => item.message),
    })
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    logError(err, req, 400)
    return res.status(400).json({
      error: true,
      message: 'El registro relacionado no existe o tiene dependencias.',
    })
  }

  if (err.name === 'SequelizeValidationError') {
    logError(err, req, 400)
    return res.status(400).json({
      error: true,
      message: 'Error de validación en los datos enviados.',
      details: err.errors?.map(item => item.message),
    })
  }

  logError(err, req, status)

  return res.status(status).json({
    error: true,
    message: err.message || 'Error interno del servidor',
  })
}

module.exports = errorHandler
