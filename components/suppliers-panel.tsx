'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ArrowLeft, Mail, Phone, Plus, Trash2, Truck } from 'lucide-react'
import { createEmptySupplier, type Supplier, type SupplierExtraRow } from '@/lib/demo-data'
import { getSupplierImage } from '@/lib/media'

type SupplierCard = Supplier & { references: number }

type SuppliersPanelProps = {
  suppliers: SupplierCard[]
  onNotice: (message: string) => void
}

type ViewMode = 'list' | 'detail' | 'create'

export function SuppliersPanel({ suppliers: initial, onNotice }: SuppliersPanelProps) {
  const [list, setList] = useState<SupplierCard[]>(initial)
  const [view, setView] = useState<ViewMode>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = list.find((s) => s.id === selectedId) ?? null

  const openCreate = () => {
    setSelectedId(null)
    setView('create')
  }

  const openDetail = (id: string) => {
    setSelectedId(id)
    setView('detail')
  }

  const backToList = () => {
    setView('list')
    setSelectedId(null)
  }

  const saveSupplier = (data: Supplier, isNew: boolean) => {
    if (isNew) {
      const created: SupplierCard = { ...data, references: 0 }
      setList((prev) => [created, ...prev])
      onNotice(`Proveedor «${data.name}» creado (demo)`)
      setSelectedId(created.id)
      setView('detail')
      return
    }
    setList((prev) => prev.map((s) => (s.id === data.id ? { ...s, ...data } : s)))
    onNotice(`Ficha de «${data.name}» actualizada (demo)`)
  }

  if (view === 'create' || (view === 'detail' && selected)) {
    return (
      <SupplierDetail
        supplier={view === 'create' ? null : selected}
        references={selected?.references ?? 0}
        onBack={backToList}
        onSave={(data) => saveSupplier(data, view === 'create')}
      />
    )
  }

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#75917b]">Procedencia</p>
          <h1 className="mt-1 text-2xl font-semibold text-[#1e3d28]">Proveedores</h1>
          <p className="mt-1 text-sm text-[#66746a]">Contacto comercial, email de albaranes y datos extra por vivero.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#316742] px-4 text-sm font-medium text-white hover:bg-[#285a37]"
        >
          <Plus className="size-4" />
          Añadir proveedor
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {list.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => openDetail(s.id)}
            className="overflow-hidden rounded-2xl border bg-white text-left transition-shadow hover:shadow-md"
          >
            <div className="relative h-32">
              <img src={getSupplierImage(s.name)} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 flex size-10 items-center justify-center rounded-xl bg-white/95 text-[#316742] shadow-sm">
                <Truck className="size-5" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="mt-1 text-sm text-[#66746a]">
                {s.city} · {s.references} referencia{s.references !== 1 ? 's' : ''}
              </p>
              <p className="mt-2 text-sm text-[#365d40]">{s.contactName || 'Sin contacto comercial'}</p>
              <p className="mt-3 text-xs text-[#9aa59c]">{s.updated}</p>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}

function SupplierDetail({
  supplier,
  references,
  onBack,
  onSave,
}: {
  supplier: SupplierCard | null
  references: number
  onBack: () => void
  onSave: (data: Supplier) => void
}) {
  const isNew = !supplier
  const [form, setForm] = useState<Supplier>(() => supplier ?? createEmptySupplier())
  const [error, setError] = useState('')

  const patch = (partial: Partial<Supplier>) => setForm((f) => ({ ...f, ...partial }))

  const extraRows = useMemo(() => form.extraRows, [form.extraRows])

  const setRow = (id: string, partial: Partial<SupplierExtraRow>) => {
    patch({
      extraRows: form.extraRows.map((row) => (row.id === id ? { ...row, ...partial } : row)),
    })
  }

  const addRow = () => {
    patch({
      extraRows: [...form.extraRows, { id: `row-${Date.now()}`, label: '', value: '' }],
    })
  }

  const removeRow = (id: string) => {
    patch({ extraRows: form.extraRows.filter((row) => row.id !== id) })
  }

  const submit = () => {
    if (!form.name.trim()) {
      setError('Pon un nombre al proveedor.')
      return
    }
    setError('')
    onSave({
      ...form,
      name: form.name.trim(),
      extraRows: form.extraRows.filter((row) => row.label.trim() || row.value.trim()),
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-[#597360] hover:text-[#1e3d28]"
      >
        <ArrowLeft className="size-4" />
        Volver a proveedores
      </button>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="relative h-36">
          <img src={getSupplierImage(form.name)} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
          <div className="absolute bottom-4 left-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
              {isNew ? 'Nuevo proveedor' : `${references} referencias`}
            </p>
            <h1 className="mt-1 text-xl font-semibold">{form.name || 'Sin nombre'}</h1>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2">
          <Field label="Nombre">
            <input value={form.name} onChange={(e) => patch({ name: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Ciudad">
            <input value={form.city} onChange={(e) => patch({ city: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Contacto comercial">
            <input value={form.contactName} onChange={(e) => patch({ contactName: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Teléfono comercial">
            <div className="flex gap-2">
              <input value={form.contactPhone} onChange={(e) => patch({ contactPhone: e.target.value })} className={inputClass} />
              {form.contactPhone ? (
                <a
                  href={`tel:${form.contactPhone.replace(/\s+/g, '')}`}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border text-[#316742] hover:bg-[#f5f8f4]"
                  aria-label="Llamar"
                >
                  <Phone className="size-4" />
                </a>
              ) : null}
            </div>
          </Field>
          <Field label="Email administración (albaranes)">
            <div className="flex gap-2">
              <input value={form.adminEmail} onChange={(e) => patch({ adminEmail: e.target.value })} className={inputClass} />
              {form.adminEmail ? (
                <a
                  href={`mailto:${form.adminEmail}`}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border text-[#316742] hover:bg-[#f5f8f4]"
                  aria-label="Enviar correo"
                >
                  <Mail className="size-4" />
                </a>
              ) : null}
            </div>
          </Field>
          <div className="md:col-span-2">
            <Field label="Notas">
              <textarea
                value={form.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-[#e3e9e3] bg-white px-3 py-2 text-sm outline-none focus:border-[#8bb795]"
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-[#edf0ed] px-5 py-5 sm:px-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Tabla de datos extra</p>
              <p className="text-xs text-[#9aa59c]">Cualquier dato útil a mitad de tarea: entregas, mínimos, formato de albarán…</p>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium text-[#316742] hover:bg-[#f5f8f4]"
            >
              <Plus className="size-3.5" />
              Fila
            </button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#edf0ed]">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="bg-[#f8faf7] text-[11px] font-semibold uppercase tracking-wide text-[#829187]">
                  <th className="px-3 py-2">Concepto</th>
                  <th className="px-3 py-2">Detalle</th>
                  <th className="w-12 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {extraRows.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-4 text-sm text-[#829187]">
                      Sin filas. Añade lo que el equipo necesite consultar.
                    </td>
                  </tr>
                ) : (
                  extraRows.map((row) => (
                    <tr key={row.id} className="border-t border-[#edf0ed]">
                      <td className="px-2 py-2">
                        <input
                          value={row.label}
                          onChange={(e) => setRow(row.id, { label: e.target.value })}
                          placeholder="Día de entrega"
                          className="h-9 w-full rounded-lg border border-transparent bg-transparent px-2 text-sm outline-none focus:border-[#8bb795]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          value={row.value}
                          onChange={(e) => setRow(row.id, { value: e.target.value })}
                          placeholder="Martes 7:30"
                          className="h-9 w-full rounded-lg border border-transparent bg-transparent px-2 text-sm outline-none focus:border-[#8bb795]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <button type="button" onClick={() => removeRow(row.id)} aria-label="Quitar fila" className="rounded-lg p-1.5 text-[#9aa59c] hover:bg-[#fde3e0] hover:text-[#c55f58]">
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error ? <p className="mx-5 mb-2 rounded-xl bg-[#fde3e0] px-3 py-2 text-sm text-[#c55f58] sm:mx-6">{error}</p> : null}

        <div className="flex justify-end gap-2 border-t border-[#edf0ed] px-5 py-4 sm:px-6">
          <button type="button" onClick={onBack} className="rounded-xl border px-4 py-2.5 text-sm font-medium text-[#597360] hover:bg-[#f5f8f4]">
            Cancelar
          </button>
          <button type="button" onClick={submit} className="rounded-xl bg-[#316742] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#285a37]">
            {isNew ? 'Crear proveedor' : 'Guardar ficha'}
          </button>
        </div>
      </div>
    </>
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

const inputClass = 'h-10 w-full rounded-xl border border-[#e3e9e3] bg-white px-3 text-sm outline-none focus:border-[#8bb795]'
