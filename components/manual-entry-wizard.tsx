'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { Check, ChevronLeft, ChevronRight, Leaf, Search, Sparkles } from 'lucide-react'
import { products, type Product } from '@/lib/demo-data'
import { getProductImage } from '@/lib/media'

type ManualEntryWizardProps = {
  onComplete: (message: string) => void
}

const CATEGORIES = [...new Set(products.map((p) => p.category))]
const LOCATIONS = [...new Set(products.map((p) => p.location))]
const SUPPLIERS = [...new Set(products.flatMap((p) => p.procedencias.map((pr) => pr.supplier)))]

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string) {
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  const row = Array.from({ length: n + 1 }, (_, i) => i)
  for (let i = 1; i <= m; i++) {
    let prev = i - 1
    row[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]
      row[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev, row[j], row[j - 1]) + 1
      prev = tmp
    }
  }
  return row[n]
}

function scoreMatch(query: string, name: string) {
  const q = normalize(query)
  const n = normalize(name)
  if (!q) return 0
  if (q === n) return 1
  if (n.startsWith(q) || n.includes(` ${q}`) || n.includes(q)) return 0.9
  if (q.includes(n)) return 0.82
  const candidates = [n, ...n.split(' ').filter((token) => token.length >= 3)]
  return Math.max(
    ...candidates.map((candidate) => {
      const dist = levenshtein(q, candidate)
      return 1 - dist / Math.max(q.length, candidate.length)
    }),
  )
}

function findSuggestion(query: string): Product | null {
  const q = normalize(query)
  if (q.length < 3) return null
  const ranked = products
    .map((p) => ({ p, score: scoreMatch(query, p.name) }))
    .sort((a, b) => b.score - a.score)
  const best = ranked[0]
  if (!best) return null
  if (best.score >= 0.99) return null
  if (best.score >= 0.58) return best.p
  return null
}

function exactProduct(query: string) {
  const q = normalize(query)
  return products.find((p) => normalize(p.name) === q) ?? null
}

export function ManualEntryWizard({ onComplete }: ManualEntryWizardProps) {
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [suggestion, setSuggestion] = useState<Product | null>(null)
  const [newName, setNewName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0] ?? 'Plantas de exterior')
  const [location, setLocation] = useState(LOCATIONS[0] ?? 'Invernadero A')
  const [quantity, setQuantity] = useState('12')
  const [supplier, setSupplier] = useState(SUPPLIERS[0] ?? '')
  const [lot, setLot] = useState('')
  const [cost, setCost] = useState('')
  const [error, setError] = useState('')

  const speciesName = selected?.name ?? newName
  const totalSteps = 3

  const matches = useMemo(() => {
    const q = normalize(query)
    if (q.length < 1) return products.slice(0, 6)
    return products
      .map((p) => ({ p, score: scoreMatch(query, p.name) }))
      .filter((x) => x.score > 0.35)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.p)
  }, [query])

  const pickExisting = (product: Product) => {
    setSelected(product)
    setIsNew(false)
    setQuery(product.name)
    setNewName('')
    setSuggestion(null)
    setError('')
    setLocation(product.location)
    setCategory(product.category)
    setCost(product.procedencias[0]?.cost.replace(' €', '') ?? '')
  }

  const goNextFromSpecies = () => {
    const typed = query.trim()
    if (!typed && !selected) {
      setError('Escribe o elige una especie para continuar.')
      return
    }

    if (selected && normalize(selected.name) === normalize(typed || selected.name)) {
      setError('')
      setStep(2)
      return
    }

    const exact = exactProduct(typed)
    if (exact) {
      pickExisting(exact)
      setStep(2)
      return
    }

    const maybe = findSuggestion(typed)
    if (maybe && normalize(maybe.name) !== normalize(typed)) {
      setSuggestion(maybe)
      setNewName(typed)
      return
    }

    setSelected(null)
    setIsNew(true)
    setNewName(typed)
    setCategory(CATEGORIES[0] ?? 'Plantas de exterior')
    setLocation(LOCATIONS[0] ?? 'Invernadero A')
    setError('')
    setStep(2)
  }

  const acceptSuggestion = () => {
    if (!suggestion) return
    pickExisting(suggestion)
    setStep(2)
  }

  const rejectSuggestion = () => {
    setSelected(null)
    setIsNew(true)
    setNewName(query.trim())
    setSuggestion(null)
    setCategory(CATEGORIES[0] ?? 'Plantas de exterior')
    setLocation(LOCATIONS[0] ?? 'Invernadero A')
    setError('')
    setStep(2)
  }

  const goNextFromDetails = () => {
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Indica una cantidad válida.')
      return
    }
    if (!supplier) {
      setError('Elige un proveedor.')
      return
    }
    if (isNew && !newName.trim()) {
      setError('Pon un nombre a la nueva especie.')
      return
    }
    setError('')
    setStep(3)
  }

  const resetWizard = () => {
    setStep(1)
    setQuery('')
    setSelected(null)
    setIsNew(false)
    setSuggestion(null)
    setNewName('')
    setQuantity('12')
    setLot('')
    setCost('')
    setError('')
    setCategory(CATEGORIES[0] ?? 'Plantas de exterior')
    setLocation(LOCATIONS[0] ?? 'Invernadero A')
    setSupplier(SUPPLIERS[0] ?? '')
  }

  const confirm = () => {
    const qty = Number(quantity)
    const name = speciesName
    onComplete(
      isNew
        ? `Especie nueva «${name}» creada y entrada de ${qty} uds. registrada (demo)`
        : `Entrada de ${qty} uds. de «${name}» registrada (demo)`,
    )
    resetWizard()
  }

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border bg-white">
      <div className="border-b border-[#edf0ed] px-5 py-5 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#75917b]">Sin albarán</p>
        <h2 className="mt-1 text-lg font-semibold text-[#1e3d28]">Registrar entrada a mano</h2>
        <p className="mt-1 text-sm text-[#66746a]">
          Si no vas a escanear un documento, elige una especie del catálogo o da de alta una nueva en tres pasos.
        </p>
      </div>

      <div className="flex gap-2 border-b border-[#edf0ed] px-5 py-4 sm:px-6">
        {['Especie', isNew ? 'Ficha y lote' : 'Lote y cantidad', 'Confirmar'].map((label, i) => {
          const n = i + 1
          const active = step === n
          const done = step > n
          return (
            <div key={label} className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done ? 'bg-[#316742] text-white' : active ? 'bg-[#e4f1e5] text-[#316742]' : 'bg-[#f0f4f0] text-[#829187]'
                }`}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
              </span>
              <span className={`truncate text-xs font-medium ${active ? 'text-[#1e3d28]' : 'text-[#829187]'}`}>{label}</span>
            </div>
          )
        })}
      </div>

      <div className="px-5 py-5 sm:px-6">
        {step === 1 && (
          <div>
            <label className="text-sm font-medium">¿Qué especie entra?</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelected(null)
                  setIsNew(false)
                  setError('')
                }}
                placeholder="Busca en el catálogo o escribe un nombre nuevo…"
                className="h-11 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#8bb795]"
              />
            </div>
            <p className="mt-2 text-xs text-[#9aa59c]">Si ya existe, selecciónala. Si no, continúa y la crearemos.</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {matches.map((p) => {
                const active = selected?.id === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => pickExisting(p)}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                      active ? 'border-[#316742] bg-[#edf5ed]' : 'border-[#edf0ed] bg-white hover:border-[#b8d7bd]'
                    }`}
                  >
                    <img src={getProductImage(p.id)} alt="" className="size-10 rounded-lg object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="block truncate text-xs text-[#829187]">
                        {p.category} · {p.eiviplantCode}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>

            {query.trim() && !selected && !exactProduct(query) && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-[#d8eadb] bg-[#f5f8f4] px-3 py-3 text-sm text-[#365d40]">
                <Sparkles className="mt-0.5 size-4 shrink-0" />
                <span>
                  No hay coincidencia exacta. Si continúas se dará de alta <b>«{query.trim()}»</b> como especie nueva.
                </span>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {isNew && (
              <>
                <Field label="Nombre de la especie">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} className={inputClass} />
                </Field>
                <Field label="Categoría">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}
            {!isNew && selected && (
              <div className="sm:col-span-2 flex items-center gap-3 rounded-xl bg-[#f5f8f4] px-3 py-3">
                <img src={getProductImage(selected.id)} alt="" className="size-11 rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium">{selected.name}</p>
                  <p className="text-xs text-[#829187]">
                    {selected.eiviplantCode} · ficha existente
                  </p>
                </div>
              </div>
            )}
            <Field label="Cantidad (uds.)">
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Ubicación">
              <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass}>
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="Proveedor">
              <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className={inputClass}>
                {SUPPLIERS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Lote / albarán">
              <input value={lot} onChange={(e) => setLot(e.target.value)} placeholder="VL-8841" className={inputClass} />
            </Field>
            <Field label="Coste unitario (€)">
              <input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="4,80" className={inputClass} />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl border border-[#edf0ed] bg-[#f8faf7] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#75917b]">Resumen de la entrada</p>
            <ul className="mt-3 space-y-2 text-sm text-[#4a574d]">
              <li>
                <b>Especie:</b> {speciesName} {isNew ? <span className="text-[#316742]">(nueva)</span> : null}
              </li>
              {isNew && (
                <li>
                  <b>Categoría:</b> {category}
                </li>
              )}
              <li>
                <b>Cantidad:</b> {quantity} uds. → {location}
              </li>
              <li>
                <b>Proveedor:</b> {supplier}
              </li>
              <li>
                <b>Lote:</b> {lot || 'Sin lote'}
              </li>
              <li>
                <b>Coste:</b> {cost ? `${cost} €` : 'Sin indicar'}
              </li>
            </ul>
            <p className="mt-3 text-xs text-[#9aa59c]">Demo: no se guarda en servidor. Sirve para recorrer el flujo de recepción manual.</p>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-[#fde3e0] px-3 py-2 text-sm text-[#c55f58]">{error}</p>}

        <div className="mt-5 flex items-center gap-2">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                setError('')
                setStep((s) => s - 1)
              }}
              className="inline-flex items-center gap-1 rounded-xl border px-4 py-2.5 text-sm font-medium text-[#597360] hover:bg-[#f5f8f4]"
            >
              <ChevronLeft className="size-4" />
              Atrás
            </button>
          )}
          {step < totalSteps ? (
            <button
              type="button"
              onClick={step === 1 ? goNextFromSpecies : goNextFromDetails}
              className="ml-auto inline-flex items-center gap-1 rounded-xl bg-[#316742] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#285a37]"
            >
              Continuar
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={confirm}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#316742] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#285a37]"
            >
              <Leaf className="size-4" />
              Confirmar entrada
            </button>
          )}
        </div>
      </div>

      {suggestion && (
        <div className="fixed inset-0 z-[190] flex items-end justify-center p-4 sm:items-center">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Cerrar" onClick={() => setSuggestion(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#75917b]">Coincidencia encontrada</p>
            <h3 className="mt-2 text-lg font-semibold text-[#1e3d28]">¿No querrás decir «{suggestion.name}»?</h3>
            <p className="mt-2 text-sm text-[#66746a]">
              Has escrito «{query.trim()}» y se parece a una especie que ya está en el catálogo.
            </p>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f5f8f4] p-3">
              <img src={getProductImage(suggestion.id)} alt="" className="size-12 rounded-lg object-cover" />
              <div>
                <p className="text-sm font-medium">{suggestion.name}</p>
                <p className="text-xs text-[#829187]">{suggestion.eiviplantCode}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={acceptSuggestion}
                className="flex-1 rounded-xl bg-[#316742] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#285a37]"
              >
                Sí, es esa
              </button>
              <button
                type="button"
                onClick={rejectSuggestion}
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium text-[#597360] hover:bg-[#f5f8f4]"
              >
                No, es una nueva
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

const inputClass =
  'h-10 w-full rounded-xl border border-[#e3e9e3] bg-white px-3 text-sm outline-none focus:border-[#8bb795]'
