const errorHandler = (err, req, res, next) => {
  console.error('Error atrapado:', err)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: true,
      message: 'El archivo supera el tamaño máximo permitido (10 MB)',
    })
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      error: true,
      message: 'Se excedió el número máximo de archivos permitidos',
    })
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: true,
      message: 'Campo de archivo no permitido.',
    })
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: true,
      message: 'JSON malformado. Revisa la estructura del body.',
    })
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: true,
      message: 'Ya existe un registro con estos datos.',
      details: err.errors?.map(item => item.message),
    })
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: true,
      message: 'El registro relacionado no existe o tiene dependencias.',
    })
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: true,
      message: 'Error de validación en los datos enviados.',
      details: err.errors?.map(item => item.message),
    })
  }

  const status = err.status || 500

  return res.status(status).json({
    error: true,
    message: err.message || 'Error interno del servidor',
  })
}

module.exports = errorHandler
