const fs = require('fs')
const path = require('path')
const { sequelize } = require('../../config/db')
const { createAuditLog } = require('../../utils/audit')
const Quotation = require('../quotations/quotation.model')
const QuotationDocument = require('./quotationDocument.model')

function ensureQuotationEditable(quotation) {
  if (quotation?.status === 'CONVERTIDA') {
    const error = new Error('La CT convertida a DO ya no puede modificarse')
    error.status = 400
    throw error
  }

  if (quotation?.closure_status === 'CIERRE_NO_EXITOSO') {
    const error = new Error('La CT cerrada como no exitosa ya no puede modificarse')
    error.status = 400
    throw error
  }
}

function resolveLocalUploadPath(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith('/uploads/')) return null
  const relativePath = fileUrl.replace('/uploads/', '')
  return path.join(__dirname, '..', '..', 'uploads', relativePath)
}

async function createQuotationDocument(quotationId, data, userId) {
  const transaction = await sequelize.transaction()

  try {
    const quotation = await Quotation.findByPk(quotationId, { transaction })
    if (!quotation) {
      const error = new Error('Cotización no encontrada')
      error.status = 404
      throw error
    }

    ensureQuotationEditable(quotation)

    const document = await QuotationDocument.create(
      {
        ...data,
        quotation_id: quotationId,
        uploaded_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { transaction }
    )

    await createAuditLog({
      entity_type: 'quotation_document',
      entity_id: document.id,
      action: 'CARGA_DOCUMENTO_CT',
      new_values: {
        quotation_id: quotationId,
        ...document.toJSON(),
      },
      user_id: userId,
      transaction,
    })

    await transaction.commit()
    return document
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

async function deleteQuotationDocument(id, userId) {
  const transaction = await sequelize.transaction()

  try {
    const document = await QuotationDocument.findByPk(id, { transaction })
    if (!document) {
      const error = new Error('Documento de cotización no encontrado')
      error.status = 404
      throw error
    }

    const quotation = await Quotation.findByPk(document.quotation_id, { transaction })
    ensureQuotationEditable(quotation)

    const snapshot = document.toJSON()

    await document.destroy({ transaction })

    await createAuditLog({
      entity_type: 'quotation_document',
      entity_id: document.id,
      action: 'ELIMINACION_DOCUMENTO_CT',
      old_values: snapshot,
      user_id: userId,
      transaction,
    })

    await transaction.commit()

    const localPath = resolveLocalUploadPath(document.file_url)
    if (localPath && fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }

    return snapshot
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}

module.exports = {
  createQuotationDocument,
  deleteQuotationDocument,
}
