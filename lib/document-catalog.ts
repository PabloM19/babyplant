export type DocumentKind = 'albaran' | 'factura' | 'factura_rectificativa' | 'pedido' | 'ticket'

export type CompanyId =
  | 'auto'
  | 'poleplants'
  | 'mas-de-valero'
  | 'corma'
  | 'sileva'
  | 'cactus-elche'
  | 'javadoplant'
  | 'viveros-levante'
  | 'generic'

export type DocumentSample = {
  id: string
  kind: DocumentKind
  company: Exclude<CompanyId, 'auto' | 'generic'>
  companyLabel: string
  file: string
  label: string
}

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  albaran: 'Albarán',
  factura: 'Factura',
  factura_rectificativa: 'Factura rectificativa',
  pedido: 'Pedido',
  ticket: 'Ticket',
}

export const COMPANY_LABELS: Record<Exclude<CompanyId, 'auto'>, string> = {
  poleplants: 'Poleplants',
  'mas-de-valero': 'Viveros Mas de Valero',
  corma: 'Corma',
  sileva: 'Sileva',
  'cactus-elche': 'Cactus Elche',
  javadoplant: 'Javadoplant',
  'viveros-levante': 'Viveros del Levante',
  generic: 'Genérica',
}

export const DOCUMENT_SAMPLES: DocumentSample[] = [
  {
    id: 'pole-albaran',
    kind: 'albaran',
    company: 'poleplants',
    companyLabel: 'Poleplants',
    file: '/documentos-oficiales/ALBARAN PLANTAS POLEPLANTS.pdf',
    label: 'Albarán Poleplants',
  },
  {
    id: 'pole-factura',
    kind: 'factura',
    company: 'poleplants',
    companyLabel: 'Poleplants',
    file: '/documentos-oficiales/FACTURA PLANTAS POLEPLANTS.pdf',
    label: 'Factura Poleplants',
  },
  {
    id: 'valero-factura',
    kind: 'factura',
    company: 'mas-de-valero',
    companyLabel: 'Viveros Mas de Valero',
    file: '/documentos-oficiales/FACTURA PLANTAS MAS DE VALERO.pdf',
    label: 'Factura Mas de Valero',
  },
  {
    id: 'valero-rectificativa',
    kind: 'factura_rectificativa',
    company: 'mas-de-valero',
    companyLabel: 'Viveros Mas de Valero',
    file: '/documentos-oficiales/FACTURA RECTIFICATIVA MAS DE VALERO.pdf',
    label: 'Rectificativa Mas de Valero',
  },
  {
    id: 'corma-factura',
    kind: 'factura',
    company: 'corma',
    companyLabel: 'Corma',
    file: '/documentos-oficiales/FACTURA CORMA.pdf',
    label: 'Factura Corma',
  },
  {
    id: 'sileva-factura',
    kind: 'factura',
    company: 'sileva',
    companyLabel: 'Sileva',
    file: '/documentos-oficiales/FACTURA SILEVA.pdf',
    label: 'Factura Sileva',
  },
  {
    id: 'cactus-factura',
    kind: 'factura',
    company: 'cactus-elche',
    companyLabel: 'Cactus Elche',
    file: '/documentos-oficiales/FACTURAS CACTUS.pdf',
    label: 'Factura Cactus Elche',
  },
  {
    id: 'javado-pedido',
    kind: 'pedido',
    company: 'javadoplant',
    companyLabel: 'Javadoplant',
    file: '/documentos-oficiales/PEDIDO - ALBARAN JAVADO.pdf',
    label: 'Pedido-albarán Javadoplant',
  },
  {
    id: 'levante-demo',
    kind: 'albaran',
    company: 'viveros-levante',
    companyLabel: 'Viveros del Levante',
    file: '/albaran-prueba-eiviplant.pdf',
    label: 'Albarán demo Levante',
  },
]

export type ParseHints = {
  kind?: DocumentKind | 'auto'
  company?: CompanyId
}

export type ParsedDocumentLine = {
  product: string
  qty: number
  unit: string
  status: 'Confirmado' | 'Revisar' | 'Crear ficha'
  code?: string
  barcode?: string
  matchedProductId?: string
}

export type ParsedDocument = {
  kind: DocumentKind
  supplier: string
  albaranNumber: string
  deliveryDate: string
  lines: ParsedDocumentLine[]
  rawText: string
  templateId: string
  templateLabel: string
}
