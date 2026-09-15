export type AlbaranTemplateId = 'viveros-levante' | 'flora-mediterranea' | 'distribuciones-horticolas' | 'generic'

export type AlbaranTemplate = {
  id: AlbaranTemplateId
  label: string
  supplierName: string
  notes: string
  detect: (text: string) => boolean
  albaranPattern?: RegExp
  datePattern?: RegExp
}

const DATE_PATTERN = /\b\d{1,2}\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.?\s+\d{4}\b/i

export const ALBARAN_TEMPLATES: AlbaranTemplate[] = [
  {
    id: 'viveros-levante',
    label: 'Viveros del Levante',
    supplierName: 'Viveros del Levante',
    notes: 'Columnas: Concepto / Descripción, Cantidad, Unidad. Nº albarán con prefijo VL-.',
    detect: (text) => /viveros del levante/i.test(text) || /\bVL-\d{3,6}\b/i.test(text),
    albaranPattern: /\bVL-\d{3,6}\b/i,
    datePattern: DATE_PATTERN,
  },
  {
    id: 'flora-mediterranea',
    label: 'Flora Mediterránea',
    supplierName: 'Flora Mediterránea',
    notes: 'Esqueleto: referencia FM y pasaporte en columna extra. PDF real pendiente de cablear.',
    detect: (text) => /flora mediterr/i.test(text) || /\bFM-\d{3,6}\b/i.test(text),
    albaranPattern: /\bFM-\d{3,6}\b/i,
    datePattern: DATE_PATTERN,
  },
  {
    id: 'distribuciones-horticolas',
    label: 'Distribuciones Hortícolas',
    supplierName: 'Distribuciones Hortícolas',
    notes: 'Esqueleto: prefijo DH-; cantidades a veces con decimales (20,00 ud). PDF real pendiente.',
    detect: (text) => /distribuciones hort/i.test(text) || /\bDH-\d{3,6}\b/i.test(text),
    albaranPattern: /\bDH-\d{3,6}\b/i,
    datePattern: DATE_PATTERN,
  },
  {
    id: 'generic',
    label: 'Plantilla genérica',
    supplierName: '',
    notes: 'Fallback si no se reconoce el vivero. Cuando lleguen PDFs reales se rellena cada plantilla.',
    detect: () => true,
    datePattern: DATE_PATTERN,
  },
]

export function resolveAlbaranTemplate(rawText: string): AlbaranTemplate {
  return ALBARAN_TEMPLATES.find((template) => template.id !== 'generic' && template.detect(rawText)) ?? ALBARAN_TEMPLATES[ALBARAN_TEMPLATES.length - 1]
}

export function extractHeaderWithTemplate(rawText: string, template: AlbaranTemplate) {
  let supplier = template.supplierName || 'Proveedor no detectado'
  let albaranNumber = '—'
  let deliveryDate = '—'

  if (!template.supplierName) {
    if (/viveros del levante/i.test(rawText)) supplier = 'Viveros del Levante'
    else if (/flora mediterr/i.test(rawText)) supplier = 'Flora Mediterránea'
    else if (/distribuciones hort/i.test(rawText)) supplier = 'Distribuciones Hortícolas'
  }

  if (template.albaranPattern) {
    const match = rawText.match(template.albaranPattern)
    if (match) albaranNumber = match[0].toUpperCase()
  } else {
    const match = rawText.match(/\b(?:VL|FM|DH|CM|AS|CG)-\d{3,6}\b/i)
    if (match) albaranNumber = match[0].toUpperCase()
  }

  const datePattern = template.datePattern ?? DATE_PATTERN
  const dateMatch = rawText.match(datePattern)
  if (dateMatch) deliveryDate = dateMatch[0]

  return { supplier, albaranNumber, deliveryDate }
}
