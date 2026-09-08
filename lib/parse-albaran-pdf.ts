export type ParsedAlbaranLine = {
  product: string
  qty: number
  unit: string
  status: 'Confirmado' | 'Revisar' | 'Crear ficha'
  matchedProductId?: string
}

export type ParsedAlbaran = {
  supplier: string
  albaranNumber: string
  deliveryDate: string
  lines: ParsedAlbaranLine[]
  rawText: string
}

/** Nombres del catálogo demo; el parser los usa para cruzar líneas del PDF. */
export const CATALOG_PRODUCT_NAMES = [
  'Rosa mini roja',
  'Blaukorn Compo 5 kg',
  'Monstera Deliciosa',
  'Maceta clásica terracota 30 cm',
  'Sansevieria trifasciata',
  'Olivo miniatura',
] as const

const NOISE = new Set([
  'Albarán',
  'Empresa:',
  'Domicilio:',
  'NIF:',
  'ENTREGAR A:',
  'Cliente:',
  'Código postal / ciudad:',
  'Nº de albarán:',
  'Fecha:',
  'Nº de pedido:',
  'Fecha de entrega:',
  'Lugar de entrega:',
  'Pos.',
  'Concepto / Descripción',
  'Cantidad',
  'Unidad',
  'Precio',
  'unitario',
  'Importe',
  '1',
  '2',
  '3',
  '4',
  '5',
  'Fecha de recepción y firma del receptor:',
  'Observaciones:',
  'Ciudad:',
  'Tel.:',
  'Correo:',
  'Banco:',
  'BIC:',
  'IBAN:',
  'Titular:',
  'Nombre del director:',
  'Eiviplant',
  'ud',
  'uds',
  'unidad',
])

function normalize(text: string) {
  return text.normalize('NFC').replace(/\s+/g, ' ').trim()
}

function isQuantity(value: string) {
  return /^\d+(?:[.,]\d+)?$/.test(value)
}

function parseQuantity(value: string) {
  return Math.round(Number(value.replace(',', '.')))
}

function findCatalogProduct(name: string) {
  const normalized = normalize(name).toLowerCase()
  return CATALOG_PRODUCT_NAMES.find((p) => p.toLowerCase() === normalized)
}

function extractHeader(lines: string[]) {
  let supplier = 'Proveedor no detectado'
  let albaranNumber = '—'
  let deliveryDate = '—'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === 'Viveros del Levante' || line === 'Flora Mediterránea') {
      supplier = line
    }
    if (/^VL-\d+$/i.test(line)) albaranNumber = line.toUpperCase()
    if (/^\d{1,2}\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s+\d{4}$/i.test(line)) {
      deliveryDate = line
    }
  }

  return { supplier, albaranNumber, deliveryDate }
}

/** Extrae líneas de producto leyendo texto embebido del PDF (compatible con edición en cualquier lector PDF). */
export function parseAlbaranText(rawText: string): ParsedAlbaran {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => normalize(l))
    .filter(Boolean)

  const header = extractHeader(lines)
  const parsed: ParsedAlbaranLine[] = []
  const used = new Set<number>()

  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue
    const line = lines[i]
    if (NOISE.has(line) || line.length < 3) continue

    const catalogMatch = findCatalogProduct(line)
    const next = lines[i + 1]
    const unit = lines[i + 2]

    if (catalogMatch && next && isQuantity(next)) {
      parsed.push({
        product: catalogMatch,
        qty: parseQuantity(next),
        unit: unit && (unit === 'ud' || unit === 'uds' || unit === 'unidad') ? unit : 'ud',
        status: 'Confirmado',
      })
      used.add(i)
      used.add(i + 1)
      if (unit === 'ud' || unit === 'uds') used.add(i + 2)
      continue
    }

    if (!catalogMatch && next && isQuantity(next) && (unit === 'ud' || unit === 'uds' || unit === 'unidad')) {
      if (/[a-záéíóúñ]/i.test(line) && !/^\d+[.,]\d+$/.test(line)) {
        parsed.push({
          product: line,
          qty: parseQuantity(next),
          unit,
          status: 'Crear ficha',
        })
        used.add(i)
        used.add(i + 1)
        used.add(i + 2)
      }
    }
  }

  return {
    ...header,
    lines: parsed,
    rawText,
  }
}

export async function extractTextFromPdf(file: ArrayBuffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString()

  const doc = await pdfjs.getDocument({ data: new Uint8Array(file) }).promise
  const chunks: string[] = []

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join('\n')
    chunks.push(pageText)
  }

  return chunks.join('\n')
}

export async function parseAlbaranPdf(file: ArrayBuffer): Promise<ParsedAlbaran> {
  const rawText = await extractTextFromPdf(file)
  return parseAlbaranText(rawText)
}
