const service = require('./experimentalQuote.service')

exports.getAll = async (req, res, next) => {
  try {
    const result = await service.listExperimentalQuotes(req.query)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

exports.getById = async (req, res, next) => {
  try {
    const quote = await service.getExperimentalQuoteById(req.params.id)
    if (!quote) {
      return res.status(404).json({ message: 'Cotización experimental no encontrada' })
    }

    res.json({ data: quote })
  } catch (error) {
    next(error)
  }
}

exports.create = async (req, res, next) => {
  try {
    const quote = await service.createExperimentalQuote(
      req.body,
      req.usuario?.id_usuario || null
    )

    res.status(201).json({
      message: 'Cotización experimental creada correctamente',
      data: quote,
    })
  } catch (error) {
    next(error)
  }
}

exports.calculate = async (req, res, next) => {
  try {
    const result = await service.calculateAndPersistExperimentalQuote(
      req.body,
      req.usuario?.id_usuario || null,
      {
        persist: req.body.persist !== false,
      }
    )

    res.status(201).json({
      message:
        req.body.persist === false
          ? 'Vista previa calculada correctamente'
          : 'Cotización experimental calculada correctamente',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

exports.recalculate = async (req, res, next) => {
  try {
    const existing = await service.getExperimentalQuoteById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: 'Cotización experimental no encontrada' })
    }

    const result = await service.calculateAndPersistExperimentalQuote(
      {
        ...(existing.request_payload_json || {}),
        ...req.body,
      },
      req.usuario?.id_usuario || null,
      { existingQuoteId: req.params.id, persist: true }
    )

    res.json({
      message: 'Cotización experimental recalculada correctamente',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

exports.applyToQuotation = async (req, res, next) => {
  try {
    const result = await service.applyExperimentalQuoteToQuotation(
      req.params.id,
      req.params.quotationId,
      req.usuario?.id_usuario || null,
      req.body || {}
    )

    res.json({
      message: 'Cotización experimental aplicada a la CT correctamente',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

exports.update = async (req, res, next) => {
  try {
    const quote = await service.updateExperimentalQuote(
      req.params.id,
      req.body,
      req.usuario?.id_usuario || null
    )

    res.json({
      message: 'Cotización experimental actualizada correctamente',
      data: quote,
    })
  } catch (error) {
    next(error)
  }
}

exports.remove = async (req, res, next) => {
  try {
    const quote = await service.deleteExperimentalQuote(
      req.params.id,
      req.usuario?.id_usuario || null
    )

    res.json({
      message: 'Cotización experimental eliminada correctamente',
      data: quote,
    })
  } catch (error) {
    next(error)
  }
}
