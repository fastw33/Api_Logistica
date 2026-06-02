class BusinessValidationError extends Error {
  constructor(message, details = []) {
    super(message)
    this.name = 'BusinessValidationError'
    this.status = 400
    this.details = details
  }
}

module.exports = {
  BusinessValidationError,
}
