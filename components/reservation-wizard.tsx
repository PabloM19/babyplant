'use client'

import { useMemo, useState } from 'react'
import { Bookmark, Search, X } from 'lucide-react'
import { products, stockTotals, type Product, type Reservation } from '@/lib/demo-data'
import { getProductImage } from '@/lib/media'

type ReservationWizardProps = {
  open: boolean
  onClose: () => void
  onCreate: (reservation: Reservation) => void
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function defaultDate() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

function formatVence(iso: string) {
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return 'Vence —'
  return `Vence ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function ReservationWizard({ open, onClose, onCreate }: ReservationWizardProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState('4')
  const [client, setClient] = useState('')
  const [expires, setExpires] = useState(defaultDate)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? products.filter((p) => `${p.name} ${p.eiviplantCode}`.toLowerCase().includes(q))
      : products
    return list.slice(0, 6)
  }, [query])

  const available = selected ? stockTotals(selected).available : 0

  const reset = () => {
    setQuery('')
    setSelected(null)
    setQuantity('4')
    setClient('')
    setExpires(defaultDate())
    setNotes('')
    setError('')
  }

  const close = () => {
    reset()
    onClose()
  }

  const confirm = () => {
    if (!selected) {
      setError('Elige un producto del catálogo.')
      return
    }
    const qty = Number(quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Indica una cantidad válida.')
      return
    }
    if (qty > available) {
      setError(`Solo hay ${available} uds. disponibles de «${selected.name}».`)
      return
    }
    if (!client.trim()) {
      setError('Pon el nombre del cliente.')
      return
    }

    onCreate({
      id: `r-${Date.now()}`,
      product: selected.name,
      quantity: qty,
      client: client.trim(),
      date: formatVence(expires),
      status: 'Activa',
      notes: notes.trim() || 'Reserva creada desde el panel (demo)',
    })
    reset()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[190] flex items-end justify-center p-4 sm:items-center">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Cerrar" onClick={close} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#edf0ed] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#75917b]">Compromiso</p>
            <h2 className="mt-1 text-lg font-semibold text-[#1e3d28]">Nueva reserva</h2>
          </div>
          <button type="button" onClick={close} aria-label="Cerrar" className="rounded-lg p-1.5 text-[#829187] hover:bg-[#f5f8f4]">
            <X className="size-4" />
          </button>
        </div>

        <div className="ep-scroll max-h-[75vh] overflow-y-auto px-5 py-5">
          <label className="text-sm font-medium">Producto</label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
            <input
              value={selected?.name ?? query}
              onChange={(e) => {
                setSelected(null)
                setQuery(e.target.value)
                setError('')
              }}
              placeholder="Busca por nombre o código…"
              className="h-11 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#8bb795]"
            />
          </div>

          {!selected && (
            <div className="mt-3 grid gap-2">
              {matches.map((p) => {
                const avail = stockTotals(p).available
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelected(p)
                      setQuery(p.name)
                      setError('')
                    }}
                    className="flex items-center gap-3 rounded-xl border border-[#edf0ed] px-3 py-2.5 text-left hover:border-[#b8d7bd]"
                  >
                    <img src={getProductImage(p.id)} alt="" className="size-10 rounded-lg object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.name}</span>
                      <span className="block text-xs text-[#829187]">{p.eiviplantCode}</span>
                    </span>
                    <span className="text-xs font-medium text-[#316742]">{avail} disp.</span>
                  </button>
                )
              })}
            </div>
          )}

          {selected && (
            <p className="mt-2 text-xs text-[#829187]">
              {selected.eiviplantCode} · {available} uds. disponibles
            </p>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Cantidad (uds.)</span>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Vence</span>
              <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Cliente</span>
              <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="María Torres" className={inputClass} />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Notas</span>
              <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Recogida en tienda" className={inputClass} />
            </label>
          </div>

          {error ? <p className="mt-4 rounded-xl bg-[#fde3e0] px-3 py-2 text-sm text-[#c55f58]">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#edf0ed] px-5 py-4">
          <button type="button" onClick={close} className="rounded-xl border px-4 py-2.5 text-sm font-medium text-[#597360] hover:bg-[#f5f8f4]">
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirm}
            className="inline-flex items-center gap-2 rounded-xl bg-[#316742] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#285a37]"
          >
            <Bookmark className="size-4" />
            Crear reserva
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass = 'mt-2 h-10 w-full rounded-xl border border-[#e3e9e3] bg-white px-3 text-sm outline-none focus:border-[#8bb795]'
