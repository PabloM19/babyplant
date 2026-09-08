import Tesseract from 'tesseract.js'
import {
  CATALOG_PRODUCT_NAMES,
  parseAlbaranText,
  type ParsedAlbaran,
  type ParsedAlbaranLine,
} from './parse-albaran-pdf'

function extractHeaderFromText(rawText: string) {
  let supplier = 'Proveedor no detectado'
  let albaranNumber = '—'
  let deliveryDate = '—'

  if (/viveros del levante/i.test(rawText)) supplier = 'Viveros del Levante'
  if (/flora mediterr[aá]nea/i.test(rawText)) supplier = 'Flora Mediterránea'

  const albaranMatch = rawText.match(/\bVL-\d{3,6}\b/i)
  if (albaranMatch) albaranNumber = albaranMatch[0].toUpperCase()

  const dateMatch = rawText.match(/\b\d{1,2}\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s+\d{4}\b/i)
  if (dateMatch) deliveryDate = dateMatch[0]

  return { supplier, albaranNumber, deliveryDate }
}

/** Parser tolerante para texto OCR (foto, cámara o PDF escaneado). */
export function parseAlbaranTextLoose(rawText: string): ParsedAlbaran {
  const compact = rawText.replace(/\s+/g, ' ').trim()
  const header = extractHeaderFromText(compact)
  const found = new Map<string, ParsedAlbaranLine>()

  for (const product of CATALOG_PRODUCT_NAMES) {
    const regex = new RegExp(product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const match = regex.exec(compact)
    if (!match) continue

    const after = compact.slice(match.index + match[0].length, match.index + match[0].length + 48)
    const qtyMatch = after.match(/\b(\d{1,4})\b/)
    if (!qtyMatch) continue

    found.set(product.toLowerCase(), {
      product,
      qty: Number(qtyMatch[1]),
      unit: 'ud',
      status: 'Confirmado',
    })
  }

  const unknownPatterns = [
    /geranio\s+rojo/i,
    /blaukorn\s+compo/i,
    /maceta\s+cl[aá]sica/i,
  ]

  for (const pattern of unknownPatterns) {
    const match = pattern.exec(compact)
    if (!match) continue
    const key = match[0].toLowerCase()
    if ([...found.keys()].some((k) => k.includes(key.split(' ')[0]))) continue

    const after = compact.slice(match.index + match[0].length, match.index + match[0].length + 48)
    const qtyMatch = after.match(/\b(\d{1,4})\b/)
    if (!qtyMatch) continue

    const label = match[0].replace(/\s+/g, ' ')
    const normalizedLabel = label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
    found.set(key, {
      product: normalizedLabel,
      qty: Number(qtyMatch[1]),
      unit: 'ud',
      status: 'Crear ficha',
    })
  }

  return {
    ...header,
    lines: [...found.values()],
    rawText,
  }
}

export async function extractTextFromImage(source: Blob | File | HTMLCanvasElement): Promise<string> {
  const result = await Tesseract.recognize(source, 'spa', {
    logger: () => {},
  })
  return result.data.text
}

export async function parseAlbaranImage(source: Blob | File | HTMLCanvasElement): Promise<ParsedAlbaran> {
  const rawText = await extractTextFromImage(source)
  const structured = parseAlbaranText(rawText)
  if (structured.lines.length >= 2) return structured

  const loose = parseAlbaranTextLoose(rawText)
  if (loose.lines.length > 0) return loose

  return structured.lines.length > 0 ? structured : loose
}

export async function parseAlbaranCapture(canvas: HTMLCanvasElement): Promise<ParsedAlbaran> {
  return parseAlbaranImage(canvas)
}
