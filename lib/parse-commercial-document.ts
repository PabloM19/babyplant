import { CATALOG_PRODUCT_NAMES, products } from '@/lib/demo-data'
import {
  COMPANY_LABELS,
  DOCUMENT_KIND_LABELS,
  type CompanyId,
  type DocumentKind,
  type ParseHints,
  type ParsedDocument,
  type ParsedDocumentLine,
} from '@/lib/document-catalog'

const PACKAGING =
  /embal|portes|carros|bandejas|alzas|embalatge|safates|alces|packaging|roll.?cc|tag\s*6/i

const HEADER_NOISE =
  /eiviplant|nif|cif|cliente|fecha|c[oó]digo|descripci[oó]n|cantidad|precio|importe|pasaporte|plant passport|^passport$|p[aá]gina|vilassar|segorbe|premi[aà]|honselersdijk|factura n|albar[aá]n n|base imponible|total factura|gracias|^unidades$|%\s*ventas/i

function normalizeSpaces(value: string) {
  return value
    .replace(/[\u00A0\u1680\u2000-\u200B\u202F\u205F\u3000\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compactLines(rawText: string) {
  return rawText
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line))
    .filter(Boolean)
}

function parseQty(value: string) {
  const n = Number(value.replace(/\./g, '').replace(',', '.'))
  if (!Number.isFinite(n)) return null
  return Math.round(n)
}

function prettyName(name: string) {
  const cleaned = normalizeSpaces(name.replace(/[®]+/g, ' ').replace(/\s+/g, ' '))
  if (/[a-zÁÉÍÓÚáéíóúñ]/.test(cleaned) && /[A-Z]/.test(cleaned)) return cleaned
  return cleaned
    .toLowerCase()
    .replace(/(^|[\s(/])\S/g, (chunk) => chunk.toUpperCase())
}

function catalogStatus(name: string): ParsedDocumentLine['status'] {
  const n = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const hit = products.find((p) => {
    const pn = p.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return n.includes(pn) || pn.includes(n)
  })
  if (hit) return 'Confirmado'
  const tokens = n.split(/\s+/).filter((t) => t.length > 4)
  const overlap = CATALOG_PRODUCT_NAMES.some((p) => {
    const pn = p
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return tokens.some((t) => pn.includes(t))
  })
  return overlap ? 'Revisar' : 'Crear ficha'
}

function lineOf(product: string, qty: number, extra?: Partial<ParsedDocumentLine>): ParsedDocumentLine {
  return {
    product: prettyName(product),
    qty,
    unit: 'ud',
    status: catalogStatus(product),
    ...extra,
  }
}

export function detectCompany(rawText: string): Exclude<CompanyId, 'auto'> {
  const t = rawText.toLowerCase()
  if (/poleplants|c[oó]digo pole|pole@poleplants/.test(t)) return 'poleplants'
  if (/mas de valero|viverosvalero|viveros mas de valero/.test(t)) return 'mas-de-valero'
  if (/\bcorma\b|corma, s\.c\.c\.l|corma@corma/.test(t)) return 'corma'
  if (/\bsileva\b|sileva, s\.a|info@sileva/.test(t)) return 'sileva'
  if (/cactus elche|cactus columnares|cactus bolas/.test(t)) return 'cactus-elche'
  if (/javadoplant|javadoplant\.com|honselersdijk/.test(t)) return 'javadoplant'
  if (/viveros del levante|\bvl-\d{3,6}\b/.test(t)) return 'viveros-levante'
  return 'generic'
}

export function detectKind(rawText: string, company?: Exclude<CompanyId, 'auto'>): DocumentKind {
  const t = rawText.toLowerCase()
  if (/rectificativa/.test(t)) return 'factura_rectificativa'
  if (/confirmaci[oó]n del pedido|orden nr\.?/.test(t)) return 'pedido'
  if (/\bticket\b|tpv/.test(t) && !/factura/.test(t)) return 'ticket'
  if (company === 'javadoplant') return 'pedido'
  if (/factura|inv\/\d/.test(t) && !/albar[aá]n \/ bl/.test(t)) return 'factura'
  if (/albar[aá]n|delivery note/.test(t)) return 'albaran'
  if (/factura/.test(t)) return 'factura'
  return 'albaran'
}

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return (match[1] ?? match[0]).trim()
  }
  return '—'
}

function parsePoleplants(rawText: string): ParsedDocumentLine[] {
  const lines = compactLines(rawText)
  const out: ParsedDocumentLine[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (PACKAGING.test(line) || HEADER_NOISE.test(line)) continue
    if (/^[\d.,\s*x]+$/.test(line) || /^843\d{10}$/.test(line)) continue
    if (/^[A-Z0-9*]{8,}$/.test(line.replace(/\s/g, ''))) continue
    if (!/[A-Za-záéíóúñØø]/.test(line) || line.length < 8) continue
    if (!/Ø|HIBISCUS|LAVAND|ROSMAR|TAGET|VINCA|VIOLA|DENDR|CHRY|GRANDIFLORUM|OFFICINALIS|ERECTA|CORNUTA|SOIREE/i.test(line)) {
      continue
    }

    let qty: number | null = null
    for (let j = 1; j <= 3; j++) {
      const candidate = lines[i + j]
      if (!candidate) break
      if (!/^-?\d+(?:[.,]\d+)?$/.test(candidate)) continue
      const value = Number(candidate.replace(',', '.'))
      if (value >= 1 && value <= 500 && (Number.isInteger(value) || candidate.endsWith(',00'))) {
        qty = Math.round(value)
        break
      }
    }
    if (qty) out.push(lineOf(line, qty))
  }

  return dedupeLines(out)
}

function parseMasDeValero(rawText: string): ParsedDocumentLine[] {
  const text = normalizeSpaces(rawText)
  const out: ParsedDocumentLine[] = []
  const regex =
    /([A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9 .'"Øø()|/+\-]{2,90}?)\s+(-?\d+)\s+#?\s*(-?[\d.,]+)\s*€\s+(-?[\d.,]+)\s*€/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(text))) {
    const product = match[1]
      .replace(/^.*\d{2}\/\d{2}\/\d{4}\s+/i, '')
      .replace(/.*Abono Factura\s+\d+(?:\s+del\s+\d{2}\/\d{2}\/\d{4})?/i, '')
      .replace(/Albar[aá]n N[ºo°]?\s*\d+/i, '')
      .trim()
    if (!product || HEADER_NOISE.test(product) || PACKAGING.test(product)) continue
    if (/albar[aá]n|abono factura|total factura|viveros mas|^o factura/i.test(product)) continue
    const qty = parseQty(match[2])
    if (qty === null || qty === 0) continue
    out.push(lineOf(product, qty))
  }
  return dedupeLines(out)
}

function parseCorma(rawText: string): ParsedDocumentLine[] {
  const out: ParsedDocumentLine[] = []
  const regex = /^\s*\d+\s+(\S+)\s+(.+?)\s+(\d+)\s+([\d,]+)\s+([\d,]+)\s*$/gm
  let match: RegExpExecArray | null
  while ((match = regex.exec(rawText))) {
    const product = `${match[1]} ${match[2]}`.replace(/\s+/g, ' ').trim()
    const qty = parseQty(match[3])
    if (!qty || qty > 500 || PACKAGING.test(product) || HEADER_NOISE.test(product)) continue
    if (!/[A-Za-z]{3,}/.test(product)) continue
    out.push(lineOf(product, qty, { code: match[1] }))
  }
  return dedupeLines(out)
}

function parseSileva(rawText: string): ParsedDocumentLine[] {
  const lines = compactLines(rawText)
  const out: ParsedDocumentLine[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/,/.test(line) && /C-\d/.test(line) && /,\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(line)) continue
    if (!/C-\d|lavandula|rosmarinus|westringia/i.test(line)) continue
    if (HEADER_NOISE.test(line) || line.startsWith('1.')) continue
    const window = lines.slice(i + 1, i + 4)
    if (!window.some((item) => /^unidades$/i.test(item))) continue
    const qtyLine = window.find((item) => /^-?\d+(?:[.,]\d+)?$/.test(item))
    if (!qtyLine) continue
    const qty = parseQty(qtyLine)
    if (qty) out.push(lineOf(line, qty))
  }
  return dedupeLines(out)
}

function parseCactusElche(rawText: string): ParsedDocumentLine[] {
  const lines = compactLines(rawText)
  const out: ParsedDocumentLine[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!/^CACTUS .+/i.test(line) || /ELCHE/i.test(line)) continue
    const lote = lines[i + 1]
    const qtyLine = lines[i + 2]
    if (!lote || !qtyLine) continue
    if (!/^\d{2}\/\d+/.test(lote)) continue
    const qty = parseQty(qtyLine)
    if (qty) out.push(lineOf(line, qty))
  }
  return dedupeLines(out)
}

function parseJavadoplant(rawText: string): ParsedDocumentLine[] {
  const compact = normalizeSpaces(rawText)
  const parts = compact.split(/(?:0,00)?(87\d{11})/)
  const out: ParsedDocumentLine[] = []

  for (let i = 1; i < parts.length - 1; i += 2) {
    const barcode = parts[i]
    let body = parts[i + 1] ?? ''
    body = body.replace(/Javadoplant[\s\S]*$/i, '').replace(/Sub Total[\s\S]*$/i, '')
    const money = [...body.matchAll(/(\d+[.,]\d{2})/g)].map((m) => m[1])
    if (money.length < 2) continue
    const unitPrice = Number(money[0].replace(',', '.'))
    const amount = Number(money[1].replace(',', '.'))
    if (!unitPrice || unitPrice > 80) continue
    const qty = Math.round(amount / unitPrice)
    if (!qty || qty > 500) continue

    const afterCm = body.replace(/^[\s\S]*?\d+\s*cm\s*\d+\s*cm\s*#?/i, '')
    const nameMatch = afterCm.match(/^([A-Za-z][A-Za-z0-9® .'+()/\-]{3,}?)(?=\d{5,}|$)/)
    let product = (nameMatch?.[1] ?? afterCm).replace(/\s+dif\s*$/i, '').trim()
    product = product
      .replace(/^\d+\s*cm(?:\s+\d+\s*cm)?\s*#?/i, '')
      .replace(/^#/, '')
      .replace(/\d{5,}.*$/, '')
      .replace(/\s+\d+$/, '')
      .trim()
    if (!product || product.length < 4) continue
    out.push(lineOf(product, qty, { barcode }))
  }
  return dedupeLines(out)
}

function parseLevanteCatalog(rawText: string): ParsedDocumentLine[] {
  const lines = compactLines(rawText)
  const aliases: Record<string, string> = { 'rosa mini roja': 'Rosal mini rojo' }
  const out: ParsedDocumentLine[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const key = line.toLowerCase()
    const catalog = aliases[key] ?? CATALOG_PRODUCT_NAMES.find((name) => name.toLowerCase() === key)
    const next = lines[i + 1]
    const unit = lines[i + 2]
    if (catalog && next && /^-?\d+(?:[.,]\d+)?$/.test(next)) {
      const qty = parseQty(next)
      if (!qty) continue
      out.push(
        lineOf(catalog, qty, {
          status: 'Confirmado',
          unit: unit === 'ud' || unit === 'uds' || unit === 'unidad' ? unit : 'ud',
        }),
      )
      continue
    }
    if (
      !catalog &&
      next &&
      /^-?\d+(?:[.,]\d+)?$/.test(next) &&
      (unit === 'ud' || unit === 'uds' || unit === 'unidad') &&
      /[a-záéíóúñ]/i.test(line)
    ) {
      const qty = parseQty(next)
      if (qty) out.push(lineOf(line, qty))
    }
  }
  return dedupeLines(out)
}

function parseGenericBotanical(rawText: string): ParsedDocumentLine[] {
  const lines = compactLines(rawText)
  const out: ParsedDocumentLine[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (PACKAGING.test(line) || HEADER_NOISE.test(line) || line.length < 6) continue
    const next = lines[i + 1]
    if (!next || !/^-?\d+(?:[.,]\d+)?$/.test(next)) continue
    const qty = parseQty(next)
    if (!qty || qty > 2000) continue
    if (!/[A-Za-záéíóúñ]/.test(line)) continue
    out.push(lineOf(line, qty))
  }
  return dedupeLines(out)
}

function headerFor(company: Exclude<CompanyId, 'auto'>, kind: DocumentKind, rawText: string) {
  const supplier = company === 'generic' ? detectSupplierFallback(rawText) : COMPANY_LABELS[company]
  let number = '—'
  let date = '—'

  if (company === 'poleplants') {
    number = firstMatch(rawText, [/^\s{3,}(\d{5})\s*$/m, /(\d{5})\s+Albar[aá]n n/i])
    date = firstMatch(rawText, [/\b(\d{2}-\d{2}-\d{2})\b/])
  } else if (company === 'mas-de-valero') {
    number = firstMatch(rawText, [/RE\/\d+/, /(\d{6})\s+NUMERO/i, /\b(263373|RE\/260263)\b/])
    date = firstMatch(rawText, [/\b(\d{2}\/\d{2}\/\d{4})\b/])
  } else if (company === 'corma') {
    number = firstMatch(rawText, [/\b(10F\d+)\b/])
    date = firstMatch(rawText, [/\b(\d{2}-\d{2}-\d{4})\b/])
  } else if (company === 'sileva') {
    number = firstMatch(rawText, [/INV\/\d{4}\/\d+/])
    date = firstMatch(rawText, [/Fecha de factura:\s*(\d{2}\/\d{2}\/\d{4})/i, /\b(\d{2}\/\d{2}\/\d{4})\b/])
  } else if (company === 'cactus-elche') {
    number =
      kind === 'factura'
        ? firstMatch(rawText, [/A\s*\/\s*(\d+)/, /Albar[aá]n:\s*(\d+)/i])
        : firstMatch(rawText, [/Albar[aá]n:\s*(\d+)/i, /A\s*\/\s*(\d+)/])
    date = firstMatch(rawText, [/Fecha:\s*(\d{2}\/\d{2}\/\d{4})/i, /\b(\d{2}\/\d{2}\/\d{4})\b/])
  } else if (company === 'javadoplant') {
    number = firstMatch(rawText, [/Orden Nr\.?\s*(\d+)/i])
    date = firstMatch(rawText, [/Despacho\s*(\d{2}-\d{2}-\d{2})/i, /\b(\d{2}-\d{2}-\d{2})\b/])
  } else {
    number = firstMatch(rawText, [
      /Albar[aá]n n[ºo°]?:?\s*([A-Z0-9/.\-]+)/i,
      /Factura n[ºo°]?:?\s*([A-Z0-9/.\-]+)/i,
      /\bVL-\d{3,6}\b/i,
    ])
    date = firstMatch(rawText, [
      /Fecha(?: de (?:factura|entrega))?:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /\b(\d{1,2}\s+(?:ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s+\d{4})\b/i,
    ])
  }

  return {
    supplier,
    albaranNumber: number,
    deliveryDate: date,
    templateId: `${company}-${kind}`,
    templateLabel: `${DOCUMENT_KIND_LABELS[kind]} · ${supplier}`,
  }
}

function detectSupplierFallback(rawText: string) {
  if (/viveros del levante/i.test(rawText)) return 'Viveros del Levante'
  if (/flora mediterr/i.test(rawText)) return 'Flora Mediterránea'
  return 'Proveedor no detectado'
}

function dedupeLines(lines: ParsedDocumentLine[]) {
  return lines.filter((line, index) => {
    if (index === 0) return true
    const prev = lines[index - 1]
    return !(prev.product === line.product && prev.qty === line.qty)
  })
}

function parseLinesForCompany(company: Exclude<CompanyId, 'auto'>, rawText: string) {
  switch (company) {
    case 'poleplants':
      return parsePoleplants(rawText)
    case 'mas-de-valero':
      return parseMasDeValero(rawText)
    case 'corma':
      return parseCorma(rawText)
    case 'sileva':
      return parseSileva(rawText)
    case 'cactus-elche':
      return parseCactusElche(rawText)
    case 'javadoplant':
      return parseJavadoplant(rawText)
    case 'viveros-levante':
      return parseLevanteCatalog(rawText)
    default:
      return parseGenericBotanical(rawText)
  }
}

export function parseCommercialDocument(rawText: string, hints: ParseHints = {}): ParsedDocument {
  const detectedCompany = detectCompany(rawText)
  const company =
    hints.company && hints.company !== 'auto' ? hints.company : detectedCompany
  const kind =
    hints.kind && hints.kind !== 'auto' ? hints.kind : detectKind(rawText, company)

  let lines = parseLinesForCompany(company, rawText)
  if (lines.length === 0 && (company === 'generic' || company === 'viveros-levante')) {
    lines = parseLevanteCatalog(rawText)
  }
  if (lines.length === 0 && company === 'generic') {
    lines = parseGenericBotanical(rawText)
  }

  return {
    kind,
    ...headerFor(company, kind, rawText),
    lines,
    rawText,
  }
}
