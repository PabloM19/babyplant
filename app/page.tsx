'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Download,
  Ellipsis,
  FileText,
  Grid2X2,
  LayoutDashboard,
  Leaf,
  List,
  Lock,
  MapPin,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  ScanLine,
  Search,
  Settings,
  Tag,
  TrendingUp,
  Truck,
  Users,
  X,
  Bookmark,
  Camera,
} from 'lucide-react'
import { parseAlbaranPdf, type ParsedAlbaran } from '@/lib/parse-albaran-pdf'
import { parseAlbaranImage } from '@/lib/parse-albaran-image'
import { canUseLiveCamera, openNativeCamera } from '@/lib/open-device-camera'
import { ReceptionCamera } from '@/components/reception-camera'

type Procedencia = {
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

type Product = {
  id: string
  name: string
  category: string
  location: string
  eiviplantCode: string
  procedencias: Procedencia[]
}

type Reservation = {
  id: string
  product: string
  quantity: number
  client: string
  date: string
  status: 'Activa' | 'Vencida' | 'Retirada'
  notes: string
}

type Movement = {
  id: string
  product: string
  type: string
  quantity: number
  reason: string
  user: string
  date: string
  tone: 'in' | 'out' | 'neutral'
}

function stockTotals(p: Product) {
  const physical = p.procedencias.reduce((s, x) => s + x.physical, 0)
  const reserved = p.procedencias.reduce((s, x) => s + x.reserved, 0)
  const immobilized = p.procedencias.reduce((s, x) => s + x.immobilized, 0)
  const available = physical - reserved - immobilized
  return { physical, reserved, immobilized, available }
}

function productStatus(p: Product) {
  const { available } = stockTotals(p)
  if (available <= 0) return 'Agotado'
  if (available <= 8) return 'Stock bajo'
  return 'En stock'
}

const products: Product[] = [
  {
    id: 'p1',
    name: 'Rosa mini roja',
    category: 'Plantas de exterior',
    location: 'Invernadero A',
    eiviplantCode: 'EIV-2026-0142',
    procedencias: [
      { id: 'pr1', supplier: 'Viveros del Levante', cost: '2,40 €', margin: '45%', physical: 20, reserved: 3, immobilized: 0, lot: 'VL-8841', entryDate: '4 mar 2026' },
      { id: 'pr2', supplier: 'Flora Mediterránea', cost: '2,15 €', margin: '52%', physical: 15, reserved: 0, immobilized: 2, lot: 'FM-2209', entryDate: '28 feb 2026' },
    ],
  },
  {
    id: 'p2',
    name: 'Blaukorn Compo 5 kg',
    category: 'Abono agrícola',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0098',
    procedencias: [
      { id: 'pr3', supplier: 'Distribuciones Hortícolas', cost: '18,50 €', margin: '28%', physical: 48, reserved: 6, immobilized: 0, lot: 'DH-5512', entryDate: '1 mar 2026' },
      { id: 'pr4', supplier: 'AgroSupply Ibiza', cost: '17,90 €', margin: '32%', physical: 24, reserved: 0, immobilized: 0, lot: 'AS-1190', entryDate: '15 feb 2026' },
    ],
  },
  {
    id: 'p3',
    name: 'Monstera Deliciosa',
    category: 'Planta tropical',
    location: 'Invernadero B',
    eiviplantCode: 'EIV-2026-0201',
    procedencias: [
      { id: 'pr5', supplier: 'Viveros del Levante', cost: '48,00 €', margin: '38%', physical: 38, reserved: 5, immobilized: 0, lot: 'VL-9012', entryDate: '6 mar 2026' },
    ],
  },
  {
    id: 'p4',
    name: 'Maceta clásica terracota 30 cm',
    category: 'Maceta',
    location: 'Almacén principal',
    eiviplantCode: 'EIV-2026-0067',
    procedencias: [
      { id: 'pr6', supplier: 'Cerámica Garden', cost: '24,00 €', margin: '42%', physical: 112, reserved: 8, immobilized: 0, lot: 'CG-3301', entryDate: '20 feb 2026' },
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
      { id: 'pr8', supplier: 'Viveros del Levante', cost: '36,00 €', margin: '35%', physical: 12, reserved: 0, immobilized: 12, lot: 'VL-9920', entryDate: '7 mar 2026' },
    ],
  },
]

const reservations: Reservation[] = [
  { id: 'r1', product: 'Rosa mini roja', quantity: 3, client: 'María Torres', date: 'Vence 12 mar', status: 'Activa', notes: 'Recogida en tienda' },
  { id: 'r2', product: 'Blaukorn Compo 5 kg', quantity: 6, client: 'Hotel Ses Salines', date: 'Vence 15 mar', status: 'Activa', notes: 'Entrega en almacén' },
  { id: 'r3', product: 'Monstera Deliciosa', quantity: 5, client: 'Carlos Riera', date: 'Retirada ayer', status: 'Retirada', notes: 'Venta cerrada' },
  { id: 'r4', product: 'Maceta clásica terracota 30 cm', quantity: 8, client: 'Decor Ibiza SL', date: 'Venció 5 mar', status: 'Vencida', notes: 'Pendiente de contactar' },
]

const movements: Movement[] = [
  { id: 'm1', product: 'Rosa mini roja', type: 'Entrada', quantity: 20, reason: 'Albarán VL-8841 · Viveros del Levante', user: 'Clara Martín', date: 'Hoy, 10:24', tone: 'in' },
  { id: 'm2', product: 'Rosa mini roja', type: 'Reserva', quantity: -3, reason: 'Cliente María Torres', user: 'Jordi Soler', date: 'Hoy, 09:10', tone: 'out' },
  { id: 'm3', product: 'Olivo miniatura', type: 'Inmovilizado', quantity: 12, reason: 'Cuarentena fitosanitaria', user: 'Clara Martín', date: 'Ayer, 16:40', tone: 'neutral' },
  { id: 'm4', product: 'Maceta clásica terracota 30 cm', type: 'Salida', quantity: -5, reason: 'Venta TPV Link', user: 'Jordi Soler', date: 'Ayer, 14:20', tone: 'out' },
  { id: 'm5', product: 'Blaukorn Compo 5 kg', type: 'Merma', quantity: -2, reason: 'Saco roto en almacén', user: 'Clara Martín', date: '6 mar, 11:05', tone: 'out' },
  { id: 'm6', product: 'Monstera Deliciosa', type: 'Ajuste', quantity: +2, reason: 'Corrección tras recuento parcial', user: 'Rayan Anderson', date: '5 mar, 09:30', tone: 'in' },
]

const nav = [
  ['Resumen', LayoutDashboard],
  ['Existencias', Package],
  ['Movimientos', TrendingUp],
  ['Reservas', Bookmark],
  ['Recepción', ScanLine],
  ['Proveedores', Truck],
  ['Ubicaciones', MapPin],
  ['Informes', FileText],
  ['Equipo', Users],
] as const

function SidebarNav({
  active,
  go,
  action,
  onNavigate,
}: {
  active: string
  go: (label: string) => void
  action: (message: string) => void
  onNavigate?: () => void
}) {
  const navigate = (label: string) => {
    go(label)
    onNavigate?.()
  }

  return (
    <>
      <div className="mb-9 px-2">
        <img src="/logo-eiviplant.jpg" alt="Eiviplant" className="h-14 w-full max-w-full rounded-xl object-contain object-left" />
      </div>
      <nav className="flex flex-col gap-1 overflow-y-auto">
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-[#75917b]">GESTIÓN DE STOCK</p>
        {nav.map(([label, Icon]) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(label)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] ${active === label ? 'bg-white font-medium text-[#1e3d28] shadow-sm' : 'text-[#597360] hover:bg-white/60'}`}
          >
            <Icon className="size-[17px]" />
            {label}
            {label === 'Reservas' && <span className="ml-auto rounded-full bg-[#eacb8d] px-1.5 text-[10px] text-[#8a5a12]">2</span>}
            {label === 'Recepción' && <span className="ml-auto rounded-full bg-[#b8d7bd] px-1.5 text-[10px] text-[#316742]">OCR</span>}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <button type="button" onClick={() => action('Centro de ayuda abierto')} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-[#597360]">
          ¿ Ayuda
        </button>
        <button
          type="button"
          onClick={() => navigate('Configuración')}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] ${active === 'Configuración' ? 'bg-white font-medium' : 'text-[#597360]'}`}
        >
          <Settings className="size-[17px]" />
          Configuración
        </button>
      </div>
    </>
  )
}

function MobileBottomNav({
  active,
  go,
  onOpenMenu,
}: {
  active: string
  go: (label: string) => void
  onOpenMenu: () => void
}) {
  const tabs = [
    ['Resumen', LayoutDashboard],
    ['Existencias', Package],
    ['Recepción', ScanLine],
    ['Menú', Menu],
  ] as const

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[95] border-t border-[#e5e9e5] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-4">
        {tabs.map(([label, Icon]) => {
          const isMenu = label === 'Menú'
          const isActive = !isMenu && active === label
          return (
            <button
              key={label}
              type="button"
              onClick={() => (isMenu ? onOpenMenu() : go(label))}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-medium touch-manipulation active:bg-[#f0f4f0] ${isActive ? 'text-[#316742]' : 'text-[#829187]'}`}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2.25 : 2} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default function Page() {
  const [active, setActive] = useState('Resumen')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [selected, setSelected] = useState<string[]>([])
  const [grid, setGrid] = useState(false)
  const [notice, setNotice] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [quickSearch, setQuickSearch] = useState('')

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const filtered = useMemo(
    () =>
      products.filter((item) => {
        const status = productStatus(item)
        const text = `${item.name} ${item.category} ${item.location} ${item.eiviplantCode} ${item.procedencias.map((p) => p.supplier).join(' ')}`.toLowerCase()
        return text.includes(query.toLowerCase()) && (filter === 'Todos' || status === filter)
      }),
    [query, filter],
  )

  const quickResults = useMemo(
    () =>
      quickSearch.length >= 2
        ? products.filter((p) => `${p.name} ${p.eiviplantCode}`.toLowerCase().includes(quickSearch.toLowerCase())).slice(0, 5)
        : [],
    [quickSearch],
  )

  const totals = useMemo(() => {
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
    return { physical, reserved, immobilized, available, references: products.length, low, out }
  }, [])

  const select = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const go = (label: string) => {
    setActive(label)
    setQuery('')
    setFilter('Todos')
    setSelected([])
    setMobileOpen(false)
  }
  const action = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  return (
    <main className="min-h-screen bg-[#e9eee9] p-0 text-[#253129] md:p-5 lg:p-8">
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 z-10 flex w-[280px] max-w-[88vw] flex-col bg-[#dcefe0] px-4 py-5 shadow-2xl">
            <SidebarNav active={active} go={go} action={action} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1600px] overflow-x-hidden rounded-none border border-[#d6ded7] bg-[#fbfcfa] shadow-[0_18px_50px_rgba(46,67,52,0.08)] md:overflow-hidden md:rounded-[22px]">
        <aside className="hidden w-[240px] shrink-0 flex-col bg-[#dcefe0] px-4 py-5 md:flex">
          <SidebarNav active={active} go={go} action={action} />
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b border-[#e5e9e5]">
            <div className="flex items-center gap-3 px-5 py-3 md:hidden">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border bg-white active:bg-[#f0f4f0]"
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
              >
                <Menu className="size-5" />
              </button>
              <img src="/logo-eiviplant.jpg" alt="Eiviplant" className="h-10 max-w-[180px] flex-1 rounded-lg object-contain object-left" />
              <button
                type="button"
                onClick={() => action('No tienes notificaciones nuevas')}
                aria-label="Notificaciones"
                className="ml-auto flex size-11 touch-manipulation items-center justify-center rounded-xl border bg-white active:bg-[#f0f4f0]"
              >
                <Bell className="size-[18px] text-[#829187]" />
              </button>
            </div>
            <div className="px-5 pb-3 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
                <input
                  aria-label="Consulta rápida de productos"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Buscar producto o código…"
                  className="h-11 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 text-base outline-none focus:border-[#8bb795]"
                />
                {quickResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-xl border bg-white shadow-xl">
                    {quickResults.map((p) => {
                      const t = stockTotals(p)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            go('Existencias')
                            setQuery(p.name)
                            setQuickSearch('')
                          }}
                          className="flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-0 active:bg-[#f5f8f4]"
                        >
                          <div className="flex size-9 items-center justify-center rounded-lg bg-[#e4f1e5] text-[#316742]">
                            <Leaf className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-[#829187]">{p.eiviplantCode}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-semibold text-[#316742]">{t.available} disp.</p>
                            <p className="text-[#9aa59c]">{t.physical} físico</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden h-[76px] items-center gap-3 px-7 md:flex">
              <div className="relative max-w-[410px] flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
                <input
                  aria-label="Consulta rápida de productos"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Consulta rápida: producto o código Eiviplant..."
                  className="h-10 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 text-sm outline-none focus:border-[#8bb795]"
                />
                {quickResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 overflow-hidden rounded-xl border bg-white shadow-xl">
                    {quickResults.map((p) => {
                      const t = stockTotals(p)
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            go('Existencias')
                            setQuery(p.name)
                            setQuickSearch('')
                          }}
                          className="flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-0 hover:bg-[#f5f8f4]"
                        >
                          <div className="flex size-9 items-center justify-center rounded-lg bg-[#e4f1e5] text-[#316742]">
                            <Leaf className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-[#829187]">{p.eiviplantCode}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-semibold text-[#316742]">{t.available} disp.</p>
                            <p className="text-[#9aa59c]">{t.physical} físico</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              <button type="button" onClick={() => action('No tienes notificaciones nuevas')} aria-label="Notificaciones" className="ml-auto">
                <Bell className="size-[18px] text-[#829187]" />
              </button>
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex size-9 items-center justify-center rounded-full bg-[#bed5c2] text-sm font-semibold text-[#365d40]">LU</div>
                <div className="hidden lg:block">
                  <p className="text-[13px] font-medium">Luz Urbano</p>
                  <p className="text-[11px] text-[#8a998e]">Directora de Eiviplant</p>
                </div>
                <ChevronDown className="size-4 text-[#96a39a]" />
              </div>
            </div>
          </header>

          <div className="px-5 py-7 pb-28 md:px-7 md:py-8 md:pb-8">
            {active === 'Resumen' && <Overview action={action} go={go} totals={totals} />}
            {active === 'Existencias' && (
              <Inventory
                filtered={filtered}
                filter={filter}
                setFilter={setFilter}
                query={query}
                setQuery={setQuery}
                selected={selected}
                select={select}
                grid={grid}
                setGrid={setGrid}
                action={action}
                totals={totals}
                expanded={expanded}
                setExpanded={setExpanded}
              />
            )}
            {active === 'Movimientos' && <Movements action={action} movements={movements} />}
            {active === 'Reservas' && <ReservationsView action={action} reservations={reservations} />}
            {active === 'Recepción' && <Reception action={action} />}
            {active === 'Proveedores' && <Suppliers action={action} />}
            {active === 'Ubicaciones' && <Locations action={action} />}
            {active === 'Informes' && <Reports action={action} totals={totals} />}
            {active === 'Equipo' && <Team action={action} />}
            {active === 'Configuración' && <SettingsView action={action} />}
          </div>
        </section>
      </div>

      <MobileBottomNav active={active} go={go} onOpenMenu={() => setMobileOpen(true)} />

      {selected.length > 0 && (
        <div className="fixed bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm shadow-xl md:bottom-5">
          <b>{selected.length} seleccionados</b>
          <button onClick={() => action('Existencias exportadas a CSV')} className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <Download className="size-4" />
            Exportar
          </button>
          <button onClick={() => setSelected([])} aria-label="Limpiar selección">
            <X className="size-4" />
          </button>
        </div>
      )}

      {notice && (
        <div className="fixed bottom-24 right-5 z-10 flex items-center gap-3 rounded-xl bg-[#316742] px-4 py-3 text-sm text-white shadow-xl md:bottom-5">
          <CheckCircle2 className="size-4" />
          {notice}
          <button onClick={() => setNotice('')} aria-label="Cerrar aviso">
            <X className="size-4" />
          </button>
        </div>
      )}
    </main>
  )
}

function Heading({ eyebrow, title, subtitle, action, actionLabel }: { eyebrow: string; title: string; subtitle: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#84a08a]">{eyebrow}</p>
        <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#213529]">{title}</h1>
        <p className="mt-1 text-sm text-[#829187]">{subtitle}</p>
      </div>
      {action && (
        <button onClick={action} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#316742] px-4 text-sm font-medium text-white">
          <Plus className="size-4" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function Stat({ icon: Icon, label, value, change, tone }: { icon: typeof Boxes; label: string; value: string; change: string; tone: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="rounded-2xl border border-[#e3e9e3] bg-white p-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#738178]">
        <Icon className="size-4 text-[#85a38b]" />
        {label}
        <Ellipsis className="ml-auto size-4 text-[#b0bab1]" />
      </div>
      <div className="mt-4 text-[25px] font-semibold">{value}</div>
      <div className={`mt-1 flex items-center gap-1 text-xs ${tone === 'up' ? 'text-[#3c9561]' : tone === 'down' ? 'text-[#d66c63]' : 'text-[#7f8e83]'}`}>
        {tone === 'up' ? <ArrowUpRight className="size-3" /> : tone === 'down' ? <ArrowDownLeft className="size-3" /> : null}
        {change}
        <span className="text-[#9aa59c]">vs. mes anterior</span>
      </div>
    </div>
  )
}

function StockBreakdown({ physical, reserved, immobilized, available, compact }: { physical: number; reserved: number; immobilized: number; available: number; compact?: boolean }) {
  const items = [
    { label: 'Físico', value: physical, color: 'text-[#31543a]' },
    { label: 'Reservado', value: reserved, color: 'text-[#be761b]' },
    { label: 'Inmovilizado', value: immobilized, color: 'text-[#7b6b9e]' },
    { label: 'Disponible', value: available, color: 'text-[#316742] font-semibold' },
  ]
  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'}`}>
      {items.map((x) => (
        <div key={x.label} className={`rounded-xl bg-[#f5f8f4] px-3 py-2 ${compact ? 'text-center' : ''}`}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#9aa59c]">{x.label}</p>
          <p className={`text-sm ${x.color}`}>{x.value}</p>
        </div>
      ))}
    </div>
  )
}

function Overview({ action, go, totals }: { action: (m: string) => void; go: (l: string) => void; totals: ReturnType<typeof stockTotals> & { references: number; low: number; out: number } }) {
  return (
    <>
      <Heading eyebrow="PANEL DE CONTROL" title="Resumen del garden" subtitle="Existencias, reservas y actividad reciente de Eiviplant" action={() => go('Recepción')} actionLabel="Registrar entrada" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={Boxes} label="UNIDADES FÍSICAS" value={String(totals.physical)} change="+24" tone="up" />
        <Stat icon={Bookmark} label="RESERVADAS" value={String(totals.reserved)} change="+5" tone="neutral" />
        <Stat icon={Lock} label="INMOVILIZADAS" value={String(totals.immobilized)} change="+12" tone="neutral" />
        <Stat icon={Leaf} label="DISPONIBLES" value={String(totals.available)} change="+7" tone="up" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Disponibilidad real</h2>
              <p className="mt-1 text-sm text-[#829187]">Disponible = físico − reservado − inmovilizado</p>
            </div>
            <button onClick={() => go('Existencias')} className="text-xs font-medium text-[#316742]">
              Ver existencias
            </button>
          </div>
          <div className="mt-6">
            <StockBreakdown physical={totals.physical} reserved={totals.reserved} immobilized={totals.immobilized} available={totals.available} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#829187]">
            <span>
              <i className="mr-1 inline-block size-2 rounded-full bg-[#b8d8bd]" />
              {totals.references} referencias
            </span>
            <span>
              <i className="mr-1 inline-block size-2 rounded-full bg-[#eacb8d]" />
              {totals.low} stock bajo
            </span>
            <span>
              <i className="mr-1 inline-block size-2 rounded-full bg-[#efaaa3]" />
              {totals.out} agotados
            </span>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tareas pendientes</h2>
            <CircleAlert className="size-5 text-[#d59036]" />
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <Task title="Confirmar recepción OCR" detail="Albarán VL-8841 · 18 líneas detectadas" onClick={() => go('Recepción')} />
            <Task title="Reservas por vencer" detail="2 reservas activas en los próximos días" onClick={() => go('Reservas')} />
            <Task title="Registrar mermas pendientes" detail="3 incidencias sin anotar esta semana" onClick={() => go('Movimientos')} />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Actividad reciente</h2>
            <p className="mt-1 text-sm text-[#829187]">Últimos movimientos con trazabilidad</p>
          </div>
          <button onClick={() => go('Movimientos')} className="text-xs font-medium text-[#316742]">
            Ver histórico
          </button>
        </div>
        <div className="mt-3 grid gap-1 md:grid-cols-2">
          {movements.slice(0, 4).map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-[#edf0ed] py-3 text-sm last:border-0">
              <div className={`flex size-8 items-center justify-center rounded-full ${m.tone === 'in' ? 'bg-[#e5f2e6] text-[#316742]' : m.tone === 'out' ? 'bg-[#fde3e0] text-[#c55f58]' : 'bg-[#ede8f4] text-[#7b6b9e]'}`}>
                <TrendingUp className="size-4" />
              </div>
              <span className="flex-1">
                {m.product} · {m.type.toLowerCase()} {Math.abs(m.quantity)} uds.
              </span>
              <span className="text-xs text-[#a0aaa2]">{m.date}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function Task({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-xl bg-[#f5f8f4] p-3 text-left hover:bg-[#edf5ed]">
      <div className="flex size-8 items-center justify-center rounded-full bg-white text-[#316742]">
        <CircleAlert className="size-4" />
      </div>
      <span className="flex-1">
        <b className="block text-sm font-medium">{title}</b>
        <small className="text-xs text-[#829187]">{detail}</small>
      </span>
      <ChevronDown className="size-4 -rotate-90 text-[#9baa9f]" />
    </button>
  )
}

function Inventory({
  filtered,
  filter,
  setFilter,
  query,
  setQuery,
  selected,
  select,
  grid,
  setGrid,
  action,
  totals,
  expanded,
  setExpanded,
}: {
  filtered: Product[]
  filter: string
  setFilter: (f: string) => void
  query: string
  setQuery: (q: string) => void
  selected: string[]
  select: (id: string) => void
  grid: boolean
  setGrid: (g: boolean) => void
  action: (m: string) => void
  totals: { physical: number; reserved: number; immobilized: number; available: number; references: number; low: number; out: number }
  expanded: string | null
  setExpanded: (id: string | null) => void
}) {
  return (
    <>
      <Heading eyebrow="CATÁLOGO Y EXISTENCIAS" title="Existencias" subtitle="Ficha de producto separada de sus procedencias por proveedor o lote" action={() => action('Formulario de nuevo producto abierto')} actionLabel="Nuevo producto" />
      <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={Tag} label="REFERENCIAS" value={String(totals.references)} change="+2" tone="up" />
        <Stat icon={Leaf} label="DISPONIBLES" value={String(totals.available)} change="+7" tone="up" />
        <Stat icon={CircleAlert} label="STOCK BAJO" value={String(totals.low)} change="+1" tone="down" />
        <Stat icon={Package} label="AGOTADOS" value={String(totals.out)} change="0" tone="neutral" />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 sm:max-w-[340px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
          <input aria-label="Buscar productos" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, código o proveedor..." className="h-10 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 text-sm outline-none" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-[#f0f4f0] p-1 text-xs font-medium text-[#7f8e83]">
          {['Todos', 'En stock', 'Stock bajo', 'Agotado'].map((x) => (
            <button key={x} onClick={() => setFilter(x)} className={`rounded-lg px-3 py-2 ${filter === x ? 'bg-white text-[#31543a] shadow-sm' : ''}`}>
              {x}
            </button>
          ))}
        </div>
        <div className="hidden rounded-xl border bg-white p-1 sm:flex">
          <button onClick={() => setGrid(true)} className={`p-1.5 ${grid ? 'bg-[#e4f1e5] text-[#316742]' : ''}`} aria-label="Vista de tarjetas">
            <Grid2X2 className="size-4" />
          </button>
          <button onClick={() => setGrid(false)} className={`p-1.5 ${!grid ? 'bg-[#e4f1e5] text-[#316742]' : ''}`} aria-label="Vista de lista">
            <List className="size-4" />
          </button>
        </div>
      </div>

      {grid ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <ProductCard key={item.id} item={item} selected={selected.includes(item.id)} onSelect={() => select(item.id)} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <div className="min-w-[920px]">
            <div className="grid grid-cols-[40px_2fr_1fr_1.8fr_1fr] border-b bg-[#f8faf7] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#829187]">
              <span />
              <span>Producto</span>
              <span>Código Eiviplant</span>
              <span>Existencias</span>
              <span>Estado</span>
            </div>
            {filtered.map((item) => {
              const t = stockTotals(item)
              const status = productStatus(item)
              const isOpen = expanded === item.id
              return (
                <div key={item.id}>
                  <div className="grid grid-cols-[40px_2fr_1fr_1.8fr_1fr] items-center border-b border-[#edf0ed] px-4 py-3">
                    <button onClick={() => select(item.id)} aria-label={`Seleccionar ${item.name}`} className={`size-4 rounded border ${selected.includes(item.id) ? 'border-[#316742] bg-[#316742] text-white' : 'border-[#cbd5cc]'}`}>
                      {selected.includes(item.id) ? '✓' : ''}
                    </button>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-[#e4f1e5] text-[#316742]">
                        <Leaf className="size-5" />
                      </div>
                      <div>
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-[#94a098]">
                          {item.category} · {item.procedencias.length} procedencia{item.procedencias.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[#66746a]">{item.eiviplantCode}</span>
                    <StockBreakdown {...t} compact />
                    <div className="flex items-center gap-2">
                      <Status status={status} />
                      <button onClick={() => setExpanded(isOpen ? null : item.id)} className="text-xs text-[#316742]">
                        {isOpen ? 'Ocultar' : 'Ver lotes'}
                      </button>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="border-b border-[#edf0ed] bg-[#fafbfa] px-4 py-4">
                      <ProcedenciasTable procedencias={item.procedencias} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

function ProcedenciasTable({ procedencias }: { procedencias: Procedencia[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wide text-[#829187]">
            <th className="pb-2 pr-4">Proveedor</th>
            <th className="pb-2 pr-4">Lote</th>
            <th className="pb-2 pr-4">Entrada</th>
            <th className="pb-2 pr-4">Coste</th>
            <th className="pb-2 pr-4">Margen</th>
            <th className="pb-2 pr-4">Físico</th>
            <th className="pb-2 pr-4">Reserv.</th>
            <th className="pb-2">Inmov.</th>
          </tr>
        </thead>
        <tbody>
          {procedencias.map((pr) => (
            <tr key={pr.id} className="border-t border-[#edf0ed]">
              <td className="py-2.5 pr-4 font-medium">{pr.supplier}</td>
              <td className="py-2.5 pr-4 text-[#66746a]">{pr.lot}</td>
              <td className="py-2.5 pr-4 text-[#66746a]">{pr.entryDate}</td>
              <td className="py-2.5 pr-4">{pr.cost}</td>
              <td className="py-2.5 pr-4 text-[#66746a]">{pr.margin}</td>
              <td className="py-2.5 pr-4">{pr.physical}</td>
              <td className="py-2.5 pr-4 text-[#be761b]">{pr.reserved}</td>
              <td className="py-2.5 text-[#7b6b9e]">{pr.immobilized}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProductCard({ item, selected, onSelect }: { item: Product; selected: boolean; onSelect: () => void }) {
  const t = stockTotals(item)
  const status = productStatus(item)
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="relative bg-[#edf4ee] p-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-white/80 text-[#316742]">
          <Leaf className="size-6" />
        </div>
        <button onClick={onSelect} aria-label={`Seleccionar ${item.name}`} className={`absolute right-3 top-3 size-6 rounded-full border ${selected ? 'bg-[#316742] text-white' : 'bg-white/90 text-transparent'}`}>
          ✓
        </button>
        <p className="mt-3 font-mono text-[10px] text-[#829187]">{item.eiviplantCode}</p>
      </div>
      <div className="p-4">
        <div className="flex justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium">{item.name}</h3>
            <p className="mt-1 text-xs text-[#8e9b91]">
              {item.category} · {item.procedencias.length} procedencia{item.procedencias.length > 1 ? 's' : ''}
            </p>
          </div>
          <Status status={status} />
        </div>
        <div className="mt-4">
          <StockBreakdown {...t} compact />
        </div>
      </div>
    </div>
  )
}

function Status({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'En stock': 'bg-[#e3f5e8] text-[#328354]',
    'Stock bajo': 'bg-[#fff0d8] text-[#be761b]',
    Agotado: 'bg-[#fde3e0] text-[#c55f58]',
  }
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status] ?? ''}`}>● {status}</span>
}

function Movements({ action, movements }: { action: (m: string) => void; movements: Movement[] }) {
  const types = ['Entrada', 'Salida', 'Reserva', 'Liberación', 'Merma', 'Rotura', 'Ajuste', 'Inmovilizado']
  return (
    <>
      <Heading eyebrow="TRAZABILIDAD" title="Movimientos" subtitle="Cada cambio queda registrado con producto, cantidad, usuario, tipo y motivo" action={() => action('Nuevo movimiento preparado')} actionLabel="Registrar movimiento" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={ArrowDownLeft} label="ENTRADAS ESTE MES" value="186" change="+18%" tone="up" />
        <Stat icon={ArrowUpRight} label="SALIDAS Y MERMAS" value="74" change="+4%" tone="neutral" />
        <Stat icon={Bookmark} label="RESERVAS ACTIVAS" value="2" change="+1" tone="neutral" />
        <Stat icon={CircleAlert} label="MERMAS SIN ANOTAR" value="3" change="+1" tone="down" />
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-[#f0f4f0] p-1 text-xs font-medium text-[#7f8e83]">
        {types.map((t) => (
          <button key={t} onClick={() => action(`Filtro: ${t}`)} className="rounded-lg px-3 py-2 hover:bg-white/70">
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">Histórico reciente</h2>
          <button onClick={() => action('Histórico exportado a Excel')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
            <Download className="size-3" />
            Exportar CSV / Excel
          </button>
        </div>
        {movements.map((m) => (
          <div key={m.id} className="grid gap-2 border-b px-5 py-4 last:border-0 md:grid-cols-[1.2fr_0.9fr_0.7fr_1.5fr_0.8fr_0.9fr] md:items-center">
            <b className="text-sm">{m.product}</b>
            <span className="text-sm text-[#66746a]">{m.type}</span>
            <span className={`font-semibold ${m.quantity > 0 ? 'text-[#3c9561]' : m.quantity < 0 ? 'text-[#c55f58]' : 'text-[#7b6b9e]'}`}>
              {m.quantity > 0 ? '+' : ''}
              {m.quantity} uds.
            </span>
            <span className="text-sm text-[#66746a]">{m.reason}</span>
            <span className="text-xs text-[#829187]">{m.user}</span>
            <span className="text-xs text-[#9aa59c]">{m.date}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function ReservationsView({ action, reservations }: { action: (m: string) => void; reservations: Reservation[] }) {
  const statusStyle: Record<string, string> = {
    Activa: 'bg-[#e3f5e8] text-[#328354]',
    Vencida: 'bg-[#fde3e0] text-[#c55f58]',
    Retirada: 'bg-[#edf0ed] text-[#66746a]',
  }
  return (
    <>
      <Heading eyebrow="COMPROMISO CON CLIENTE" title="Reservas" subtitle="Unidades reservadas reducen la disponibilidad sin retirar el stock físico" action={() => action('Nueva reserva preparada')} actionLabel="Nueva reserva" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat icon={Bookmark} label="RESERVAS ACTIVAS" value="2" change="+1" tone="neutral" />
        <Stat icon={CircleAlert} label="POR VENCER" value="2" change="0" tone="down" />
        <Stat icon={CheckCircle2} label="RETIRADAS ESTE MES" value="8" change="+2" tone="up" />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-white">
        {reservations.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 border-b px-5 py-5 last:border-0 sm:flex-row sm:items-center">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e4f1e5] text-[#316742]">
              <Bookmark className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{r.product}</p>
              <p className="text-sm text-[#829187]">
                {r.quantity} uds. · {r.client}
              </p>
              <p className="mt-1 text-xs text-[#9aa59c]">{r.notes}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#66746a]">{r.date}</span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyle[r.status]}`}>{r.status}</span>
              <button onClick={() => action(`Opciones de reserva ${r.id}`)} aria-label="Más opciones">
                <MoreHorizontal className="size-5 text-[#9baa9f]" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[#9aa59c]">La gestión de cobros no forma parte de esta fase. Vigencia, avisos y cierre se configurarán con Eiviplant.</p>
    </>
  )
}

function Reception({ action }: { action: (m: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('Leyendo albarán…')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedAlbaran | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)

  const applyResult = useCallback((result: ParsedAlbaran, label: string) => {
    if (result.lines.length === 0) {
      setError('No se detectaron líneas de producto. Prueba con mejor luz o carga el PDF directamente.')
      setParsed(null)
      return
    }
    setParsed(result)
    setError('')
    setFileName(label)
  }, [])

  const processFile = useCallback(async (file: File) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    const isImage = file.type.startsWith('image/')

    if (!isPdf && !isImage) {
      setError('Formato no admitido. Usa PDF o una foto JPG/PNG del albarán.')
      return
    }

    setLoading(true)
    setLoadingLabel(isPdf ? 'Leyendo PDF…' : 'Leyendo imagen con OCR…')
    setError('')
    setFileName(file.name)

    try {
      const result = isPdf ? await parseAlbaranPdf(await file.arrayBuffer()) : await parseAlbaranImage(file)
      applyResult(result, file.name)
    } catch {
      setError(isPdf ? 'No se pudo leer el PDF.' : 'No se pudo leer la imagen. Mejora la luz o el encuadre.')
      setParsed(null)
    } finally {
      setLoading(false)
    }
  }, [applyResult])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragging(false)
      const file = event.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const statusStyle: Record<string, string> = {
    Confirmado: 'bg-[#e3f5e8] text-[#328354]',
    Revisar: 'bg-[#fff0d8] text-[#be761b]',
    'Crear ficha': 'bg-[#ede8f4] text-[#7b6b9e]',
  }

  const confirmable = parsed?.lines.filter((l) => l.status === 'Confirmado').length ?? 0

  const openCamera = useCallback(() => {
    if (canUseLiveCamera()) {
      setCameraOpen(true)
      return
    }
    openNativeCamera(photoInputRef.current)
  }, [])

  return (
    <>
      <Heading
        eyebrow="ENTRADA DE MERCANCÍA"
        title="Recepción con OCR"
        subtitle="Carga el PDF, fotografía el albarán impreso o escanea con la cámara del dispositivo"
        action={openCamera}
        actionLabel="Escanear con cámara"
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <a
          href="/albaran-prueba-eiviplant.pdf"
          download="albaran-prueba-eiviplant.pdf"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#316742] bg-white px-4 text-sm font-medium text-[#316742] hover:bg-[#f5f8f4]"
        >
          <Download className="size-4" />
          Descargar albarán de prueba
        </a>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-medium text-[#31543a] hover:bg-[#f5f8f4]"
        >
          <FileText className="size-4" />
          Cargar PDF
        </button>
        <span className="self-center text-xs text-[#9aa59c]">PDF editable · foto impresa · cámara en tablet o móvil</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#e4f1e5] text-[#316742]">
              <Camera className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold">{parsed ? 'Documento leído' : 'Documento pendiente'}</h2>
              <p className="text-sm text-[#829187]">
                {parsed
                  ? `${parsed.albaranNumber} · ${parsed.supplier}${fileName ? ` · ${fileName}` : ''}`
                  : 'PDF, foto o captura con cámara'}
              </p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) processFile(file)
              e.target.value = ''
            }}
          />

          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) processFile(file)
              e.target.value = ''
            }}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-6 flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors ${dragging ? 'border-[#316742] bg-[#edf5ed]' : 'border-[#cbd5cc] bg-[#f8faf7]'}`}
          >
            <ScanLine className="size-10 text-[#85a38b]" />
            <p className="mt-3 text-sm font-medium">{loading ? loadingLabel : 'Arrastra PDF o foto aquí'}</p>
            <p className="mt-1 px-6 text-xs text-[#9aa59c]">También puedes imprimir el albarán de prueba y fotografiarlo</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                className="rounded-lg border bg-white px-4 py-2 text-xs font-medium text-[#31543a] disabled:opacity-60"
              >
                PDF
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => photoInputRef.current?.click()}
                className="rounded-lg border bg-white px-4 py-2 text-xs font-medium text-[#31543a] disabled:opacity-60"
              >
                Foto
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={openCamera}
                className="rounded-lg bg-[#316742] px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
              >
                Cámara
              </button>
            </div>
          </div>

          {error && <div className="mt-4 rounded-xl bg-[#fde3e0] p-3 text-xs text-[#c55f58]">{error}</div>}

          <div className="mt-4 rounded-xl bg-[#fff8eb] p-3 text-xs text-[#8a5a12]">
            El PDF lee texto embebido al instante. La cámara y las fotos usan OCR: necesitan buena luz, poco inclinado y la tabla bien visible.
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Líneas detectadas</h2>
            <span className="rounded-full bg-[#e3f5e8] px-2 py-1 text-[11px] text-[#328354]">
              {parsed ? `${parsed.lines.length} líneas` : 'Sin cargar'}
            </span>
          </div>

          {!parsed && !loading && (
            <div className="mt-8 rounded-xl border border-dashed border-[#dfe5df] bg-[#fafbfa] p-8 text-center text-sm text-[#829187]">
              Descarga el albarán, imprímelo o ábrelo en pantalla y escanéalo con la cámara del móvil o tablet.
            </div>
          )}

          {parsed && (
            <>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#829187]">
                <span className="rounded-full bg-[#f0f4f0] px-2.5 py-1">Proveedor: {parsed.supplier}</span>
                <span className="rounded-full bg-[#f0f4f0] px-2.5 py-1">Albarán: {parsed.albaranNumber}</span>
                <span className="rounded-full bg-[#f0f4f0] px-2.5 py-1">Entrega: {parsed.deliveryDate}</span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {parsed.lines.map((line, i) => (
                  <div key={`${line.product}-${i}`} className="rounded-xl border border-[#edf0ed] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{line.product}</p>
                        <p className="text-sm text-[#829187]">
                          {line.qty} {line.unit}. · {parsed.supplier}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${statusStyle[line.status]}`}>{line.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={confirmable === 0}
                onClick={() =>
                  action(
                    confirmable > 0
                      ? `Recepción confirmada: ${confirmable} línea${confirmable > 1 ? 's' : ''} aplicada${confirmable > 1 ? 's' : ''} al stock`
                      : 'No hay líneas confirmables',
                  )
                }
                className="mt-5 w-full rounded-xl bg-[#316742] py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar {confirmable > 0 ? `${confirmable} línea${confirmable > 1 ? 's' : ''}` : 'recepción'}
              </button>
            </>
          )}
        </div>
      </div>

      <ReceptionCamera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onResult={applyResult}
        onError={setError}
        onNativeFallback={() => openNativeCamera(photoInputRef.current)}
      />
    </>
  )
}

function Suppliers({ action }: { action: (m: string) => void }) {
  const data = [
    ['Viveros del Levante', '58 referencias', 'Valencia', 'Actualizado hoy'],
    ['Flora Mediterránea', '34 referencias', 'Alicante', 'Actualizado ayer'],
    ['Distribuciones Hortícolas', '22 referencias', 'Ibiza', 'Actualizado hace 2 días'],
    ['Cerámica Garden', '18 referencias', 'Barcelona', 'Actualizado hace 4 días'],
  ]
  return (
    <>
      <Heading eyebrow="PROCEDENCIA" title="Proveedores" subtitle="Cada producto puede tener varias procedencias con coste y margen propios" action={() => action('Formulario de proveedor abierto')} actionLabel="Añadir proveedor" />
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {data.map((s) => (
          <div key={s[0]} className="rounded-2xl border bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#e4f1e5] text-[#316742]">
                <Truck className="size-5" />
              </div>
              <button onClick={() => action(`Opciones de ${s[0]}`)} aria-label="Más opciones">
                <MoreHorizontal className="size-5 text-[#9baa9f]" />
              </button>
            </div>
            <h3 className="mt-5 font-semibold">{s[0]}</h3>
            <p className="mt-1 text-sm text-[#66746a]">
              {s[2]} · {s[1]}
            </p>
            <p className="mt-3 text-xs text-[#9aa59c]">{s[3]}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function Locations({ action }: { action: (m: string) => void }) {
  const data = [
    ['Invernadero A', 'Plantas de exterior', '86 artículos'],
    ['Invernadero B', 'Plantas tropicales', '58 artículos'],
    ['Almacén principal', 'Macetas, abonos y accesorios', '117 artículos'],
    ['Cuarentena fitosanitaria', 'Stock inmovilizado en revisión', '6 artículos'],
  ]
  return (
    <>
      <Heading eyebrow="ESPACIOS" title="Ubicaciones" subtitle="Consulta dónde está cada producto, incluida la cuarentena fitosanitaria" action={() => action('Nueva ubicación preparada')} actionLabel="Añadir ubicación" />
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((l) => (
          <div key={l[0]} className="rounded-2xl border bg-white p-5">
            <div className="flex items-center gap-3">
              <div className={`flex size-11 items-center justify-center rounded-xl ${l[0].includes('Cuarentena') ? 'bg-[#ede8f4] text-[#7b6b9e]' : 'bg-[#e4f1e5] text-[#316742]'}`}>
                {l[0].includes('Cuarentena') ? <Lock className="size-5" /> : <MapPin className="size-5" />}
              </div>
              <div>
                <h3 className="font-semibold">{l[0]}</h3>
                <p className="text-sm text-[#829187]">{l[1]}</p>
              </div>
              <button onClick={() => action(`Editando ${l[0]}`)} className="ml-auto">
                <Ellipsis className="size-5 text-[#9baa9f]" />
              </button>
            </div>
            <p className="mt-5 text-xl font-semibold">{l[2]}</p>
          </div>
        ))}
      </div>
    </>
  )
}

function Reports({ action, totals }: { action: (m: string) => void; totals: { physical: number; available: number } }) {
  return (
    <>
      <Heading eyebrow="ANÁLISIS" title="Informes" subtitle="Exporta el histórico y consulta la evolución de existencias" action={() => action('Informe descargado')} actionLabel="Exportar informe" />
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard title="Unidades físicas" value={String(totals.physical)} detail="Total en almacén e invernaderos" icon={Boxes} />
        <ReportCard title="Disponibles para venta" value={String(totals.available)} detail="Tras reservas e inmovilizado" icon={Leaf} />
        <ReportCard title="Mermas este mes" value="6" detail="Roturas, deterioro y pérdidas" icon={CircleAlert} />
      </div>
      <div className="mt-5 rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Evolución de movimientos</h2>
            <p className="mt-1 text-sm text-[#829187]">Entradas, salidas y mermas · últimos seis meses</p>
          </div>
          <CalendarDays className="size-5 text-[#87a28b]" />
        </div>
        <div className="mt-8 flex h-40 items-end gap-3">
          {[45, 68, 54, 82, 72, 94].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-lg bg-[#b8d8bd]" style={{ height: `${h}%` }} />
              <span className="text-xs text-[#9aa59c]">{['oct', 'nov', 'dic', 'ene', 'feb', 'mar'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function ReportCard({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: typeof Boxes }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex size-10 items-center justify-center rounded-xl bg-[#e4f1e5] text-[#316742]">
        <Icon className="size-5" />
      </div>
      <p className="mt-5 text-sm text-[#829187]">{title}</p>
      <b className="mt-1 block text-2xl">{value}</b>
      <p className="mt-1 text-xs text-[#9aa59c]">{detail}</p>
    </div>
  )
}

function Team({ action }: { action: (m: string) => void }) {
  const data = [
    ['Rayan Anderson', 'Administrador · márgenes y usuarios', 'RA', 'Administrador'],
    ['Clara Martín', 'Ventas · consulta, altas y recepción', 'CM', 'Ventas'],
    ['Jordi Soler', 'Almacén · entradas, salidas y mermas', 'JS', 'Almacén'],
  ]
  return (
    <>
      <Heading eyebrow="PERSONAL" title="Equipo" subtitle="Roles diferenciados: ventas consulta coste y proveedor; administradores gestionan márgenes" action={() => action('Invitación preparada')} actionLabel="Invitar persona" />
      <div className="overflow-hidden rounded-2xl border bg-white">
        {data.map((p) => (
          <div key={p[0]} className="flex items-center gap-4 border-b px-5 py-5 last:border-0">
            <div className="flex size-11 items-center justify-center rounded-full bg-[#bed5c2] font-semibold text-[#365d40]">{p[2]}</div>
            <div className="flex-1">
              <b className="text-sm">{p[0]}</b>
              <p className="text-sm text-[#829187]">{p[1]}</p>
            </div>
            <span className="hidden rounded-full bg-[#e3f5e8] px-2 py-1 text-[11px] text-[#328354] sm:block">{p[3]}</span>
            <button onClick={() => action(`Opciones de ${p[0]}`)}>
              <Ellipsis className="size-5 text-[#9baa9f]" />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

function SettingsView({ action }: { action: (m: string) => void }) {
  return (
    <>
      <Heading eyebrow="PREFERENCIAS" title="Configuración" subtitle="Parámetros operativos de Eiviplant" />
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Operativa de stock</h2>
          <div className="mt-5 flex flex-col gap-4">
            <label className="flex items-center justify-between text-sm">
              Avisos de stock bajo
              <input type="checkbox" defaultChecked className="accent-[#316742]" />
            </label>
            <label className="flex items-center justify-between text-sm">
              Recordatorio de mermas pendientes
              <input type="checkbox" defaultChecked className="accent-[#316742]" />
            </label>
            <label className="flex items-center justify-between text-sm">
              Mostrar márgenes solo a administradores
              <input type="checkbox" defaultChecked className="accent-[#316742]" />
            </label>
          </div>
          <button onClick={() => action('Preferencias guardadas')} className="mt-6 rounded-xl bg-[#316742] px-4 py-2.5 text-sm font-medium text-white">
            Guardar cambios
          </button>
        </div>
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Etiquetado y trazabilidad</h2>
          <div className="mt-5 flex flex-col gap-4">
            <label className="text-sm">
              Formato código Eiviplant
              <input defaultValue="Proveedor · Fecha entrada · Nº interno" className="mt-2 h-10 w-full rounded-xl border px-3 outline-none focus:border-[#8bb795]" />
            </label>
            <label className="text-sm">
              Garden center
              <input defaultValue="Eiviplant · Sant Antoni de Portmany" className="mt-2 h-10 w-full rounded-xl border px-3 outline-none focus:border-[#8bb795]" />
            </label>
            <p className="text-xs text-[#9aa59c]">Compatible con lectores de código de barras e impresoras de etiquetas existentes.</p>
          </div>
        </div>
      </div>
    </>
  )
}
