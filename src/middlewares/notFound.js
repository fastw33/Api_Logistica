const notFound = (req, res, next) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada',
  })
}

module.exports = notFound
