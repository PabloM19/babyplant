'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleHelp,
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
  PanelLeftClose,
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
} from 'lucide-react'
import { ReceptionWizard } from '@/components/reception-wizard'
import { AppPreferencesProvider, useAppPreferences } from '@/components/app-preferences-provider'
import { GuidedTour, HelpCenter } from '@/components/help-center'
import { LoginScreen } from '@/components/login-screen'
import { SettingsView } from '@/components/settings-view'
import { UserMenu } from '@/components/user-menu'
import { UsersPanel } from '@/components/users-panel'
import { NotificationsPanel } from '@/components/notifications-panel'
import { ManualEntryWizard } from '@/components/manual-entry-wizard'
import { ReservationWizard } from '@/components/reservation-wizard'
import { SuppliersPanel } from '@/components/suppliers-panel'
import { tutorialSteps, type HelpTopic } from '@/lib/help-content'
import {
  activityLog,
  computeAppMetrics,
  locationZone,
  movements,
  productStatus,
  products,
  reservations,
  stockTotals,
  type ActivityLogEntry,
  type AppMetrics,
  type LocationZone,
  type Product,
  type Procedencia,
  type Reservation,
} from '@/lib/demo-data'
import { getLocationImage, getProductImage } from '@/lib/media'

const nav = [
  ['Resumen', LayoutDashboard],
  ['Existencias', Package],
  ['Movimientos', TrendingUp],
  ['Reservas', Bookmark],
  ['Recepción', ScanLine],
  ['Proveedores', Truck],
  ['Ubicaciones', MapPin],
  ['Informes', FileText],
] as const

function SidebarTooltip({ label, anchor }: { label: string; anchor: DOMRect }) {
  return createPortal(
    <span
      className="pointer-events-none fixed z-[200] -translate-y-1/2 whitespace-nowrap rounded-lg bg-[#1e3d28] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
      style={{ top: anchor.top + anchor.height / 2, left: anchor.right + 10 }}
    >
      {label}
      <span className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#1e3d28]" />
    </span>,
    document.body,
  )
}

function SidebarNavItem({
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
  tourTarget,
}: {
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  collapsed: boolean
  onClick: () => void
  tourTarget?: boolean
}) {
  const itemRef = useRef<HTMLDivElement>(null)
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null)

  const showTooltip = () => {
    if (!collapsed || !itemRef.current) return
    setTooltipAnchor(itemRef.current.getBoundingClientRect())
  }

  return (
    <div ref={itemRef} className="relative" onMouseEnter={showTooltip} onMouseLeave={() => setTooltipAnchor(null)} onFocus={showTooltip} onBlur={() => setTooltipAnchor(null)}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
        {...(tourTarget ? { 'data-tour-nav': label } : {})}
        className={`flex w-full items-center rounded-xl text-left text-[13px] transition-colors ${
          collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
        } ${active ? 'bg-white font-medium text-[#1e3d28] shadow-sm' : 'text-[#597360] hover:bg-white/60'}`}
      >
        <span className="relative shrink-0">
          <Icon className="size-[18px]" strokeWidth={active ? 2.25 : 2} />
        </span>
        {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      </button>
      {tooltipAnchor && <SidebarTooltip label={label} anchor={tooltipAnchor} />}
    </div>
  )
}

function SidebarNav({
  active,
  go,
  onOpenHelp,
  onNavigate,
  collapsed,
  isAdmin,
}: {
  active: string
  go: (label: string) => void
  onOpenHelp: () => void
  onNavigate?: () => void
  collapsed?: boolean
  isAdmin: boolean
}) {
  const isCollapsed = collapsed ?? false

  const navigate = (label: string) => {
    go(label)
    onNavigate?.()
  }

  return (
    <>
      <div className={`mb-6 ${isCollapsed ? 'flex justify-center px-0' : 'px-2'}`}>
        <img
          src={isCollapsed ? '/favicon.jpg' : '/logo-eiviplant.jpg'}
          alt="Eiviplant"
          className={
            isCollapsed
              ? 'size-10 rounded-lg object-contain'
              : 'w-full rounded-lg object-contain object-left'
          }
        />
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-[#75917b]">GESTIÓN DE STOCK</p>
        )}
        {nav.map(([label, Icon]) => (
          <SidebarNavItem
            key={label}
            label={label}
            icon={Icon}
            active={active === label}
            collapsed={isCollapsed}
            onClick={() => navigate(label)}
            tourTarget
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 pt-4">
        {isAdmin && (
          <SidebarNavItem label="Usuarios" icon={Users} active={active === 'Usuarios'} collapsed={isCollapsed} onClick={() => navigate('Usuarios')} />
        )}
        <SidebarNavItem label="Ayuda" icon={CircleHelp} active={false} collapsed={isCollapsed} onClick={onOpenHelp} />
        <SidebarNavItem label="Configuración" icon={Settings} active={active === 'Configuración'} collapsed={isCollapsed} onClick={() => navigate('Configuración')} tourTarget />
      </div>
    </>
  )
}

export default function Page() {
  return (
    <AppPreferencesProvider>
      <PageShell />
    </AppPreferencesProvider>
  )
}

function PageShell() {
  const { session } = useAppPreferences()
  if (!session.isLoggedIn) return <LoginScreen />
  return <PageContent />
}

function PageContent() {
  const { preferences, profile } = useAppPreferences()
  const isAdmin = profile.role === 'Administrador'
  const [active, setActive] = useState('Resumen')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [zoneFilter, setZoneFilter] = useState<'Todas' | LocationZone>('Todas')
  const [selected, setSelected] = useState<string[]>([])
  const [grid, setGrid] = useState(preferences.defaultInventoryView === 'grid')
  const [notice, setNotice] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [quickSearch, setQuickSearch] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [helpTopicId, setHelpTopicId] = useState<string | null>(null)
  const [tutorialActive, setTutorialActive] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)

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
        const zone = locationZone(item.location)
        const text = `${item.name} ${item.category} ${item.location} ${item.eiviplantCode} ${item.procedencias
          .map((p) => `${p.supplier} ${p.lot} ${p.barcode ?? ''} ${p.phytosanitaryPassport ?? ''}`)
          .join(' ')}`.toLowerCase()
        const matchesQuery = text.includes(query.toLowerCase())
        const matchesStatus = filter === 'Todos' || status === filter
        const matchesZone = zoneFilter === 'Todas' || zone === zoneFilter
        return matchesQuery && matchesStatus && matchesZone
      }),
    [query, filter, zoneFilter],
  )

  const quickResults = useMemo(
    () =>
      quickSearch.length >= 2
        ? products.filter((p) => `${p.name} ${p.eiviplantCode}`.toLowerCase().includes(quickSearch.toLowerCase())).slice(0, 5)
        : [],
    [quickSearch],
  )

  const metrics = useMemo(() => computeAppMetrics(), [])
  const totals = metrics.totals

  const select = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const go = (label: string) => {
    setActive(label)
    setQuery('')
    setFilter('Todos')
    setZoneFilter('Todas')
    setSelected([])
    setMobileOpen(false)
  }
  const action = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3000)
  }

  const openHelp = () => {
    setHelpTopicId(null)
    setHelpOpen(true)
  }

  const goToTutorialStep = (index: number) => {
    setTutorialStep(index)
    const step = tutorialSteps[index]
    if (step) go(step.section)
  }

  const startTutorial = () => {
    setTutorialActive(true)
    goToTutorialStep(0)
  }

  const finishTutorial = () => {
    setTutorialActive(false)
    setTutorialStep(0)
    setMobileOpen(false)
    action('Tutorial completado. Puedes volver a iniciarlo desde Ayuda.')
  }

  useEffect(() => {
    if (!tutorialActive) return
    const step = tutorialSteps[tutorialStep]
    if (!step) return
    if (window.matchMedia('(max-width: 767px)').matches) setMobileOpen(true)
  }, [tutorialActive, tutorialStep])

  const openHelpTopic = (topic: HelpTopic) => {
    setHelpOpen(false)
    go(topic.section)
  }

  const tourHighlightSection = tutorialActive ? tutorialSteps[tutorialStep]?.section ?? null : null

  return (
    <main className="min-h-screen bg-[var(--ep-bg)] text-[#253129]">
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 z-10 flex w-[280px] max-w-[88vw] flex-col bg-[var(--ep-sidebar)] px-4 py-5 shadow-2xl">
            <SidebarNav active={active} go={go} onOpenHelp={openHelp} onNavigate={() => setMobileOpen(false)} isAdmin={isAdmin} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen w-full">
        <aside
          className={`fixed inset-y-0 left-0 z-40 hidden h-screen flex-col bg-[var(--ep-sidebar)] py-5 transition-[width,padding] duration-200 md:flex ${
            sidebarCollapsed ? 'w-[72px] px-2' : 'w-[240px] px-4'
          }`}
        >
          <SidebarNav active={active} go={go} onOpenHelp={openHelp} collapsed={sidebarCollapsed} isAdmin={isAdmin} />
        </aside>

        <div
          aria-hidden
          className={`hidden shrink-0 transition-[width] duration-200 md:block ${sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'}`}
        />

        <section className="min-w-0 flex-1">
          <header className="border-b border-[#e5e9e5]">
            <div className="flex items-center gap-2 px-5 py-3 md:gap-3 md:px-7">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="flex size-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border bg-white active:bg-[#f0f4f0] md:hidden"
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
              >
                <Menu className="size-5" />
              </button>
              <img src="/logo-eiviplant.jpg" alt="Eiviplant" className="max-h-10 max-w-[160px] rounded-lg object-contain object-left md:hidden" />
              <button
                type="button"
                onClick={() => setSidebarCollapsed((c) => !c)}
                aria-label={sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
                className="hidden size-10 shrink-0 items-center justify-center rounded-xl border border-[#e3e9e3] bg-white text-[#597360] transition-colors hover:bg-[#f5f8f4] md:flex"
              >
                {sidebarCollapsed ? <ChevronRight className="size-5" /> : <PanelLeftClose className="size-5" />}
              </button>
              <div className="relative hidden min-w-0 max-w-[410px] flex-1 md:block">
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
                          <ProductThumb productId={p.id} className="size-9 rounded-lg" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{p.name}</p>
                            <p className="text-xs text-[#829187]">{p.eiviplantCode}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="font-semibold text-[var(--ep-primary)]">{t.available} disp.</p>
                            <p className="text-[#9aa59c]">{t.physical} físico</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
                <button
                  type="button"
                  onClick={openHelp}
                  aria-label="Centro de ayuda"
                  className="flex size-11 touch-manipulation items-center justify-center rounded-xl border bg-white active:bg-[#f0f4f0] md:size-auto md:border-0 md:p-2 md:hover:bg-[#f5f8f4]"
                >
                  <CircleHelp className="size-[18px] text-[#829187]" />
                </button>
                <NotificationsPanel onOpen={go} />
                <UserMenu onOpenSettings={() => go('Configuración')} onNotice={action} />
              </div>
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
                          <ProductThumb productId={p.id} className="size-9 rounded-lg" />
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

          </header>

          <div className="ep-density-pad px-5 py-7 md:px-7 md:py-8">
            {active === 'Resumen' && <Overview action={action} go={go} metrics={metrics} />}
            {active === 'Existencias' && (
              <Inventory
                filtered={filtered}
                filter={filter}
                setFilter={setFilter}
                zoneFilter={zoneFilter}
                setZoneFilter={setZoneFilter}
                query={query}
                setQuery={setQuery}
                selected={selected}
                select={select}
                grid={grid}
                setGrid={setGrid}
                action={action}
                totals={totals}
                deltas={metrics.deltas}
                expanded={expanded}
                setExpanded={setExpanded}
              />
            )}
            {active === 'Movimientos' && <Movements action={action} movements={movements} metrics={metrics} />}
            {active === 'Reservas' && <ReservationsView action={action} reservations={reservations} metrics={metrics} />}
            {active === 'Recepción' && <Reception action={action} />}
            {active === 'Proveedores' && <SuppliersPanel suppliers={metrics.suppliers} onNotice={action} />}
            {active === 'Ubicaciones' && <Locations action={action} locations={metrics.locations} />}
            {active === 'Informes' && <Reports action={action} metrics={metrics} />}
            {active === 'Usuarios' && isAdmin && <UsersPanel onNotice={action} />}
            {active === 'Usuarios' && !isAdmin && (
              <div className="rounded-2xl border bg-white p-8 text-center">
                <p className="text-lg font-semibold text-[#213529]">Acceso restringido</p>
                <p className="mt-2 text-sm text-[#829187]">Solo el administrador puede gestionar usuarios del panel.</p>
              </div>
            )}
            {active === 'Configuración' && <SettingsView onNotice={action} />}
          </div>
        </section>
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm shadow-xl">
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

      <HelpCenter
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onStartTutorial={startTutorial}
        onOpenTopic={openHelpTopic}
        initialTopicId={helpTopicId}
      />

      <GuidedTour
        active={tutorialActive}
        stepIndex={tutorialStep}
        highlightSection={tourHighlightSection}
        onNext={() => {
          if (tutorialStep >= tutorialSteps.length - 1) finishTutorial()
          else goToTutorialStep(tutorialStep + 1)
        }}
        onPrev={() => goToTutorialStep(Math.max(0, tutorialStep - 1))}
        onSkip={finishTutorial}
      />

      {notice && (
        <div className="fixed bottom-5 right-5 z-10 flex items-center gap-3 rounded-xl bg-[#316742] px-4 py-3 text-sm text-white shadow-xl">
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

function StockBreakdown({
  physical,
  reserved,
  immobilized,
  available,
  variant = 'grid',
}: {
  physical: number
  reserved: number
  immobilized: number
  available: number
  variant?: 'grid' | 'table'
}) {
  if (variant === 'table') {
    return (
      <div className="min-w-0">
        <p className="text-sm font-semibold tabular-nums text-[#316742]">
          {available.toLocaleString('es-ES')}
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-[#9aa59c]">disp.</span>
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] tabular-nums text-[#829187]">
          <span>{physical.toLocaleString('es-ES')} fís.</span>
          <span className="text-[#d6ded7]">·</span>
          <span className="text-[#be761b]">{reserved.toLocaleString('es-ES')} res.</span>
          <span className="text-[#d6ded7]">·</span>
          <span className="text-[#7b6b9e]">{immobilized.toLocaleString('es-ES')} inmov.</span>
        </div>
      </div>
    )
  }

  const items = [
    { label: 'Físico', value: physical, color: 'text-[#31543a]' },
    { label: 'Reservado', value: reserved, color: 'text-[#be761b]' },
    { label: 'Inmovilizado', value: immobilized, color: 'text-[#7b6b9e]' },
    { label: 'Disponible', value: available, color: 'text-[#316742] font-semibold' },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((x) => (
        <div key={x.label} className="rounded-xl bg-[#f5f8f4] px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#9aa59c]">{x.label}</p>
          <p className={`text-sm tabular-nums ${x.color}`}>{x.value.toLocaleString('es-ES')}</p>
        </div>
      ))}
    </div>
  )
}

function AvailabilityCard({
  totals,
  onViewInventory,
}: {
  totals: AppMetrics['totals']
  onViewInventory: () => void
}) {
  const total = totals.physical || 1
  const availablePct = Math.round((totals.available / total) * 100)
  const reservedPct = (totals.reserved / total) * 100
  const immobilizedPct = (totals.immobilized / total) * 100
  const availableBar = (totals.available / total) * 100

  const metrics = [
    { label: 'Físico', value: totals.physical, icon: Boxes, bg: 'bg-[#edf2ee]', iconColor: 'text-[#597360]', valueColor: 'text-[#31543a]' },
    { label: 'Reservado', value: totals.reserved, icon: Bookmark, bg: 'bg-[#faf3e4]', iconColor: 'text-[#be761b]', valueColor: 'text-[#8a5a12]' },
    { label: 'Inmovilizado', value: totals.immobilized, icon: Lock, bg: 'bg-[#f0ecf5]', iconColor: 'text-[#7b6b9e]', valueColor: 'text-[#6b5b8e]' },
    { label: 'Disponible', value: totals.available, icon: Leaf, bg: 'bg-[#e8f3ea]', iconColor: 'text-[#316742]', valueColor: 'text-[#1e3d28]' },
  ]

  const badges = [
    { label: `${totals.references} referencias`, dot: 'bg-[#3c9561]', bg: 'bg-[#e8f3ea]', text: 'text-[#31543a]' },
    { label: `${totals.low} stock bajo`, dot: 'bg-[#d59036]', bg: 'bg-[#faf3e4]', text: 'text-[#8a5a12]' },
    { label: `${totals.out} agotados`, dot: 'bg-[#c55f58]', bg: 'bg-[#fde8e6]', text: 'text-[#9e4a44]' },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e3e9e3] bg-gradient-to-br from-white via-white to-[#f0f5f1] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#213529]">Disponibilidad real</h2>
          <p className="mt-1 text-sm text-[#829187]">Disponible = físico − reservado − inmovilizado</p>
        </div>
        <button
          onClick={onViewInventory}
          className="shrink-0 rounded-lg border border-[#d6e5d8] bg-white px-3 py-1.5 text-xs font-medium text-[#316742] transition-colors hover:bg-[#f5f8f4]"
        >
          Ver existencias
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#84a08a]">Disponible ahora</p>
          <p className="mt-1 text-[40px] font-semibold leading-none tabular-nums tracking-tight text-[#213529]">{totals.available.toLocaleString('es-ES')}</p>
          <p className="mt-2 text-sm text-[#829187]">
            de <span className="font-medium text-[#597360]">{totals.physical.toLocaleString('es-ES')}</span> unidades en almacén
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[#dcefe0] bg-white/80 px-4 py-3 backdrop-blur-sm">
          <div
            className="relative flex size-14 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#316742 ${availablePct * 3.6}deg, #edf0ed 0deg)` }}
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#316742]">{availablePct}%</div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#597360]">Tasa de disponibilidad</p>
            <p className="text-[11px] text-[#9aa59c]">Lista para venta</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-[#829187]">
          <span>Composición del stock</span>
          <span>{availablePct}% disponible</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-[#edf0ed] shadow-inner">
          <div className="bg-[#5a9a6a] transition-all" style={{ width: `${availableBar}%` }} title="Disponible" />
          <div className="bg-[#eacb8d]" style={{ width: `${reservedPct}%` }} title="Reservado" />
          <div className="bg-[#b8a9d4]" style={{ width: `${immobilizedPct}%` }} title="Inmovilizado" />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#829187]">
          <span className="flex items-center gap-1.5"><i className="inline-block size-2 rounded-full bg-[#5a9a6a]" />Disponible</span>
          <span className="flex items-center gap-1.5"><i className="inline-block size-2 rounded-full bg-[#eacb8d]" />Reservado</span>
          <span className="flex items-center gap-1.5"><i className="inline-block size-2 rounded-full bg-[#b8a9d4]" />Inmovilizado</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, bg, iconColor, valueColor }) => (
          <div key={label} className={`rounded-xl border border-white/60 p-3 ${bg}`}>
            <div className="flex items-center gap-2">
              <div className={`flex size-7 items-center justify-center rounded-lg bg-white/70 ${iconColor}`}>
                <Icon className="size-3.5" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#829187]">{label}</p>
            </div>
            <p className={`mt-2 text-xl font-semibold tabular-nums ${valueColor}`}>{value.toLocaleString('es-ES')}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {badges.map((b) => (
          <span key={b.label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${b.bg} ${b.text}`}>
            <i className={`inline-block size-1.5 rounded-full ${b.dot}`} />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function Overview({ action, go, metrics }: { action: (m: string) => void; go: (l: string) => void; metrics: AppMetrics }) {
  const { totals, tasks, reservations: resMetrics } = metrics
  return (
    <>
      <Heading eyebrow="PANEL DE CONTROL" title="Resumen del garden" subtitle="Existencias, reservas y actividad reciente de Eiviplant" action={() => go('Recepción')} actionLabel="Registrar entrada" />

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <AvailabilityCard totals={totals} onViewInventory={() => go('Existencias')} />

        <div className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tareas pendientes</h2>
            <CircleAlert className="size-5 text-[#d59036]" />
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <Task title="Confirmar recepción OCR" detail={`Albarán VL-8841 · ${tasks.ocrLines} líneas detectadas`} onClick={() => go('Recepción')} />
            <Task title="Reservas por vencer" detail={`${resMetrics.expiring} reservas activas vencen esta semana`} onClick={() => go('Reservas')} />
            <Task title="Registrar mermas pendientes" detail={`${tasks.pendingMermas} incidencias sin anotar esta semana`} onClick={() => go('Movimientos')} />
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
              <ProductThumb productName={m.product} className="size-8 rounded-full" />
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
  zoneFilter,
  setZoneFilter,
  query,
  setQuery,
  selected,
  select,
  grid,
  setGrid,
  action,
  totals,
  deltas,
  expanded,
  setExpanded,
}: {
  filtered: Product[]
  filter: string
  setFilter: (f: string) => void
  zoneFilter: 'Todas' | LocationZone
  setZoneFilter: (z: 'Todas' | LocationZone) => void
  query: string
  setQuery: (q: string) => void
  selected: string[]
  select: (id: string) => void
  grid: boolean
  setGrid: (g: boolean) => void
  action: (m: string) => void
  totals: { physical: number; reserved: number; immobilized: number; available: number; references: number; low: number; out: number }
  deltas: AppMetrics['deltas']
  expanded: string | null
  setExpanded: (id: string | null) => void
}) {
  return (
    <>
      <Heading eyebrow="CATÁLOGO Y EXISTENCIAS" title="Existencias" subtitle="Ficha de producto separada de sus procedencias por proveedor o lote" action={() => action('Formulario de nuevo producto abierto')} actionLabel="Nuevo producto" />
      <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={Tag} label="REFERENCIAS" value={String(totals.references)} change={deltas.references.change} tone={deltas.references.tone} />
        <Stat icon={Leaf} label="DISPONIBLES" value={String(totals.available)} change={deltas.available.change} tone={deltas.available.tone} />
        <Stat icon={CircleAlert} label="STOCK BAJO" value={String(totals.low)} change={deltas.low.change} tone={deltas.low.tone} />
        <Stat icon={Package} label="AGOTADOS" value={String(totals.out)} change={deltas.out.change} tone={deltas.out.tone} />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 sm:max-w-[340px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
          <input aria-label="Buscar productos" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, código, barras, pasaporte o proveedor..." className="h-10 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 text-sm outline-none" />
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-[#f0f4f0] p-1 text-xs font-medium text-[#7f8e83]">
          {['Todos', 'En stock', 'Stock bajo', 'Agotado'].map((x) => (
            <button key={x} onClick={() => setFilter(x)} className={`rounded-lg px-3 py-2 ${filter === x ? 'bg-white text-[#31543a] shadow-sm' : ''}`}>
              {x}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-[#f0f4f0] p-1 text-xs font-medium text-[#7f8e83]">
          {(['Todas', 'Interior', 'Exterior', 'Cuarentena'] as const).map((x) => (
            <button
              key={x}
              onClick={() => setZoneFilter(x)}
              className={`rounded-lg px-3 py-2 ${zoneFilter === x ? 'bg-white text-[#31543a] shadow-sm' : ''}`}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="hidden gap-1 rounded-xl border bg-white p-1 sm:flex">
          <button
            onClick={() => setGrid(true)}
            className={`rounded-lg p-1.5 transition-colors ${grid ? 'bg-[#e4f1e5] text-[#316742]' : 'text-[#829187] hover:bg-[#f5f8f4]'}`}
            aria-label="Vista de tarjetas"
          >
            <Grid2X2 className="size-4" />
          </button>
          <button
            onClick={() => setGrid(false)}
            className={`rounded-lg p-1.5 transition-colors ${!grid ? 'bg-[#e4f1e5] text-[#316742]' : 'text-[#829187] hover:bg-[#f5f8f4]'}`}
            aria-label="Vista de lista"
          >
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
        <div className="overflow-hidden rounded-2xl border bg-white">
          <div className="hidden border-b bg-[#f8faf7] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#829187] lg:grid lg:grid-cols-[40px_minmax(180px,2fr)_minmax(120px,1fr)_minmax(140px,1.1fr)_100px_120px] lg:items-center">
            <span />
            <span>Producto</span>
            <span>Código Eiviplant</span>
            <span>Existencias</span>
            <span>Estado</span>
            <span className="text-right">Lotes</span>
          </div>
          {filtered.map((item) => {
            const t = stockTotals(item)
            const status = productStatus(item)
            const isOpen = expanded === item.id
            return (
              <div key={item.id} className={`border-b border-[#edf0ed] last:border-0 ${isOpen ? 'bg-[#fafcfa]' : ''}`}>
                <div className="px-4 py-3 lg:grid lg:grid-cols-[40px_minmax(180px,2fr)_minmax(120px,1fr)_minmax(140px,1.1fr)_100px_120px] lg:items-center lg:gap-0">
                  <div className="flex items-start gap-3 lg:contents">
                    <button
                      type="button"
                      onClick={() => select(item.id)}
                      aria-label={`Seleccionar ${item.name}`}
                      aria-pressed={selected.includes(item.id)}
                      className="mt-1 lg:mt-0"
                    >
                      <SelectCheck checked={selected.includes(item.id)} />
                    </button>

                    <div className="flex min-w-0 flex-1 items-start gap-3 lg:contents">
                      <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
                        <ProductThumb productId={item.id} className="size-10 rounded-xl" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="truncate text-xs text-[#94a098]">
                            {item.category} · {item.procedencias.length} procedencia{item.procedencias.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? `Ocultar lotes de ${item.name}` : `Desplegar lotes de ${item.name}`}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors lg:hidden ${
                          isOpen
                            ? 'border-[#b8d7bd] bg-[#edf5ed] text-[#1e3d28]'
                            : 'border-[#dfe6df] bg-white text-[#316742]'
                        }`}
                      >
                        Lotes
                        <ChevronDown className={`size-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 pl-7 lg:mt-0 lg:space-y-0 lg:pl-0 lg:contents">
                    <span className="block font-mono text-xs text-[#66746a] lg:font-mono">{item.eiviplantCode}</span>

                    <div>
                      <StockBreakdown {...t} variant="table" />
                    </div>

                    <div>
                      <Status status={status} />
                    </div>

                    <div className="hidden justify-end lg:flex">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? `Ocultar lotes de ${item.name}` : `Desplegar lotes de ${item.name}`}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                          isOpen
                            ? 'border-[#b8d7bd] bg-[#edf5ed] text-[#1e3d28]'
                            : 'border-[#dfe6df] bg-white text-[#316742] hover:bg-[#f5f8f4]'
                        }`}
                      >
                        {item.procedencias.length} lote{item.procedencias.length > 1 ? 's' : ''}
                        <ChevronDown className={`size-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-[#e8ece8] bg-[#f5f8f4] px-4 py-4 lg:pl-[56px]">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#829187]">Procedencias y lotes</p>
                    <ProcedenciasTable procedencias={item.procedencias} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function ProcedenciasTable({ procedencias }: { procedencias: Procedencia[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wide text-[#829187]">
            <th className="pb-2 pr-4">Proveedor</th>
            <th className="pb-2 pr-4">Lote</th>
            <th className="pb-2 pr-4">Código barras</th>
            <th className="pb-2 pr-4">Pasaporte</th>
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
              <td className="py-2.5 pr-4 font-mono text-xs text-[#66746a]">{pr.barcode || '—'}</td>
              <td className="py-2.5 pr-4 font-mono text-xs text-[#66746a]">{pr.phytosanitaryPassport || '—'}</td>
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
  const { preferences } = useAppPreferences()
  const t = stockTotals(item)
  const status = productStatus(item)
  return (
    <div className="overflow-hidden rounded-2xl border bg-white">
      <div className="relative h-36 bg-[var(--ep-accent-soft)]">
        {preferences.showProductPhotos ? (
          <img src={getProductImage(item.id)} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--ep-primary)]">
            <Leaf className="size-12 opacity-70" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Seleccionar ${item.name}`}
          aria-pressed={selected}
          className="absolute right-3 top-3"
        >
          <SelectCheck checked={selected} large light={!selected} />
        </button>
        <p className="absolute bottom-3 left-3 rounded-md bg-black/45 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-sm">{item.eiviplantCode}</p>
      </div>
      <div className="p-4">
        <div className="flex justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium">{item.name}</h3>
            <p className="mt-1 text-xs text-[#8e9b91]">
              {item.category} · {item.location} · {item.procedencias.length} procedencia{item.procedencias.length > 1 ? 's' : ''}
            </p>
            {item.procedencias.length > 1 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.procedencias.map((pr) => (
                  <span key={pr.id} className="rounded-full bg-[#f0f4f0] px-2 py-0.5 font-mono text-[10px] text-[#597360]">
                    {pr.phytosanitaryPassport || pr.barcode || pr.lot}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Status status={status} />
        </div>
        <div className="mt-4">
          <StockBreakdown {...t} />
        </div>
      </div>
    </div>
  )
}

function SelectCheck({ checked, large, light }: { checked: boolean; large?: boolean; light?: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[5px] border ${
        large ? 'size-6' : 'size-[18px]'
      } ${
        checked
          ? 'border-[#316742] bg-[#316742] text-white shadow-sm'
          : light
            ? 'border-white/90 bg-white/95 text-transparent shadow-sm'
            : 'border-[#c5d0c7] bg-white text-transparent'
      }`}
    >
      {checked && <Check className={large ? 'size-3.5' : 'size-3'} strokeWidth={3} />}
    </span>
  )
}

function productImageForName(name: string) {
  const match = products.find((p) => p.name === name)
  return match ? getProductImage(match.id) : '/placeholder.jpg'
}

function ProductThumb({ productId, productName, className = '' }: { productId?: string; productName?: string; className?: string }) {
  const { preferences } = useAppPreferences()
  const src = productId ? getProductImage(productId) : productImageForName(productName ?? '')
  const label = productName ?? products.find((p) => p.id === productId)?.name ?? 'Producto'
  if (!preferences.showProductPhotos) {
    return (
      <div className={`flex shrink-0 items-center justify-center bg-[var(--ep-accent-soft)] text-[var(--ep-primary)] ${className}`}>
        <Leaf className="size-[45%]" />
      </div>
    )
  }
  return <img src={src} alt={label} className={`shrink-0 bg-[var(--ep-accent-soft)] object-cover ${className}`} />
}

function Status({ status }: { status: string }) {
  const { preferences } = useAppPreferences()
  const styles: Record<string, { text: string; dot: string; bg: string }> = {
    'En stock': { text: 'text-[#31543a]', dot: 'bg-[#3c9561]', bg: 'bg-[var(--ep-accent-soft)]' },
    'Stock bajo': { text: 'text-[#8a5a12]', dot: 'bg-[#d59036]', bg: 'bg-[#fef3c7]' },
    Agotado: { text: 'text-[#9e4a44]', dot: 'bg-[#c55f58]', bg: 'bg-[#fde3e0]' },
  }
  const style = styles[status] ?? { text: 'text-[#66746a]', dot: 'bg-[#9aa59c]', bg: 'bg-[#f0f4f0]' }
  const chipRadius = preferences.chipStyle === 'pill' ? '9999px' : preferences.chipStyle === 'rounded' ? '0.5rem' : '0.25rem'
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 text-xs font-medium ${style.text} ${style.bg}`}
      style={{ borderRadius: chipRadius }}
    >
      <span className={`size-1.5 shrink-0 rounded-full ${style.dot}`} />
      {status}
    </span>
  )
}

function Movements({ action, movements, metrics }: { action: (m: string) => void; movements: typeof import('@/lib/demo-data').movements; metrics: AppMetrics }) {
  const [typeFilter, setTypeFilter] = useState('Todos')
  const types = ['Todos', 'Entrada', 'Salida', 'Reserva', 'Liberación', 'Merma', 'Rotura', 'Ajuste', 'Inmovilizado']
  const { month, reservations: resMetrics } = metrics
  const filtered =
    typeFilter === 'Todos' ? movements : movements.filter((m) => m.type === typeFilter)

  return (
    <>
      <Heading eyebrow="TRAZABILIDAD" title="Movimientos" subtitle="Cada cambio queda registrado con producto, cantidad, usuario, tipo y motivo" action={() => action('Nuevo movimiento preparado')} actionLabel="Registrar movimiento" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={ArrowDownLeft} label="ENTRADAS ESTE MES" value={String(month.entries)} change={`+${month.entriesDeltaPct}%`} tone="up" />
        <Stat icon={ArrowUpRight} label="SALIDAS Y MERMAS" value={String(month.exitsAndMermas)} change={`+${month.exitsDeltaPct}%`} tone="neutral" />
        <Stat icon={Bookmark} label="RESERVAS ACTIVAS" value={String(resMetrics.active)} change={resMetrics.activeDelta.change} tone={resMetrics.activeDelta.tone} />
        <Stat icon={CircleAlert} label="MERMAS SIN ANOTAR" value={String(month.mermasPending)} change="+1" tone="down" />
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-[#f0f4f0] p-1 text-xs font-medium text-[#7f8e83]">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-lg px-3 py-2 transition-colors ${typeFilter === t ? 'bg-white text-[#31543a] shadow-sm' : 'hover:bg-white/70'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold">
            Histórico reciente
            {typeFilter !== 'Todos' && <span className="ml-2 text-sm font-normal text-[#829187]">· {typeFilter}</span>}
          </h2>
          <button onClick={() => action('Histórico exportado a Excel')} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
            <Download className="size-3" />
            Exportar CSV / Excel
          </button>
        </div>
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-[#829187]">No hay movimientos de tipo «{typeFilter}» en el histórico reciente.</p>
        ) : (
          filtered.map((m) => (
          <div key={m.id} className="grid gap-2 border-b px-5 py-4 last:border-0 md:grid-cols-[1.2fr_0.9fr_0.7fr_1.5fr_0.8fr_0.9fr] md:items-center">
            <div className="flex items-center gap-3">
              <ProductThumb productName={m.product} className="size-9 rounded-lg" />
              <b className="text-sm">{m.product}</b>
            </div>
            <span className="text-sm text-[#66746a]">{m.type}</span>
            <span className={`font-semibold ${m.quantity > 0 ? 'text-[#3c9561]' : m.quantity < 0 ? 'text-[#c55f58]' : 'text-[#7b6b9e]'}`}>
              {m.quantity > 0 ? '+' : ''}
              {m.quantity} uds.
            </span>
            <span className="text-sm text-[#66746a]">{m.reason}</span>
            <span className="text-xs text-[#829187]">{m.user}</span>
            <span className="text-xs text-[#9aa59c]">{m.date}</span>
          </div>
          ))
        )}
      </div>
    </>
  )
}

function ReservationsView({ action, reservations: initial, metrics }: { action: (m: string) => void; reservations: typeof import('@/lib/demo-data').reservations; metrics: AppMetrics }) {
  const [extra, setExtra] = useState<Reservation[]>([])
  const [wizardOpen, setWizardOpen] = useState(false)
  const list = [...extra, ...initial]
  const statusStyle: Record<string, string> = {
    Activa: 'bg-[#e3f5e8] text-[#328354]',
    Vencida: 'bg-[#fde3e0] text-[#c55f58]',
    Retirada: 'bg-[#edf0ed] text-[#66746a]',
  }
  const extraActive = extra.filter((r) => r.status === 'Activa').length
  const extraExpiring = extra.filter((r) => r.status === 'Activa' && r.date.startsWith('Vence')).length
  const { active, expiring, withdrawnMonth, activeDelta, expiringDelta, withdrawnDelta } = metrics.reservations
  return (
    <>
      <Heading eyebrow="COMPROMISO CON CLIENTE" title="Reservas" subtitle="Unidades reservadas reducen la disponibilidad sin retirar el stock físico" action={() => setWizardOpen(true)} actionLabel="Nueva reserva" />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat icon={Bookmark} label="RESERVAS ACTIVAS" value={String(active + extraActive)} change={activeDelta.change} tone={activeDelta.tone} />
        <Stat icon={CircleAlert} label="POR VENCER" value={String(expiring + extraExpiring)} change={expiringDelta.change} tone={expiringDelta.tone} />
        <Stat icon={CheckCircle2} label="RETIRADAS ESTE MES" value={String(withdrawnMonth)} change={withdrawnDelta.change} tone={withdrawnDelta.tone} />
      </div>
      <div className="overflow-hidden rounded-2xl border bg-white">
        {list.map((r) => (
          <div key={r.id} className="flex flex-col gap-3 border-b px-5 py-5 last:border-0 sm:flex-row sm:items-center">
            <ProductThumb productName={r.product} className="size-11 rounded-xl" />
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
      <ReservationWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={(reservation) => {
          setExtra((prev) => [reservation, ...prev])
          action(`Reserva de ${reservation.quantity} uds. de «${reservation.product}» para ${reservation.client} (demo)`)
        }}
      />
    </>
  )
}

function Reception({ action }: { action: (m: string) => void }) {
  const [manualQuery, setManualQuery] = useState('')
  const [manualNonce, setManualNonce] = useState(0)

  const openManual = (productName = '') => {
    if (productName) setManualQuery(productName)
    setManualNonce((n) => n + 1)
    document.getElementById('manual-entry-wizard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <Heading
        eyebrow="ENTRADA DE MERCANCÍA"
        title="Recepción"
        subtitle="Arriba se lee un documento. Abajo se registra a mano si no hay papel."
        action={() => openManual()}
        actionLabel="Entrada a mano"
      />
      <ReceptionWizard onComplete={action} onCreateFicha={openManual} />
      <div className="my-8 flex items-center gap-4" role="separator">
        <span className="h-px flex-1 bg-[#d7ddd8]" />
        <h2 className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#84a08a]">O, si no hay documento</h2>
        <span className="h-px flex-1 bg-[#d7ddd8]" />
      </div>
      <div id="manual-entry-wizard">
        <ManualEntryWizard key={`${manualQuery}-${manualNonce}`} onComplete={action} initialQuery={manualQuery} />
      </div>
    </>
  )
}

function Locations({ action, locations }: { action: (m: string) => void; locations: AppMetrics['locations'] }) {
  return (
    <>
      <Heading eyebrow="ESPACIOS" title="Ubicaciones" subtitle="Consulta dónde está cada producto, incluida la cuarentena fitosanitaria" action={() => action('Nueva ubicación preparada')} actionLabel="Añadir ubicación" />
      <div className="grid gap-4 md:grid-cols-2">
        {locations.map((l) => (
          <div key={l.name} className="overflow-hidden rounded-2xl border bg-white">
            <div className="relative h-28">
              <img src={getLocationImage(l.name)} alt={l.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <div className={`absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-xl shadow-sm ${l.name.includes('Cuarentena') ? 'bg-[#ede8f4] text-[#7b6b9e]' : 'bg-white/95 text-[#316742]'}`}>
                {l.name.includes('Cuarentena') ? <Lock className="size-5" /> : <MapPin className="size-5" />}
              </div>
              <button onClick={() => action(`Editando ${l.name}`)} className="absolute right-3 top-3 rounded-lg bg-white/90 p-1.5 backdrop-blur-sm">
                <Ellipsis className="size-5 text-[#597360]" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{l.name}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  l.zone === 'Cuarentena' ? 'bg-[#ede8f4] text-[#7b6b9e]' : l.zone === 'Exterior' ? 'bg-[#e4f1e5] text-[#316742]' : 'bg-[#f0f4f0] text-[#597360]'
                }`}>
                  {l.zone}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#829187]">{l.description}</p>
              <p className="mt-4 text-xl font-semibold">
                {l.items} referencias · {l.units.toLocaleString('es-ES')} uds.
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function MovementBarChart({ chart }: { chart: AppMetrics['month']['movementChart'] }) {
  const max = Math.max(...chart.map((b) => b.value), 1)
  const chartHeight = 176

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center gap-4 text-[11px] font-medium text-[#829187]">
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2.5 rounded-sm bg-[#5a9a6a]" />
          Entradas
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block size-2.5 rounded-sm bg-[#eacb8d]" />
          Salidas y mermas
        </span>
      </div>

      <div className="relative rounded-xl bg-[#fafbfa] px-3 pb-2 pt-6 sm:px-5">
        <div className="pointer-events-none absolute inset-x-3 top-6 bottom-10 flex flex-col justify-between sm:inset-x-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-t border-dashed border-[#e8ece8]" />
          ))}
        </div>

        <div className="relative flex items-end justify-between gap-2 sm:gap-4" style={{ height: chartHeight }}>
          {chart.map((bar) => {
            const totalH = Math.max(Math.round((bar.value / max) * (chartHeight - 28)), 16)
            const entriesH = Math.round((bar.entries / bar.value) * totalH)
            const exitsH = totalH - entriesH

            return (
              <div key={bar.label} className="flex flex-1 flex-col items-center justify-end" style={{ height: chartHeight }}>
                <span className="mb-2 text-[11px] font-semibold tabular-nums text-[#597360]">{bar.value}</span>
                <div className="flex w-full max-w-14 flex-col justify-end overflow-hidden rounded-t-xl shadow-sm" style={{ height: totalH }}>
                  <div className="bg-gradient-to-t from-[#4a8560] to-[#7fb892]" style={{ height: entriesH }} title={`${bar.entries} entradas`} />
                  <div className="bg-gradient-to-t from-[#d4a84a] to-[#edd9a0]" style={{ height: exitsH }} title={`${bar.exits} salidas`} />
                </div>
                <span className="mt-3 text-xs font-medium capitalize text-[#829187]">{bar.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function userInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const LOG_PAGE_SIZE = 8

function ActivityLogPanel({ entries, onExport }: { entries: ActivityLogEntry[]; onExport: () => void }) {
  const [userFilter, setUserFilter] = useState('Todos')
  const [moduleFilter, setModuleFilter] = useState('Todos')
  const [dateFilter, setDateFilter] = useState('Todos')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const users = useMemo(() => ['Todos', ...new Set(entries.map((e) => e.user))], [entries])
  const modules = useMemo(() => ['Todos', ...new Set(entries.map((e) => e.module))], [entries])
  const dates = useMemo(() => {
    const unique = [...new Set(entries.map((e) => e.date))]
    const order = ['Hoy', 'Ayer', '6 mar', '5 mar', '4 mar']
    return ['Todos', ...order.filter((d) => unique.includes(d)), ...unique.filter((d) => !order.includes(d))]
  }, [entries])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return entries.filter((entry) => {
      if (userFilter !== 'Todos' && entry.user !== userFilter) return false
      if (moduleFilter !== 'Todos' && entry.module !== moduleFilter) return false
      if (dateFilter !== 'Todos' && entry.date !== dateFilter) return false
      if (!q) return true
      const haystack = `${entry.user} ${entry.role} ${entry.action} ${entry.detail} ${entry.module}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [entries, userFilter, moduleFilter, dateFilter, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / LOG_PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * LOG_PAGE_SIZE, currentPage * LOG_PAGE_SIZE)

  const setUser = (value: string) => {
    setUserFilter(value)
    setPage(1)
  }
  const setModule = (value: string) => {
    setModuleFilter(value)
    setPage(1)
  }
  const setDate = (value: string) => {
    setDateFilter(value)
    setPage(1)
  }

  return (
    <div className="mt-5 rounded-2xl border bg-white p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold">Log de acciones</h2>
          <p className="mt-1 text-sm text-[#829187]">Trazabilidad de operaciones · filtra y consulta por usuario</p>
        </div>
        <button
          onClick={onExport}
          className="flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium text-[#597360] transition-colors hover:bg-[#f5f8f4]"
        >
          <Download className="size-3.5" />
          Exportar log
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 sm:max-w-[280px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
          <input
            aria-label="Buscar en log de acciones"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar acción, usuario o detalle…"
            className="h-10 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 text-sm outline-none focus:border-[#8bb795]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filtrar por usuario"
            value={userFilter}
            onChange={(e) => setUser(e.target.value)}
            className="h-10 rounded-xl border border-[#e3e9e3] bg-white px-3 text-sm text-[#597360] outline-none focus:border-[#8bb795]"
          >
            {users.map((u) => (
              <option key={u} value={u}>
                {u === 'Todos' ? 'Todos los usuarios' : u}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por módulo"
            value={moduleFilter}
            onChange={(e) => setModule(e.target.value)}
            className="h-10 rounded-xl border border-[#e3e9e3] bg-white px-3 text-sm text-[#597360] outline-none focus:border-[#8bb795]"
          >
            {modules.map((m) => (
              <option key={m} value={m}>
                {m === 'Todos' ? 'Todos los módulos' : m}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por fecha"
            value={dateFilter}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 rounded-xl border border-[#e3e9e3] bg-white px-3 text-sm text-[#597360] outline-none focus:border-[#8bb795]"
          >
            {dates.map((d) => (
              <option key={d} value={d}>
                {d === 'Todos' ? 'Todas las fechas' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#829187]">
        {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        {(userFilter !== 'Todos' || moduleFilter !== 'Todos' || dateFilter !== 'Todos' || query) && ' · filtros activos'}
      </p>

      <div className="mt-3 overflow-x-auto rounded-xl border border-[#edf0ed]">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#edf0ed] bg-[#f8faf7] text-[11px] font-semibold uppercase tracking-wide text-[#829187]">
              <th className="px-4 py-3">Fecha / hora</th>
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Módulo</th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#829187]">
                  No hay registros con estos filtros.
                </td>
              </tr>
            ) : (
              pageItems.map((entry) => (
                <tr key={entry.id} className="border-b border-[#edf0ed] last:border-0 hover:bg-[#fafcfa]">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[#66746a]">
                    {entry.date} · {entry.time}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#bed5c2] text-[10px] font-semibold text-[#365d40]">
                        {userInitials(entry.user)}
                      </span>
                      <span className="font-medium text-[#213529]">{entry.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#66746a]">{entry.role}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#e8f3ea] px-2 py-0.5 text-[11px] font-medium text-[#316742]">{entry.module}</span>
                  </td>
                  <td className="px-4 py-3 text-[#597360]">{entry.action}</td>
                  <td className="max-w-[280px] truncate px-4 py-3 text-xs text-[#9aa59c]" title={entry.detail}>
                    {entry.detail}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#829187]">
          {pageItems.length === 0
            ? 'Ningún registro en esta página'
            : `Mostrando ${(currentPage - 1) * LOG_PAGE_SIZE + 1}–${(currentPage - 1) * LOG_PAGE_SIZE + pageItems.length} de ${filtered.length}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-[#597360] transition-colors hover:bg-[#f5f8f4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" />
            Anterior
          </button>
          <span className="px-2 text-xs text-[#829187]">
            Página {currentPage} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-[#597360] transition-colors hover:bg-[#f5f8f4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Reports({ action, metrics }: { action: (m: string) => void; metrics: AppMetrics }) {
  const { totals, month } = metrics
  return (
    <>
      <Heading eyebrow="ANÁLISIS" title="Informes" subtitle="Exporta el histórico y consulta la evolución de existencias" action={() => action('Informe descargado')} actionLabel="Exportar informe" />
      <div className="grid gap-4 md:grid-cols-3">
        <ReportCard title="Unidades físicas" value={totals.physical.toLocaleString('es-ES')} detail="Total en almacén e invernaderos" icon={Boxes} />
        <ReportCard title="Disponibles para venta" value={totals.available.toLocaleString('es-ES')} detail="Tras reservas e inmovilizado" icon={Leaf} />
        <ReportCard title="Mermas este mes" value={String(month.mermasRecorded)} detail="Roturas, deterioro y pérdidas" icon={CircleAlert} />
      </div>
      <div className="mt-5 rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Evolución de movimientos</h2>
            <p className="mt-1 text-sm text-[#829187]">Entradas, salidas y mermas · últimos seis meses</p>
          </div>
          <CalendarDays className="size-5 text-[#87a28b]" />
        </div>
        <MovementBarChart chart={month.movementChart} />
      </div>
      <ActivityLogPanel entries={activityLog} onExport={() => action('Log de acciones exportado')} />
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

