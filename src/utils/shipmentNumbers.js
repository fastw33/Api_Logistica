function formatSequence(prefix, id) {
  return `${prefix}-${String(id).padStart(6, '0')}`
}

function buildShipmentNumbers(id) {
  return {
    do_number: formatSequence('DO', id),
    file_number: formatSequence('FILE', id),
  }
}

module.exports = {
  buildShipmentNumbers,
}
