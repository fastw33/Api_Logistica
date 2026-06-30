const fs = require('fs')
const path = require('path')
const { PDFDocument } = require('pdf-lib')
const PdfPrinter = require('pdfmake')

const COLORS = {
  orange: '#F26A21',
  orangeSoft: '#FFF1E8',
  blue: '#1F4F73',
  blueSoft: '#EAF2F7',
  border: '#D8E1E5',
  text: '#1F2933',
  muted: '#61707D',
  white: '#FFFFFF',
}

const SERVICE_LABELS = {
  ADUANA_EXPORTACION: 'Aduana exportacion',
  ADUANA_EXTERIOR: 'Aduana exterior',
  ALISTAMIENTO_CARGA: 'Alistamiento carga',
  BODEGA_EXTERIOR: 'Bodega exterior',
  BODEGA_ZF: 'Bodega / ZF',
  DTA: 'DTA',
  ETIQUETADO: 'Etiquetado',
  FLETE_INTERNACIONAL: 'Flete internacional',
  FLETE_NACIONAL: 'Flete nacional',
  LIBERACION_BL_GUIA: 'Liberacion BL - Guia',
  NACIONALIZACION: 'Nacionalizacion',
  OTM: 'OTM',
  PICKUP: 'Pick up',
  SEGURO: 'Seguro',
  SERVICIOS_EXTERIOR: 'Servicios exterior',
  TERRESTRE_DESTINO: 'Terrestre destino',
  TRANSPORTE_NACIONAL: 'Transporte nacional',
  URBANO: 'Urbano',
  ALISTAMIENTO: 'Alistamiento',
  ALMACENAMIENTO: 'Almacenamiento',
  ARRENDAMIENTO: 'Arrendamiento',
  CONCESION_ESPACIOS: 'Concesion de espacios',
  CUADRILLA_DESCARGUE: 'Cuadrilla para descargue',
  MANEJO_INVENTARIOS: 'Manejo de inventarios',
  USO_INSTAL_CROSS_DOCKING_5_DIAS_LIB: 'Uso cross docking 5 dias',
  USO_INSTAL_TRANSBORDO_CARRO_A_CARRO: 'Uso transbordo carro a carro',
  USO_MONTACARGAS: 'Uso de montacargas',
  CUORRIER: 'Cuorrier',
  TERRESTRE: 'Terrestre',
  TUNGSTENO: 'Tungsteno',
  COBALTO: 'Cobalto',
  718: '718',
  OTROS: 'Otros',
  ASESORIA: 'Asesoria',
  COMERCIALIZADORA: 'Comercializadora',
}

const BUSINESS_LABELS = {
  AEREO: 'Aereo',
  CORREO: 'Correo',
  MARITIMO: 'Maritimo',
  ALMACENAMIENTO: 'Almacenamiento',
  TERRESTRE: 'Terrestre',
  LOGISTICA_CIRCULAR: 'Logistica Circular',
  ASESORIA: 'Asesoria',
  IMPORTACIONES: 'Importaciones',
  EXPORTACIONES: 'Exportaciones',
  LOGISTICA_ALMACENAMIENTO: 'Logistica Almacenamiento',
  TRANSPORTE: 'Transporte',
}

const LINE_LABELS = {
  fastway: 'Fastway',
  harvest: 'Harvest',
  greenway: 'Greenway',
}

function safeText(value, fallback = '—') {
  const text = String(value ?? '').trim()
  return text || fallback
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return safeText(value)
  return date.toLocaleDateString('es-CO')
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return safeText(value)
  return date.toLocaleString('es-CO')
}

function formatCurrency(value, currency = 'COP') {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'COP',
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency || 'COP'} ${amount.toLocaleString('es-CO')}`
  }
}

function formatDimension(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
    useGrouping: false,
  }).format(amount)
}

function resolveServiceLabel(code) {
  return (
    SERVICE_LABELS[
      String(code || '')
        .trim()
        .toUpperCase()
    ] || safeText(code)
  )
}

function resolveBusinessLabel(code) {
  return (
    BUSINESS_LABELS[
      String(code || '')
        .trim()
        .toUpperCase()
    ] || safeText(code)
  )
}

function resolveLineLabel(code) {
  return (
    LINE_LABELS[
      String(code || '')
        .trim()
        .toLowerCase()
    ] || safeText(code)
  )
}

function resolveLogoPath() {
  const candidates = [
    'C:\\Users\\tech\\Pictures\\Fastway.png',
    process.env.LOGO_GENIKA,
    path.resolve(process.cwd(), 'src', 'utils', 'Genika.png'),
    path.resolve(process.cwd(), 'utils', 'Genika.png'),
    path.resolve(process.cwd(), 'public', 'Genika.png'),
    path.resolve(
      'C:\\Users\\tech\\Desktop\\Sistemas Genika\\wmsBack\\src\\utils\\Genika.png'
    ),
    path.resolve(
      'C:\\Users\\tech\\Desktop\\Sistemas Genika\\wmsBack\\public\\Genika.png'
    ),
  ].filter(Boolean)

  return candidates.find(currentPath => {
    try {
      return fs.existsSync(currentPath)
    } catch {
      return false
    }
  })
}

function looksLikePersonalId(value) {
  const normalized = String(value ?? '').trim()
  return Boolean(normalized) && /^\d{6,}$/.test(normalized)
}

function resolveCommercialDisplay(quotation) {
  const commercialName = String(quotation?.commercial_name || '').trim()
  if (commercialName && !looksLikePersonalId(commercialName)) {
    return commercialName
  }

  return ''
}

function isTtfOrOtf(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(4)
    fs.readSync(fd, buffer, 0, 4, 0)
    fs.closeSync(fd)
    const signature = buffer.toString('hex')
    return signature === '00010000' || signature === '4f54544f'
  } catch {
    return false
  }
}

function okFont(filePath) {
  return Boolean(filePath && fs.existsSync(filePath) && isTtfOrOtf(filePath))
}

function resolveFontPaths() {
  try {
    const regular =
      require.resolve('@fontsource/roboto/files/roboto-latin-400-normal.ttf')
    const bold =
      require.resolve('@fontsource/roboto/files/roboto-latin-700-normal.ttf')
    const italic =
      require.resolve('@fontsource/roboto/files/roboto-latin-400-italic.ttf')
    const bolditalic =
      require.resolve('@fontsource/roboto/files/roboto-latin-700-italic.ttf')

    if (okFont(regular) && okFont(bold)) {
      return { regular, bold, italic, bolditalic }
    }
  } catch {}

  try {
    const regular = require.resolve('pdfmake/examples/fonts/Roboto-Regular.ttf')
    const bold = require.resolve('pdfmake/examples/fonts/Roboto-Bold.ttf')
    const italic = require.resolve('pdfmake/examples/fonts/Roboto-Italic.ttf')
    const bolditalic =
      require.resolve('pdfmake/examples/fonts/Roboto-BoldItalic.ttf')

    if (okFont(regular) && okFont(bold)) {
      return { regular, bold, italic, bolditalic }
    }
  } catch {}

  const windowsFallback = {
    regular: 'C:\\Windows\\Fonts\\arial.ttf',
    bold: 'C:\\Windows\\Fonts\\arialbd.ttf',
    italic: 'C:\\Windows\\Fonts\\ariali.ttf',
    bolditalic: 'C:\\Windows\\Fonts\\arialbi.ttf',
  }

  if (okFont(windowsFallback.regular) && okFont(windowsFallback.bold)) {
    return windowsFallback
  }

  return null
}

function buildInfoGrid(rows = []) {
  const body = []

  for (let index = 0; index < rows.length; index += 2) {
    const left = rows[index]
    const right = rows[index + 1]
    body.push([
      {
        stack: [
          { text: safeText(left?.label, ''), style: 'infoLabel' },
          { text: safeText(left?.value), style: 'infoValue' },
        ],
        margin: [0, 0, 10, 0],
      },
      {
        stack: [
          { text: safeText(right?.label, ''), style: 'infoLabel' },
          { text: safeText(right?.value), style: 'infoValue' },
        ],
      },
    ])
  }

  return {
    table: {
      widths: ['*', '*'],
      body,
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 2,
      paddingBottom: () => 6,
    },
  }
}

function buildSectionTitle(title, subtitle = '') {
  return {
    stack: [
      { text: title, style: 'sectionTitle' },
      subtitle ? { text: subtitle, style: 'sectionSubtitle' } : null,
    ].filter(Boolean),
    margin: [0, 14, 0, 8],
  }
}

function buildSimpleTable(headers = [], rows = [], widths = []) {
  return {
    table: {
      headerRows: 1,
      widths,
      body: [
        headers.map(header => ({
          text: header,
          style: 'tableHeader',
        })),
        ...rows.map(row =>
          row.map(cell => ({
            text: safeText(cell),
            style: 'tableCell',
          }))
        ),
      ],
    },
    layout: {
      fillColor: rowIndex => {
        if (rowIndex === 0) return COLORS.blue
        return rowIndex % 2 === 0 ? COLORS.blueSoft : null
      },
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingTop: () => 6,
      paddingBottom: () => 6,
      paddingLeft: () => 6,
      paddingRight: () => 6,
    },
  }
}

function buildPdfDefinition(quotation) {
  const lineLabel = resolveLineLabel(quotation?.line_key)
  const commercialDisplay = resolveCommercialDisplay(quotation)
  const serviceRows = Array.isArray(quotation?.services)
    ? quotation.services.map(item => [
        resolveServiceLabel(item?.service_code),
        item?.enabled ? 'Sí' : 'No',
      ])
    : []

  const dimensionRows = Array.isArray(quotation?.dimensions)
    ? quotation.dimensions.map(item => [
        formatDimension(item?.quantity),
        safeText(item?.package_type),
        safeText(item?.dimension_unit, 'cm'),
        [item?.length, item?.width, item?.height]
          .filter(value => value != null && value !== '')
          .map(value => formatDimension(value))
          .join(' x ') || '—',
        item?.gross_weight != null ? formatDimension(item.gross_weight) : '—',
        item?.volumetric_weight != null
          ? formatDimension(item.volumetric_weight)
          : '—',
        item?.volume_cbm != null ? formatDimension(item.volume_cbm) : '—',
      ])
    : []

  const costRows = [
    ...(Array.isArray(quotation?.provider_quotes)
      ? quotation.provider_quotes.map(item => [
          item?.service_code ? resolveServiceLabel(item.service_code) : 'Costo',
          safeText(item?.provider_name || item?.notes || item?.provider_id),
          formatCurrency(
            item?.quoted_value,
            item?.currency || quotation?.currency
          ),
          item?.validity_date ? formatDate(item.validity_date) : '—',
        ])
      : []),
    ...(Array.isArray(quotation?.sales)
      ? quotation.sales.map(item => [
          safeText(item?.concept, 'Costo'),
          item?.notes
            ? safeText(item.notes)
            : `${safeText(item?.quantity, '1')} x ${formatCurrency(
                item?.unit_value,
                item?.currency || quotation?.currency
              )}`,
          formatCurrency(item?.total, item?.currency || quotation?.currency),
          item?.created_at ? formatDate(item.created_at) : '—',
        ])
      : []),
  ]

  const documentRows = Array.isArray(quotation?.documents)
    ? quotation.documents.map(item => [
        safeText(item?.document_type),
        safeText(item?.package_name || item?.document_name),
        formatDateTime(item?.created_at),
      ])
    : []

  const logoPath = resolveLogoPath()

  const summaryRows = [
    {
      label: 'Cliente / contraparte',
      value: quotation?.customer_name || quotation?.customer_id,
    },
    { label: 'Asunto', value: quotation?.subject },
    {
      label: 'Tipo de negocio',
      value: resolveBusinessLabel(quotation?.business_type),
    },
    { label: 'Modo transporte', value: quotation?.transport_mode },
    { label: 'Modalidad', value: quotation?.modality },
    { label: 'Moneda', value: quotation?.currency },
    {
      label: 'Valor declarado',
      value: formatCurrency(quotation?.declared_value, quotation?.currency),
    },
    {
      label: 'TRM',
      value: quotation?.trm != null ? String(quotation.trm) : '—',
    },
    ...(commercialDisplay
      ? [{ label: 'Comercial', value: commercialDisplay }]
      : []),
    { label: 'Creación', value: formatDateTime(quotation?.created_at) },
    { label: 'Actualización', value: formatDateTime(quotation?.updated_at) },
  ]

  return {
    pageSize: 'A4',
    pageMargins: [34, 36, 34, 44],
    defaultStyle: {
      font: 'Roboto',
      color: COLORS.text,
      fontSize: 9,
    },
    content: [
      {
        table: {
          widths: [128, '*', 150],
          body: [
            [
              {
                stack: logoPath
                  ? [{ image: logoPath, width: 108, margin: [0, 0, 0, 0] }]
                  : [
                      { text: lineLabel, style: 'headerBrandText' },
                      { text: 'Logistic SAS', style: 'headerMetaMuted' },
                    ],
                border: [false, false, false, false],
              },
              {
                stack: [
                  { text: 'Cotización Comercial', style: 'docTitle' },
                  { text: '', style: 'docTypeText' },
                ],
                border: [false, false, false, false],
                margin: [6, 8, 6, 0],
              },
              {
                stack: [
                  { text: lineLabel, style: 'headerLinePill' },
                  {
                    text: 'Generado por Genika',
                    style: 'headerMetaStrong',
                    alignment: 'right',
                    margin: [0, 10, 0, 2],
                  },
                  {
                    text: formatDateTime(new Date()),
                    style: 'headerMetaMuted',
                    alignment: 'right',
                  },
                  {
                    text: `CT ${quotation?.id || '—'}`,
                    style: 'headerIdTextRight',
                    alignment: 'right',
                  },
                ],
                border: [false, false, false, false],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 8],
      },
      {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: 527,
            h: 4,
            color: COLORS.orange,
          },
          {
            type: 'rect',
            x: 0,
            y: 6,
            w: 527,
            h: 1,
            color: COLORS.blueSoft,
          },
        ],
        margin: [0, 0, 0, 18],
      },
      buildSectionTitle(
        'Resumen general',
        'Información principal de la cotización'
      ),
      buildInfoGrid(summaryRows),
      buildSectionTitle('Ruta logística'),
      buildInfoGrid([
        {
          label: 'Origen',
          value:
            [quotation?.origin_city, quotation?.origin_country]
              .filter(Boolean)
              .join(', ') || quotation?.origin_country,
        },
        { label: 'Puerto / punto origen', value: quotation?.origin_port },
        {
          label: 'Destino',
          value:
            [quotation?.destination_city, quotation?.destination_country]
              .filter(Boolean)
              .join(', ') || quotation?.destination_country,
        },
        { label: 'Puerto / punto destino', value: quotation?.destination_port },
        { label: 'Incoterm', value: quotation?.incoterm },
        { label: 'Material', value: quotation?.material_class },
      ]),
      buildSectionTitle('Mercancía y requerimiento'),
      {
        stack: [
          {
            text: quotation?.cargo_description || 'Sin descripción de carga',
            style: 'noteBox',
          },
          {
            text: quotation?.notes || 'Sin requerimientos adicionales',
            style: 'noteBoxSecondary',
            margin: [0, 8, 0, 0],
          },
        ],
      },
      buildSectionTitle('Servicios solicitados'),
      serviceRows.length
        ? buildSimpleTable(['Servicio', 'Activo'], serviceRows, ['*', 70])
        : { text: 'Sin servicios cargados.', style: 'emptyText' },
      buildSectionTitle('Dimensiones y empaque'),
      dimensionRows.length
        ? buildSimpleTable(
            [
              'Cantidad',
              'Empaque',
              'Unidad',
              'Medidas',
              'Peso bruto',
              'Peso vol.',
              'CBM',
            ],
            dimensionRows,
            [50, '*', 42, 96, 64, 64, 50]
          )
        : { text: 'Sin dimensiones registradas.', style: 'emptyText' },
      buildSectionTitle('Costos'),
      costRows.length
        ? buildSimpleTable(
            ['Concepto', 'Detalle', 'Valor', 'Fecha'],
            costRows,
            ['*', '*', 92, 78]
          )
        : { text: 'Sin costos cargados.', style: 'emptyText' },
      buildSectionTitle('Documentos asociados'),
      documentRows.length
        ? buildSimpleTable(['Tipo', 'Nombre visible', 'Fecha'], documentRows, [
            130,
            '*',
            94,
          ])
        : { text: 'Sin documentos asociados.', style: 'emptyText' },
    ],
    styles: {
      headerBrandText: {
        bold: true,
        fontSize: 18,
        color: COLORS.blue,
      },
      headerMetaStrong: {
        bold: true,
        fontSize: 11,
        color: COLORS.blue,
      },
      headerMetaMuted: {
        fontSize: 8,
        color: COLORS.muted,
      },
      docTitle: {
        fontSize: 20,
        bold: true,
        color: COLORS.blue,
      },
      docTypeText: {
        fontSize: 13,
        bold: true,
        color: COLORS.blue,
        margin: [0, 2, 0, 0],
      },
      headerIdText: {
        fontSize: 11,
        bold: true,
        color: COLORS.orange,
        margin: [0, 8, 0, 0],
      },
      headerIdTextRight: {
        fontSize: 11,
        bold: true,
        color: COLORS.orange,
        margin: [0, 8, 0, 0],
      },
      headerLinePill: {
        fontSize: 9,
        bold: true,
        color: COLORS.orange,
        alignment: 'right',
      },
      sectionTitle: {
        fontSize: 12,
        bold: true,
        color: COLORS.blue,
      },
      sectionSubtitle: {
        fontSize: 8,
        color: COLORS.muted,
      },
      infoLabel: {
        fontSize: 7,
        bold: true,
        color: COLORS.muted,
        margin: [0, 0, 0, 2],
      },
      infoValue: {
        fontSize: 9,
        color: COLORS.text,
      },
      noteBox: {
        fontSize: 9,
        color: COLORS.text,
        background: COLORS.orangeSoft,
        margin: [0, 0, 0, 0],
      },
      noteBoxSecondary: {
        fontSize: 9,
        color: COLORS.text,
        background: COLORS.blueSoft,
      },
      tableHeader: {
        bold: true,
        color: COLORS.white,
        fontSize: 8,
      },
      tableCell: {
        fontSize: 8,
        color: COLORS.text,
      },
      emptyText: {
        italics: true,
        color: COLORS.muted,
        fontSize: 8,
      },
    },
  }
}

async function buildPdfBuffer(docDefinition) {
  const fonts = resolveFontPaths()
  if (!fonts) {
    const error = new Error('No fue posible resolver las fuentes del PDF')
    error.status = 500
    throw error
  }

  const printer = new PdfPrinter({
    Roboto: {
      normal: path.resolve(fonts.regular),
      bold: path.resolve(fonts.bold),
      italics: path.resolve(fonts.italic || fonts.regular),
      bolditalics: path.resolve(fonts.bolditalic || fonts.bold),
    },
  })

  const pdfDoc = printer.createPdfKitDocument(docDefinition)
  const chunks = []

  return new Promise((resolve, reject) => {
    pdfDoc.on('data', chunk => chunks.push(chunk))
    pdfDoc.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks)
        const libDoc = await PDFDocument.load(buffer)
        libDoc.setTitle('Cotizacion CT - GENIKA')
        libDoc.setAuthor('GENIKA')
        libDoc.setCreator('GENIKA')
        libDoc.setProducer('GENIKA • pdfmake + pdf-lib')
        resolve(Buffer.from(await libDoc.save()))
      } catch (error) {
        reject(error)
      }
    })
    pdfDoc.on('error', reject)
    pdfDoc.end()
  })
}

async function createQuotationPdfBuffer(quotation) {
  return buildPdfBuffer(buildPdfDefinition(quotation))
}

function buildQuotationPdfFilename(quotation) {
  const id = String(quotation?.id || 'CT').padStart(6, '0')
  return `CT-${id}.pdf`
}

module.exports = {
  createQuotationPdfBuffer,
  buildQuotationPdfFilename,
}
