'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  Bell,
  Database,
  LayoutTemplate,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'
import { useAppPreferences } from '@/components/app-preferences-provider'
import {
  CHIP_RADIUS,
  COLOR_PRESETS,
  FONT_FAMILIES,
  FONT_SCALES,
  RADIUS_VALUES,
  type AppPreferences,
  type ChipStyleId,
  type ColorPresetId,
  type DensityId,
  type FontFamilyId,
  type FontSizeId,
  type RadiusId,
  type ThemeMode,
} from '@/lib/app-preferences'

type SettingsViewProps = {
  onNotice: (message: string) => void
}

const TABS = [
  ['appearance', 'Apariencia', Palette],
  ['operational', 'Operativa', SlidersHorizontal],
  ['labeling', 'Etiquetado', Tag],
  ['notifications', 'Notificaciones', Bell],
  ['data', 'Datos', Database],
] as const

type TabId = (typeof TABS)[number][0]

export function SettingsView({ onNotice }: SettingsViewProps) {
  const { preferences, updatePreferences, resetPreferences } = useAppPreferences()
  const [tab, setTab] = useState<TabId>('appearance')

  const applyPreset = (preset: Exclude<ColorPresetId, 'custom'>) => {
    updatePreferences({
      colorPreset: preset,
      colors: COLOR_PRESETS[preset],
    })
  }

  const patchColors = (patch: Partial<AppPreferences['colors']>) => {
    updatePreferences({
      colorPreset: 'custom',
      colors: { ...preferences.colors, ...patch },
    })
  }

  const saveAll = () => {
    onNotice('Configuración guardada correctamente')
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ep-muted)]">Preferencias</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1e3d28]">Configuración</h1>
          <p className="mt-1 text-sm text-[#66746a]">Personaliza la apariencia del panel, alertas operativas e integraciones del garden center.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              resetPreferences()
              onNotice('Valores restaurados por defecto')
            }}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium text-[#597360] hover:bg-[#f5f8f4]"
          >
            <RotateCcw className="size-4" />
            Restaurar
          </button>
          <button type="button" onClick={saveAll} className="rounded-xl bg-[var(--ep-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--ep-primary-hover)]">
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-[#f0f4f0] p-1">
        {TABS.map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${tab === id ? 'bg-white text-[var(--ep-primary)] shadow-sm' : 'text-[#7f8e83]'}`}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {tab === 'appearance' && (
            <>
              <Card title="Tema y colores">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Modo de color"
                    value={preferences.themeMode}
                    onChange={(v) => updatePreferences({ themeMode: v as ThemeMode })}
                    options={[
                      ['light', 'Claro'],
                      ['dark', 'Oscuro'],
                      ['system', 'Sistema'],
                    ]}
                  />
                  <SelectField
                    label="Paleta predefinida"
                    value={preferences.colorPreset}
                    onChange={(v) => {
                      if (v !== 'custom') applyPreset(v as Exclude<ColorPresetId, 'custom'>)
                      else updatePreferences({ colorPreset: 'custom' })
                    }}
                    options={[
                      ['eiviplant', 'Eiviplant'],
                      ['forest', 'Bosque'],
                      ['ocean', 'Océano'],
                      ['sunset', 'Atardecer'],
                      ['custom', 'Personalizado'],
                    ]}
                  />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <ColorField label="Color principal" value={preferences.colors.primary} onChange={(v) => patchColors({ primary: v })} />
                  <ColorField label="Hover principal" value={preferences.colors.primaryHover} onChange={(v) => patchColors({ primaryHover: v })} />
                  <ColorField label="Sidebar" value={preferences.colors.sidebar} onChange={(v) => patchColors({ sidebar: v })} />
                  <ColorField label="Fondo del panel" value={preferences.colors.background} onChange={(v) => patchColors({ background: v })} />
                  <ColorField label="Acento suave" value={preferences.colors.accentSoft} onChange={(v) => patchColors({ accentSoft: v })} />
                  <ColorField label="Texto secundario" value={preferences.colors.muted} onChange={(v) => patchColors({ muted: v })} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(Object.keys(COLOR_PRESETS) as Array<Exclude<ColorPresetId, 'custom'>>).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium capitalize ${preferences.colorPreset === preset ? 'border-[var(--ep-primary)] bg-[var(--ep-accent-soft)] text-[var(--ep-primary)]' : 'border-[#e3e9e3] bg-white'}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </Card>

              <Card title="Tipografía y tamaño">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Familia de fuente"
                    value={preferences.fontFamily}
                    onChange={(v) => updatePreferences({ fontFamily: v as FontFamilyId })}
                    options={[
                      ['system', 'Sistema'],
                      ['humanist', 'Humanista'],
                      ['serif', 'Serif'],
                      ['mono', 'Monoespaciada'],
                    ]}
                  />
                  <SelectField
                    label="Tamaño base"
                    value={preferences.fontSize}
                    onChange={(v) => updatePreferences({ fontSize: v as FontSizeId })}
                    options={[
                      ['compact', 'Compacto'],
                      ['comfortable', 'Cómodo'],
                      ['large', 'Grande'],
                    ]}
                  />
                </div>
                <p className="mt-3 text-xs text-[#9aa59c]">Escala actual: {Math.round(FONT_SCALES[preferences.fontSize] * 100)}%</p>
              </Card>

              <Card title="Densidad, bordes y chips">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Densidad de interfaz"
                    value={preferences.density}
                    onChange={(v) => updatePreferences({ density: v as DensityId })}
                    options={[
                      ['compact', 'Compacta'],
                      ['comfortable', 'Equilibrada'],
                      ['spacious', 'Amplia'],
                    ]}
                  />
                  <SelectField
                    label="Radio de bordes"
                    value={preferences.borderRadius}
                    onChange={(v) => updatePreferences({ borderRadius: v as RadiusId })}
                    options={[
                      ['sm', 'Pequeño'],
                      ['md', 'Medio'],
                      ['lg', 'Grande'],
                      ['xl', 'Extra grande'],
                    ]}
                  />
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Estilo de chips y estados</p>
                  <div className="flex flex-wrap gap-2">
                    {(['pill', 'rounded', 'square'] as ChipStyleId[]).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => updatePreferences({ chipStyle: style })}
                        className={`px-3 py-2 text-xs font-medium ${preferences.chipStyle === style ? 'bg-[var(--ep-primary)] text-white' : 'bg-[#f0f4f0] text-[#597360]'}`}
                        style={{ borderRadius: CHIP_RADIUS[style] }}
                      >
                        {style === 'pill' ? 'Píldora' : style === 'rounded' ? 'Redondeado' : 'Cuadrado'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <Toggle label="Mostrar fotos en existencias" checked={preferences.showProductPhotos} onChange={(v) => updatePreferences({ showProductPhotos: v })} />
                  <Toggle label="Animaciones suaves" checked={preferences.animateTransitions} onChange={(v) => updatePreferences({ animateTransitions: v })} />
                </div>
              </Card>
            </>
          )}

          {tab === 'operational' && (
            <Card title="Operativa de stock">
              <div className="space-y-3">
                <Toggle label="Avisos de stock bajo" checked={preferences.lowStockAlerts} onChange={(v) => updatePreferences({ lowStockAlerts: v })} />
                <Toggle label="Recordatorio de mermas pendientes" checked={preferences.mermaReminders} onChange={(v) => updatePreferences({ mermaReminders: v })} />
                <Toggle label="Mostrar márgenes solo a administradores" checked={preferences.marginsAdminOnly} onChange={(v) => updatePreferences({ marginsAdminOnly: v })} />
                <Toggle label="Confirmación automática OCR (beta)" checked={preferences.ocrAutoConfirm} onChange={(v) => updatePreferences({ ocrAutoConfirm: v })} />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Vista por defecto en existencias"
                  value={preferences.defaultInventoryView}
                  onChange={(v) => updatePreferences({ defaultInventoryView: v as 'grid' | 'list' })}
                  options={[
                    ['list', 'Lista'],
                    ['grid', 'Tarjetas'],
                  ]}
                />
                <SelectField
                  label="Filas por página en movimientos"
                  value={String(preferences.movementRowsPerPage)}
                  onChange={(v) => updatePreferences({ movementRowsPerPage: Number(v) })}
                  options={[
                    ['10', '10'],
                    ['15', '15'],
                    ['25', '25'],
                    ['50', '50'],
                  ]}
                />
              </div>
            </Card>
          )}

          {tab === 'labeling' && (
            <Card title="Etiquetado y trazabilidad">
              <div className="space-y-4">
                <TextField
                  label="Formato código Eiviplant"
                  value={preferences.eiviplantCodeFormat}
                  onChange={(v) => updatePreferences({ eiviplantCodeFormat: v })}
                />
                <TextField
                  label="Nombre del garden center"
                  value={preferences.gardenCenterName}
                  onChange={(v) => updatePreferences({ gardenCenterName: v })}
                />
                <SelectField
                  label="Formato de fecha"
                  value={preferences.dateFormat}
                  onChange={(v) => updatePreferences({ dateFormat: v as AppPreferences['dateFormat'] })}
                  options={[
                    ['dmy', 'DD/MM/AAAA'],
                    ['ymd', 'AAAA-MM-DD'],
                  ]}
                />
                <SelectField
                  label="Símbolo de moneda"
                  value={preferences.currencySymbol}
                  onChange={(v) => updatePreferences({ currencySymbol: v as AppPreferences['currencySymbol'] })}
                  options={[
                    ['€', 'Euro (€)'],
                    ['$', 'Dólar ($)'],
                    ['£', 'Libra (£)'],
                  ]}
                />
                <p className="text-xs text-[#9aa59c]">Compatible con lectores de código de barras e impresoras de etiquetas existentes.</p>
              </div>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card title="Alertas y avisos">
              <div className="space-y-3">
                <Toggle label="Reservas por vencer" checked={preferences.reservationReminders} onChange={(v) => updatePreferences({ reservationReminders: v })} />
                <Toggle label="Stock bajo en resumen" checked={preferences.lowStockAlerts} onChange={(v) => updatePreferences({ lowStockAlerts: v })} />
                <Toggle label="Mermas sin registrar" checked={preferences.mermaReminders} onChange={(v) => updatePreferences({ mermaReminders: v })} />
              </div>
              <div className="mt-5 rounded-xl border border-dashed border-[#dfe6df] bg-[#f5f8f4] p-4 text-sm text-[#66746a]">
                Canales push, email y WhatsApp se configurarán en la fase de integración con Eiviplant.
              </div>
            </Card>
          )}

          {tab === 'data' && (
            <Card title="Datos, idioma e integraciones">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Idioma del panel"
                  value={preferences.language}
                  onChange={(v) => updatePreferences({ language: v as AppPreferences['language'] })}
                  options={[
                    ['es', 'Español'],
                    ['ca', 'Català'],
                    ['en', 'English'],
                  ]}
                />
                <SelectField
                  label="Exportación por defecto"
                  value="csv"
                  onChange={() => undefined}
                  options={[
                    ['csv', 'CSV'],
                    ['xlsx', 'Excel'],
                    ['pdf', 'PDF'],
                  ]}
                />
              </div>
              <div className="mt-5 space-y-3 text-sm text-[#66746a]">
                <p>Integraciones previstas: TPV Link, impresoras Zebra, lectores Honeywell y ERP contable.</p>
                <button type="button" onClick={() => onNotice('Sincronización simulada con TPV Link')} className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-[#f5f8f4]">
                  Probar conexión TPV
                </button>
              </div>
            </Card>
          )}
        </div>

        <AppearancePreview preferences={preferences} />
      </div>
    </>
  )
}

function AppearancePreview({ preferences }: { preferences: AppPreferences }) {
  const previewStyle = useMemo(
    () =>
      ({
        fontFamily: FONT_FAMILIES[preferences.fontFamily],
        fontSize: `calc(14px * ${FONT_SCALES[preferences.fontSize]})`,
        borderRadius: RADIUS_VALUES[preferences.borderRadius],
        background: preferences.colors.background,
        color: '#253129',
      }) as const,
    [preferences],
  )

  return (
    <div className="xl:sticky xl:top-6 xl:self-start">
      <Card title="Vista previa en vivo" icon={LayoutTemplate}>
        <div className="overflow-hidden rounded-xl border" style={previewStyle}>
          <div className="px-4 py-3" style={{ background: preferences.colors.sidebar }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: preferences.colors.muted }}>
              Sidebar
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: preferences.colors.primary }}>
              Eiviplant
            </p>
          </div>
          <div className="space-y-3 p-4">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white"
              style={{ background: preferences.colors.primary, borderRadius: RADIUS_VALUES[preferences.borderRadius] }}
            >
              Botón principal
            </button>
            <div className="flex flex-wrap gap-2">
              {['En stock', 'Stock bajo', 'Agotado'].map((label, i) => (
                <span
                  key={label}
                  className="px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    borderRadius: CHIP_RADIUS[preferences.chipStyle],
                    background: i === 0 ? preferences.colors.accentSoft : i === 1 ? '#fef3c7' : '#fde3e0',
                    color: i === 0 ? preferences.colors.primary : i === 1 ? '#8a5a12' : '#c55f58',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="rounded-lg border bg-white p-3">
              <p className="text-sm font-medium">Monstera Deliciosa</p>
              <p className="text-xs" style={{ color: preferences.colors.muted }}>
                64 físico · 8 reserv. · 56 disp.
              </p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#9aa59c]">Los cambios se aplican al panel completo al instante.</p>
      </Card>
    </div>
  )
}

function Card({ title, children, icon: Icon }: { title: string; children: ReactNode; icon?: typeof Palette }) {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        {Icon && <Icon className="size-4 text-[var(--ep-primary)]" />}
        <h2 className="font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--ep-primary)]" />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: [string, string][]
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-10 w-full rounded-xl border bg-white px-3 outline-none focus:border-[var(--ep-primary)]"
      >
        {options.map(([val, text]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-10 w-full rounded-xl border px-3 outline-none focus:border-[var(--ep-primary)]"
      />
    </label>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="size-10 cursor-pointer rounded-lg border bg-white p-1" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 min-w-0 flex-1 rounded-xl border px-3 font-mono text-xs outline-none focus:border-[var(--ep-primary)]"
        />
      </div>
    </label>
  )
}
