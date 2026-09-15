import { readFileSync } from 'node:fs'
import { parseCommercialDocument } from '../lib/parse-commercial-document'

type Case = {
  file: string
  minLines: number
  company: string
  kind: string
  expectQty?: number[]
}

const cases: Case[] = [
  {
    file: '/tmp/eivi-docs/ALBARAN PLANTAS POLEPLANTS.txt',
    minLines: 9,
    company: 'poleplants',
    kind: 'albaran',
    expectQty: [32, 32, 24, 30, 15, 15, 60, 40, 60],
  },
  {
    file: '/tmp/eivi-docs/FACTURA PLANTAS POLEPLANTS.txt',
    minLines: 9,
    company: 'poleplants',
    kind: 'factura',
    expectQty: [32, 32, 24, 30, 15, 15, 60, 40, 60],
  },
  {
    file: '/tmp/eivi-docs/FACTURA PLANTAS MAS DE VALERO.txt',
    minLines: 9,
    company: 'mas-de-valero',
    kind: 'factura',
    expectQty: [40, 30, 20, 20, 10, 10, 2, 2, 2],
  },
  {
    file: '/tmp/eivi-docs/FACTURA RECTIFICATIVA MAS DE VALERO.txt',
    minLines: 1,
    company: 'mas-de-valero',
    kind: 'factura_rectificativa',
    expectQty: [-1],
  },
  {
    file: '/tmp/eivi-docs/FACTURA CORMA.txt',
    minLines: 5,
    company: 'corma',
    kind: 'factura',
    expectQty: [24, 40, 40, 17, 17],
  },
  {
    file: '/tmp/eivi-docs/FACTURA SILEVA.txt',
    minLines: 3,
    company: 'sileva',
    kind: 'factura',
    expectQty: [120, 30, 30],
  },
  {
    file: '/tmp/eivi-docs/FACTURAS CACTUS.txt',
    minLines: 2,
    company: 'cactus-elche',
    kind: 'factura',
    expectQty: [4, 20],
  },
  {
    file: '/tmp/eivi-docs/PEDIDO - ALBARAN JAVADO.txt',
    minLines: 7,
    company: 'javadoplant',
    kind: 'pedido',
    expectQty: [17, 24, 40, 12, 50, 10, 10],
  },
  {
    file: '/tmp/eivi-docs/albaran-prueba-eiviplant.txt',
    minLines: 5,
    company: 'viveros-levante',
    kind: 'albaran',
    expectQty: [20, 15, 30, 12, 8],
  },
]

let failed = 0
for (const item of cases) {
  const raw = readFileSync(item.file, 'utf8')
  const parsed = parseCommercialDocument(raw)
  const qtys = parsed.lines.map((line) => line.qty)
  const problems: string[] = []
  if (parsed.templateId.split('-')[0] !== item.company && parsed.supplier.toLowerCase().indexOf(item.company.split('-')[0]) < 0) {
    // company is encoded in templateId as `${company}-${kind}`
  }
  if (!parsed.templateId.startsWith(item.company)) problems.push(`company ${parsed.templateId} != ${item.company}`)
  if (parsed.kind !== item.kind) problems.push(`kind ${parsed.kind} != ${item.kind}`)
  if (parsed.lines.length < item.minLines) problems.push(`lines ${parsed.lines.length} < ${item.minLines}`)
  if (item.expectQty && JSON.stringify(qtys) !== JSON.stringify(item.expectQty)) {
    problems.push(`qty ${JSON.stringify(qtys)} != ${JSON.stringify(item.expectQty)}`)
  }
  const ok = problems.length === 0
  if (!ok) failed += 1
  console.log(`${ok ? 'OK' : 'FAIL'} ${item.file.split('/').pop()} | ${parsed.kind} | ${parsed.templateLabel} | nº ${parsed.albaranNumber} | ${parsed.deliveryDate} | ${parsed.lines.length} líneas`)
  for (const line of parsed.lines) {
    console.log(`   - ${line.qty} ${line.unit} · ${line.product} · ${line.status}`)
  }
  if (problems.length) console.log(`   !! ${problems.join(' | ')}`)
}

if (failed) {
  console.error(`\n${failed} caso(s) fallaron`)
  process.exit(1)
}
console.log('\nTodos los PDFs de ejemplo se leyeron como se esperaba.')
