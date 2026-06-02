function clampLimit(limit) {
  const value = Number(limit)
  if (!Number.isFinite(value) || value <= 0) return 20
  return Math.min(Math.floor(value), 100)
}

function parsePage(page) {
  const value = Number(page)
  if (!Number.isFinite(value) || value <= 0) return 1
  return Math.floor(value)
}

function buildPagination(page, limit) {
  const currentPage = parsePage(page)
  const pageSize = clampLimit(limit)

  return {
    page: currentPage,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  }
}

module.exports = {
  clampLimit,
  parsePage,
  buildPagination,
}
