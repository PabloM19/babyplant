export type Procedencia = {
  id: string
  supplier: string
  cost: string
  margin: string
  physical: number
  reserved: number
  immobilized: number
  lot: string
  entryDate: string
}

export type Product = {
  id: string
  name: string
  category: string
  location: string
  eiviplantCode: string
  procedencias: Procedencia[]
}

export type Reservation = {
  id: string
  product: string
  quantity: number
  client: string
  date: string
  status: 'Activa' | 'Vencida' | 'Retirada'
  notes: string
}

export type Movement = {
  id: string
  product: string
  type: string
  quantity: number
  reason: string
  user: string
  date: string
  tone: 'in' | 'out' | 'neutral'
}

export type StatTone = 'up' | 'down' | 'neutral'

export type StatDelta = { change: string; tone: StatTone }

export type AppMetrics = {
  totals: {
    physical: number
    reserved: number
    immobilized: number
    available: number
    references: number
    low: number
    out: number
  }
  deltas: {
    physical: StatDelta
    reserved: StatDelta
    immobilized: StatDelta
    available: StatDelta
    references: StatDelta
    low: StatDelta
    out: StatDelta
  }
  month: {
    entries: number
    exitsAndMermas: number
    entriesDeltaPct: number
    exitsDeltaPct: number
    mermasRecorded: number
    mermasPending: number
    movementChart: { label: string; value: number; entries: number; exits: number }[]
  }
  reservations: {
    active: number
    expiring: number
    withdrawnMonth: number
    activeDelta: StatDelta
    expiringDelta: StatDelta
    withdrawnDelta: StatDelta
  }
  suppliers: { name: string; references: number; city: string; updated: string }[]
  locations: { name: string; description: string; items: number; units: number }[]
  tasks: { ocrLines: number; pendingMermas: number }
}

export const CATALOG_PRODUCT_NAMES = [
  'Rosa mini roja',
  'Blaukorn Compo 5 kg',
  'Monstera Deliciosa',
  'Maceta clásica terracota 30 cm',
  'Sansevieria trifasciata',
  'Olivo miniatura',
  'Lavanda dentata M14',
  'Buganvilla rosa M17',
  'Cactus surtido M9',
  'Tierra universal 50 L',
  'Abono líquido universal 1 L',
  'Ficus lyrata M21',
  'Geranio doble rojo M12',
  'Palmera washingtonia M25',
  'Aloe vera M11',
  'Hibiscus rosa M19',
  'Orquídea Phalaenopsis',
] as const

const SUPPLIER_META: Record<string, { city: string; updated: string }> = {
  'Viveros del Levante': { city: 'Valencia', updated: 'Actualizado hoy' },
  'Flora Mediterránea': { city: 'Alicante', updated: 'Actualizado ayer' },
  'Distribuciones Hortícolas': { city: 'Ibiza', updated: 'Actualizado hace 2 días' },
  'Cerámica Garden': { city: 'Barcelona', updated: 'Actualizado hace 4 días' },
  'AgroSupply Ibiza': { city: 'Ibiza', updated: 'Actualizado hace 3 días' },
  'Viveros Can Marí': { city: 'Mallorca', updated: 'Actualizado hace 5 días' },
}

const LOCATION_META: Record<string, string> = {
  'Invernadero A': 'Plantas de exterior y floración',
  'Invernadero B': 'Plantas tropicales y de interior',
  'Almacén principal': 'Macetas, abonos y accesorios',
  'Cuarentena fitosanitaria': 'Stock inmovilizado en revisión',
}

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Rosa mini roja',
    category: 'Plantas de exterior',
    location: 'Invernadero A',
    eiviplantCode: 'EIV-2026-0142',
    procedencias: [
      { id: 'pr1', supplier: 'Viveros del Levante', cost: '2,40 €', margin: '45%', physical: 86, reserved: 9, immobilized: 0, lot: 'VL-8841', entryDate: '4 mar 2026' },
      { id: 'pr2', supplier: 'Flora Mediterránea', cost: '2,15 €', margin: '52%', physical: 44, reserved: 3, immobilized: 2, lot: 'FM-2209', entryDate: '28 feb 2026' },
    ],
  },
  {
    id: 'p2',
    name: 'Blaukorn Compo 5 kg',
    category: 'Abono agrícola',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0098',
    procedencias: [
      { id: 'pr3', supplier: 'Distribuciones Hortícolas', cost: '18,50 €', margin: '28%', physical: 156, reserved: 14, immobilized: 0, lot: 'DH-5512', entryDate: '1 mar 2026' },
      { id: 'pr4', supplier: 'AgroSupply Ibiza', cost: '17,90 €', margin: '32%', physical: 88, reserved: 4, immobilized: 0, lot: 'AS-1190', entryDate: '15 feb 2026' },
    ],
  },
  {
    id: 'p3',
    name: 'Monstera Deliciosa',
    category: 'Planta tropical',
    location: 'Invernadero B',
    eiviplantCode: 'EIV-2026-0201',
    procedencias: [
      { id: 'pr5', supplier: 'Viveros del Levante', cost: '48,00 €', margin: '38%', physical: 64, reserved: 8, immobilized: 0, lot: 'VL-9012', entryDate: '6 mar 2026' },
    ],
  },
  {
    id: 'p4',
    name: 'Maceta clásica terracota 30 cm',
    category: 'Maceta',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0067',
    procedencias: [
      { id: 'pr6', supplier: 'Cerámica Garden', cost: '24,00 €', margin: '42%', physical: 412, reserved: 24, immobilized: 0, lot: 'CG-3301', entryDate: '20 feb 2026' },
    ],
  },
  {
    id: 'p5',
    name: 'Sansevieria trifasciata',
    category: 'Planta resistente',
    location: 'Invernadero B',
    eiviplantCode: 'EIV-2026-0188',
    procedencias: [
      { id: 'pr7', supplier: 'Flora Mediterránea', cost: '32,00 €', margin: '40%', physical: 0, reserved: 0, immobilized: 0, lot: 'FM-7780', entryDate: '10 ene 2026' },
    ],
  },
  {
    id: 'p6',
    name: 'Olivo miniatura',
    category: 'Plantas de exterior',
    location: 'Cuarentena fitosanitaria',
    eiviplantCode: 'EIV-2026-0215',
    procedencias: [
      { id: 'pr8', supplier: 'Viveros del Levante', cost: '36,00 €', margin: '35%', physical: 24, reserved: 0, immobilized: 24, lot: 'VL-9920', entryDate: '7 mar 2026' },
    ],
  },
  {
    id: 'p7',
    name: 'Lavanda dentata M14',
    category: 'Plantas aromáticas',
    location: 'Invernadero A',
    eiviplantCode: 'EIV-2026-0110',
    procedencias: [
      { id: 'pr9', supplier: 'Flora Mediterránea', cost: '4,80 €', margin: '48%', physical: 96, reserved: 4, immobilized: 0, lot: 'FM-3310', entryDate: '2 mar 2026' },
    ],
  },
  {
    id: 'p8',
    name: 'Buganvilla rosa M17',
    category: 'Plantas de exterior',
    location: 'Invernadero A',
    eiviplantCode: 'EIV-2026-0156',
    procedencias: [
      { id: 'pr10', supplier: 'Viveros del Levante', cost: '12,50 €', margin: '41%', physical: 58, reserved: 6, immobilized: 0, lot: 'VL-7721', entryDate: '26 feb 2026' },
    ],
  },
  {
    id: 'p9',
    name: 'Cactus surtido M9',
    category: 'Suculentas',
    location: 'Invernadero B',
    eiviplantCode: 'EIV-2026-0173',
    procedencias: [
      { id: 'pr11', supplier: 'Viveros Can Marí', cost: '3,20 €', margin: '55%', physical: 134, reserved: 2, immobilized: 0, lot: 'CM-4412', entryDate: '18 feb 2026' },
    ],
  },
  {
    id: 'p10',
    name: 'Tierra universal 50 L',
    category: 'Sustrato',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0044',
    procedencias: [
      { id: 'pr12', supplier: 'Distribuciones Hortícolas', cost: '6,90 €', margin: '26%', physical: 178, reserved: 12, immobilized: 0, lot: 'DH-9021', entryDate: '22 feb 2026' },
    ],
  },
  {
    id: 'p11',
    name: 'Abono líquido universal 1 L',
    category: 'Abono agrícola',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0051',
    procedencias: [
      { id: 'pr13', supplier: 'AgroSupply Ibiza', cost: '8,40 €', margin: '34%', physical: 92, reserved: 0, immobilized: 0, lot: 'AS-2204', entryDate: '12 feb 2026' },
    ],
  },
  {
    id: 'p12',
    name: 'Ficus lyrata M21',
    category: 'Planta tropical',
    location: 'Invernadero B',
    eiviplantCode: 'EIV-2026-0194',
    procedencias: [
      { id: 'pr14', supplier: 'Viveros del Levante', cost: '54,00 €', margin: '36%', physical: 28, reserved: 3, immobilized: 0, lot: 'VL-6610', entryDate: '5 mar 2026' },
    ],
  },
  {
    id: 'p13',
    name: 'Geranio doble rojo M12',
    category: 'Plantas de exterior',
    location: 'Invernadero A',
    eiviplantCode: 'EIV-2026-0128',
    procedencias: [
      { id: 'pr15', supplier: 'Flora Mediterránea', cost: '3,60 €', margin: '50%', physical: 7, reserved: 2, immobilized: 0, lot: 'FM-1188', entryDate: '1 mar 2026' },
    ],
  },
  {
    id: 'p14',
    name: 'Palmera washingtonia M25',
    category: 'Plantas de exterior',
    location: 'Invernadero A',
    eiviplantCode: 'EIV-2026-0208',
    procedencias: [
      { id: 'pr16', supplier: 'Viveros del Levante', cost: '68,00 €', margin: '33%', physical: 14, reserved: 1, immobilized: 0, lot: 'VL-5502', entryDate: '24 feb 2026' },
    ],
  },
  {
    id: 'p15',
    name: 'Bomba de riego Gardena',
    category: 'Riego',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0073',
    procedencias: [
      { id: 'pr17', supplier: 'Distribuciones Hortícolas', cost: '42,00 €', margin: '29%', physical: 19, reserved: 3, immobilized: 0, lot: 'DH-7710', entryDate: '8 feb 2026' },
    ],
  },
  {
    id: 'p16',
    name: 'Piedra decorativa blanca 25 kg',
    category: 'Decoración jardín',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0082',
    procedencias: [
      { id: 'pr18', supplier: 'Cerámica Garden', cost: '11,50 €', margin: '31%', physical: 86, reserved: 0, immobilized: 0, lot: 'CG-8820', entryDate: '14 feb 2026' },
    ],
  },
  {
    id: 'p17',
    name: 'Aloe vera M11',
    category: 'Suculentas',
    location: 'Invernadero B',
    eiviplantCode: 'EIV-2026-0161',
    procedencias: [
      { id: 'pr19', supplier: 'Viveros Can Marí', cost: '5,80 €', margin: '47%', physical: 112, reserved: 8, immobilized: 0, lot: 'CM-2290', entryDate: '19 feb 2026' },
    ],
  },
  {
    id: 'p18',
    name: 'Hibiscus rosa M19',
    category: 'Plantas de exterior',
    location: 'Invernadero A',
    eiviplantCode: 'EIV-2026-0135',
    procedencias: [
      { id: 'pr20', supplier: 'Flora Mediterránea', cost: '14,20 €', margin: '39%', physical: 4, reserved: 0, immobilized: 0, lot: 'FM-9901', entryDate: '27 feb 2026' },
    ],
  },
  {
    id: 'p19',
    name: 'Sustrato cactus 5 L',
    category: 'Sustrato',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0059',
    procedencias: [
      { id: 'pr21', supplier: 'AgroSupply Ibiza', cost: '4,10 €', margin: '36%', physical: 6, reserved: 0, immobilized: 0, lot: 'AS-3308', entryDate: '3 mar 2026' },
    ],
  },
  {
    id: 'p20',
    name: 'Fitonia mixta M9',
    category: 'Planta de interior',
    location: 'Invernadero B',
    eiviplantCode: 'EIV-2026-0180',
    procedencias: [
      { id: 'pr22', supplier: 'Flora Mediterránea', cost: '2,90 €', margin: '53%', physical: 0, reserved: 0, immobilized: 0, lot: 'FM-4402', entryDate: '8 ene 2026' },
    ],
  },
  {
    id: 'p21',
    name: 'Orquídea Phalaenopsis',
    category: 'Planta de interior',
    location: 'Invernadero B',
    eiviplantCode: 'EIV-2026-0211',
    procedencias: [
      { id: 'pr23', supplier: 'Viveros del Levante', cost: '22,00 €', margin: '44%', physical: 22, reserved: 4, immobilized: 0, lot: 'VL-3388', entryDate: '6 mar 2026' },
    ],
  },
  {
    id: 'p22',
    name: 'Herbicida selectivo 750 ml',
    category: 'Fitosanitario',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0063',
    procedencias: [
      { id: 'pr24', supplier: 'Distribuciones Hortícolas', cost: '16,80 €', margin: '27%', physical: 31, reserved: 0, immobilized: 0, lot: 'DH-4419', entryDate: '11 feb 2026' },
    ],
  },
]

export const reservations: Reservation[] = [
  { id: 'r1', product: 'Rosa mini roja', quantity: 9, client: 'María Torres', date: 'Vence 12 mar', status: 'Activa', notes: 'Recogida en tienda · jardín particular' },
  { id: 'r2', product: 'Blaukorn Compo 5 kg', quantity: 14, client: 'Hotel Ses Salines', date: 'Vence 15 mar', status: 'Activa', notes: 'Entrega en almacén · pedido mensual' },
  { id: 'r3', product: 'Monstera Deliciosa', quantity: 5, client: 'Carlos Riera', date: 'Retirada ayer', status: 'Retirada', notes: 'Venta cerrada en TPV' },
  { id: 'r4', product: 'Maceta clásica terracota 30 cm', quantity: 24, client: 'Decor Ibiza SL', date: 'Venció 5 mar', status: 'Vencida', notes: 'Pendiente de contactar · obra en Sant Josep' },
  { id: 'r5', product: 'Lavanda dentata M14', quantity: 4, client: 'Villa Can Furnet', date: 'Vence 14 mar', status: 'Activa', notes: 'Instalación paisajismo · jueves' },
  { id: 'r6', product: 'Palmera washingtonia M25', quantity: 1, client: 'Restaurante Es Boldador', date: 'Vence 18 mar', status: 'Activa', notes: 'Entrega con grúa · confirmar acceso' },
  { id: 'r7', product: 'Tierra universal 50 L', quantity: 12, client: 'Cooperativa Sant Rafel', date: 'Vence 11 mar', status: 'Activa', notes: 'Recogida camión propio' },
  { id: 'r8', product: 'Aloe vera M11', quantity: 8, client: 'Spa Insular', date: 'Retirada 3 mar', status: 'Retirada', notes: 'Proyecto hotel boutique' },
  { id: 'r9', product: 'Ficus lyrata M21', quantity: 3, client: 'Ana Ferrer', date: 'Vence 20 mar', status: 'Activa', notes: 'Decoración salón · reserva pagada' },
  { id: 'r10', product: 'Buganvilla rosa M17', quantity: 6, client: 'Jardinería Formentera', date: 'Venció 2 mar', status: 'Vencida', notes: 'Cliente no responde al teléfono' },
]

export const movements: Movement[] = [
  { id: 'm1', product: 'Rosa mini roja', type: 'Entrada', quantity: 86, reason: 'Albarán VL-8841 · Viveros del Levante', user: 'Usuario Ventas', date: 'Hoy, 10:24', tone: 'in' },
  { id: 'm2', product: 'Rosa mini roja', type: 'Reserva', quantity: -9, reason: 'Cliente María Torres', user: 'Usuario Almacén', date: 'Hoy, 09:10', tone: 'out' },
  { id: 'm3', product: 'Olivo miniatura', type: 'Inmovilizado', quantity: 24, reason: 'Cuarentena fitosanitaria · lote VL-9920', user: 'Usuario Ventas', date: 'Ayer, 16:40', tone: 'neutral' },
  { id: 'm4', product: 'Maceta clásica terracota 30 cm', type: 'Salida', quantity: -18, reason: 'Venta TPV Link · ticket #4821', user: 'Usuario Almacén', date: 'Ayer, 14:20', tone: 'out' },
  { id: 'm5', product: 'Blaukorn Compo 5 kg', type: 'Merma', quantity: -2, reason: 'Saco roto en almacén', user: 'Usuario Ventas', date: '6 mar, 11:05', tone: 'out' },
  { id: 'm6', product: 'Monstera Deliciosa', type: 'Ajuste', quantity: 2, reason: 'Corrección tras recuento parcial', user: 'Usuario Administrador', date: '5 mar, 09:30', tone: 'in' },
  { id: 'm7', product: 'Lavanda dentata M14', type: 'Entrada', quantity: 48, reason: 'Albarán FM-3310 · Flora Mediterránea', user: 'Usuario Ventas', date: '5 mar, 08:15', tone: 'in' },
  { id: 'm8', product: 'Tierra universal 50 L', type: 'Salida', quantity: -24, reason: 'Pedido Cooperativa Sant Rafel', user: 'Usuario Almacén', date: '4 mar, 17:50', tone: 'out' },
  { id: 'm9', product: 'Cactus surtido M9', type: 'Entrada', quantity: 60, reason: 'Albarán CM-4412 · Viveros Can Marí', user: 'Usuario Ventas', date: '4 mar, 11:20', tone: 'in' },
  { id: 'm10', product: 'Geranio doble rojo M12', type: 'Rotura', quantity: -3, reason: 'Daño por helada nocturna', user: 'Usuario Almacén', date: '3 mar, 07:45', tone: 'out' },
  { id: 'm11', product: 'Aloe vera M11', type: 'Salida', quantity: -8, reason: 'Retirada reserva Spa Insular', user: 'Usuario Ventas', date: '3 mar, 12:30', tone: 'out' },
  { id: 'm12', product: 'Orquídea Phalaenopsis', type: 'Entrada', quantity: 22, reason: 'Albarán VL-3388 · Viveros del Levante', user: 'Usuario Ventas', date: '2 mar, 10:00', tone: 'in' },
  { id: 'm13', product: 'Hibiscus rosa M19', type: 'Merma', quantity: -1, reason: 'Planta sin recuperación · descarte', user: 'Usuario Almacén', date: '1 mar, 16:10', tone: 'out' },
  { id: 'm14', product: 'Ficus lyrata M21', type: 'Reserva', quantity: -3, reason: 'Cliente Ana Ferrer', user: 'Usuario Ventas', date: '1 mar, 11:40', tone: 'out' },
  { id: 'm15', product: 'Buganvilla rosa M17', type: 'Salida', quantity: -6, reason: 'Venta mostrador · fin de semana', user: 'Usuario Almacén', date: '28 feb, 18:05', tone: 'out' },
  { id: 'm16', product: 'Abono líquido universal 1 L', type: 'Entrada', quantity: 36, reason: 'Reposición AgroSupply Ibiza', user: 'Usuario Ventas', date: '27 feb, 09:20', tone: 'in' },
  { id: 'm17', product: 'Palmera washingtonia M25', type: 'Reserva', quantity: -1, reason: 'Restaurante Es Boldador', user: 'Usuario Ventas', date: '26 feb, 15:30', tone: 'out' },
  { id: 'm18', product: 'Piedra decorativa blanca 25 kg', type: 'Salida', quantity: -12, reason: 'Obra Decor Ibiza SL', user: 'Usuario Almacén', date: '25 feb, 13:15', tone: 'out' },
]

export type ActivityLogEntry = {
  id: string
  date: string
  time: string
  user: string
  role: string
  action: string
  detail: string
  module: string
}

export const activityLog: ActivityLogEntry[] = [
  { id: 'a1', date: 'Hoy', time: '10:24', user: 'Usuario Ventas', role: 'Ventas', action: 'Registró entrada de stock', detail: 'Rosa mini roja · 86 uds. · albarán VL-8841', module: 'Recepción' },
  { id: 'a2', date: 'Hoy', time: '10:18', user: 'Usuario Administrador', role: 'Administrador', action: 'Revisó informe de existencias', detail: 'Consulta disponibilidad global · 1.628 uds.', module: 'Informes' },
  { id: 'a3', date: 'Hoy', time: '10:02', user: 'Usuario Administrador', role: 'Administrador', action: 'Inició sesión', detail: 'Acceso desde panel web · Sant Antoni', module: 'Sistema' },
  { id: 'a4', date: 'Hoy', time: '09:42', user: 'Usuario Ventas', role: 'Ventas', action: 'Procesó albarán OCR', detail: '18 líneas detectadas · pendiente confirmación', module: 'Recepción' },
  { id: 'a5', date: 'Hoy', time: '09:10', user: 'Usuario Almacén', role: 'Almacén', action: 'Creó reserva', detail: 'Rosa mini roja · 9 uds. · María Torres', module: 'Reservas' },
  { id: 'a6', date: 'Hoy', time: '09:05', user: 'Usuario Almacén', role: 'Almacén', action: 'Consultó ficha de producto', detail: 'Blaukorn Compo 5 kg · EIV-2026-0098', module: 'Existencias' },
  { id: 'a7', date: 'Hoy', time: '09:01', user: 'Usuario Almacén', role: 'Almacén', action: 'Inició sesión', detail: 'Turno mañana · invernadero A', module: 'Sistema' },
  { id: 'a8', date: 'Hoy', time: '08:47', user: 'Usuario Ventas', role: 'Ventas', action: 'Inició sesión', detail: 'Acceso desde mostrador', module: 'Sistema' },
  { id: 'a9', date: 'Hoy', time: '08:35', user: 'Usuario Administrador', role: 'Administrador', action: 'Exportó movimientos', detail: 'Histórico CSV · últimos 30 días', module: 'Informes' },
  { id: 'a10', date: 'Hoy', time: '08:22', user: 'Usuario Administrador', role: 'Administrador', action: 'Ajustó margen de procedencia', detail: 'Monstera Deliciosa · Viveros del Levante · 38%', module: 'Existencias' },
  { id: 'a11', date: 'Hoy', time: '08:15', user: 'Usuario Almacén', role: 'Almacén', action: 'Registró merma', detail: 'Geranio doble rojo M12 · 3 uds. · helada', module: 'Movimientos' },
  { id: 'a12', date: 'Hoy', time: '07:58', user: 'Usuario Administrador', role: 'Administrador', action: 'Inició sesión', detail: 'Acceso remoto · revisión nocturna', module: 'Sistema' },
  { id: 'a13', date: 'Ayer', time: '16:40', user: 'Usuario Ventas', role: 'Ventas', action: 'Inmovilizó stock', detail: 'Olivo miniatura · 24 uds. · cuarentena VL-9920', module: 'Movimientos' },
  { id: 'a14', date: 'Ayer', time: '14:20', user: 'Usuario Almacén', role: 'Almacén', action: 'Registró salida', detail: 'Maceta terracota 30 cm · 18 uds. · TPV #4821', module: 'Movimientos' },
  { id: 'a15', date: 'Ayer', time: '11:30', user: 'Usuario Administrador', role: 'Administrador', action: 'Consultó log de acciones', detail: 'Filtro por usuario Usuario Ventas', module: 'Informes' },
  { id: 'a16', date: 'Ayer', time: '10:05', user: 'Usuario Ventas', role: 'Ventas', action: 'Confirmó recepción OCR', detail: 'Albarán FM-3310 · 12 líneas aplicadas', module: 'Recepción' },
  { id: 'a17', date: 'Ayer', time: '09:18', user: 'Usuario Almacén', role: 'Almacén', action: 'Exportó existencias', detail: 'Selección múltiple · 4 referencias', module: 'Existencias' },
  { id: 'a18', date: '6 mar', time: '17:50', user: 'Usuario Almacén', role: 'Almacén', action: 'Registró salida', detail: 'Tierra universal 50 L · pedido Cooperativa Sant Rafel', module: 'Movimientos' },
  { id: 'a19', date: '6 mar', time: '11:05', user: 'Usuario Ventas', role: 'Ventas', action: 'Registró merma', detail: 'Blaukorn Compo 5 kg · saco roto en almacén', module: 'Movimientos' },
  { id: 'a20', date: '6 mar', time: '09:30', user: 'Usuario Administrador', role: 'Administrador', action: 'Ajustó stock', detail: 'Monstera Deliciosa · +2 uds. tras recuento', module: 'Movimientos' },
  { id: 'a21', date: '5 mar', time: '16:10', user: 'Usuario Almacén', role: 'Almacén', action: 'Registró merma', detail: 'Hibiscus rosa M19 · planta sin recuperación', module: 'Movimientos' },
  { id: 'a22', date: '5 mar', time: '11:40', user: 'Usuario Ventas', role: 'Ventas', action: 'Creó reserva', detail: 'Ficus lyrata M21 · 3 uds. · Ana Ferrer', module: 'Reservas' },
  { id: 'a23', date: '5 mar', time: '08:15', user: 'Usuario Ventas', role: 'Ventas', action: 'Registró entrada', detail: 'Lavanda dentata M14 · 48 uds. · FM-3310', module: 'Recepción' },
  { id: 'a24', date: '4 mar', time: '11:20', user: 'Usuario Ventas', role: 'Ventas', action: 'Registró entrada', detail: 'Cactus surtido M9 · 60 uds. · CM-4412', module: 'Recepción' },
]

export function stockTotals(p: Product) {
  const physical = p.procedencias.reduce((s, x) => s + x.physical, 0)
  const reserved = p.procedencias.reduce((s, x) => s + x.reserved, 0)
  const immobilized = p.procedencias.reduce((s, x) => s + x.immobilized, 0)
  const available = physical - reserved - immobilized
  return { physical, reserved, immobilized, available }
}

export function productStatus(p: Product) {
  const { available } = stockTotals(p)
  if (available <= 0) return 'Agotado'
  if (available <= 8) return 'Stock bajo'
  return 'En stock'
}

function formatDelta(current: number, previous: number): StatDelta {
  const diff = current - previous
  const sign = diff > 0 ? '+' : ''
  return {
    change: `${sign}${diff}`,
    tone: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
  }
}

export function computeAppMetrics(): AppMetrics {
  let physical = 0
  let reserved = 0
  let immobilized = 0
  let available = 0
  let low = 0
  let out = 0

  products.forEach((p) => {
    const t = stockTotals(p)
    physical += t.physical
    reserved += t.reserved
    immobilized += t.immobilized
    available += t.available
    const s = productStatus(p)
    if (s === 'Stock bajo') low++
    if (s === 'Agotado') out++
  })

  const references = products.length

  const entriesMonth = 186
  const exitsAndMermas = 74
  const netStock = entriesMonth - exitsAndMermas

  const prevPhysical = physical - netStock
  const prevReserved = reserved - 11
  const prevImmobilized = immobilized - 24
  const prevAvailable = available - (netStock - 11 - 24)
  const prevReferences = references - 2
  const prevLow = low - 1
  const prevOut = out

  const activeReservations = reservations.filter((r) => r.status === 'Activa')
  const expiringReservations = activeReservations.filter((r) => r.date.startsWith('Vence'))
  const withdrawnMonth = reservations.filter((r) => r.status === 'Retirada').length + 6

  const mermasRecorded = movements.filter((m) => m.type === 'Merma' || m.type === 'Rotura').reduce((s, m) => s + Math.abs(m.quantity), 0) + 2
  const mermasPending = 3

  const supplierRefs = new Map<string, Set<string>>()
  products.forEach((p) => {
    p.procedencias.forEach((pr) => {
      const set = supplierRefs.get(pr.supplier) ?? new Set<string>()
      set.add(p.id)
      supplierRefs.set(pr.supplier, set)
    })
  })

  const suppliers = [...supplierRefs.entries()]
    .map(([name, refs]) => ({
      name,
      references: refs.size,
      city: SUPPLIER_META[name]?.city ?? 'España',
      updated: SUPPLIER_META[name]?.updated ?? 'Actualizado recientemente',
    }))
    .sort((a, b) => b.references - a.references)

  const locationStats = new Map<string, { items: number; units: number }>()
  products.forEach((p) => {
    const t = stockTotals(p)
    const cur = locationStats.get(p.location) ?? { items: 0, units: 0 }
    cur.items++
    cur.units += t.physical
    locationStats.set(p.location, cur)
  })

  const locations = [...locationStats.entries()].map(([name, stats]) => ({
    name,
    description: LOCATION_META[name] ?? 'Ubicación operativa',
    items: stats.items,
    units: stats.units,
  }))

  return {
    totals: { physical, reserved, immobilized, available, references, low, out },
    deltas: {
      physical: formatDelta(physical, prevPhysical),
      reserved: formatDelta(reserved, prevReserved),
      immobilized: formatDelta(immobilized, prevImmobilized),
      available: formatDelta(available, prevAvailable),
      references: formatDelta(references, prevReferences),
      low: formatDelta(low, prevLow),
      out: formatDelta(out, prevOut),
    },
    month: {
      entries: entriesMonth,
      exitsAndMermas,
      entriesDeltaPct: 18,
      exitsDeltaPct: 4,
      mermasRecorded,
      mermasPending,
      movementChart: [
        { label: 'oct', value: 124, entries: 82, exits: 42 },
        { label: 'nov', value: 158, entries: 96, exits: 62 },
        { label: 'dic', value: 141, entries: 88, exits: 53 },
        { label: 'ene', value: 172, entries: 108, exits: 64 },
        { label: 'feb', value: 198, entries: 118, exits: 80 },
        { label: 'mar', value: 224, entries: 134, exits: 90 },
      ],
    },
    reservations: {
      active: activeReservations.length,
      expiring: expiringReservations.length,
      withdrawnMonth,
      activeDelta: formatDelta(activeReservations.length, activeReservations.length - 2),
      expiringDelta: formatDelta(expiringReservations.length, expiringReservations.length),
      withdrawnDelta: formatDelta(withdrawnMonth, withdrawnMonth - 2),
    },
    suppliers,
    locations,
    tasks: { ocrLines: 18, pendingMermas: mermasPending },
  }
}
