'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Camera,
  Check,
  ChevronLeft,
  ClipboardList,
  FileText,
  Minus,
  Plus,
  Receipt,
  ScanLine,
  Ticket,
  Undo2,
} from 'lucide-react'
import { ReceptionCamera } from '@/components/reception-camera'
import {
  COMPANY_LABELS,
  DOCUMENT_KIND_LABELS,
  DOCUMENT_SAMPLES,
  type CompanyId,
  type DocumentKind,
  type ParseHints,
} from '@/lib/document-catalog'
import { canUseLiveCamera, openNativeCamera } from '@/lib/open-device-camera'
import { parseAlbaranImage } from '@/lib/parse-albaran-image'
import { parseAlbaranPdf, parseAlbaranText, type ParsedAlbaran } from '@/lib/parse-albaran-pdf'

type CaptureMode = 'camera' | 'upload' | 'sample'
type Step = 1 | 2 | 3

type Props = {
  onComplete: (message: string) => void
  onCreateFicha: (productName: string) => void
}

const KIND_OPTIONS: { id: DocumentKind | 'auto'; label: string; hint: string; icon: typeof FileText }[] = [
  { id: 'albaran', label: 'Albarán', hint: 'Mercancía que acaba de llegar', icon: ClipboardList },
  { id: 'factura', label: 'Factura', hint: 'Cobro del vivero o proveedor', icon: Receipt },
  { id: 'pedido', label: 'Pedido', hint: 'Confirmación o pedido-albarán', icon: FileText },
  { id: 'ticket', label: 'Ticket', hint: 'Ticket de compra o TPV', icon: Ticket },
  { id: 'factura_rectificativa', label: 'Rectificativa', hint: 'Abono o corrección de factura', icon: Undo2 },
  { id: 'auto', label: 'No lo sé', hint: 'Que el lector lo detecte solo', icon: ScanLine },
]

const STEPS = ['Tipo', 'Documento', 'Revisión'] as const

const STATUS_STYLE: Record<string, string> = {
  Confirmado: 'bg-[#e3f5e8] text-[#328354]',
  Revisar: 'bg-[#fff0d8] text-[#be761b]',
  'Crear ficha': 'bg-[#ede8f4] text-[#7b6b9e]',
}

export function ReceptionWizard({ onComplete, onCreateFicha }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>(1)
  const [kindHint, setKindHint] = useState<DocumentKind | 'auto' | null>(null)
  const [companyHint, setCompanyHint] = useState<CompanyId>('auto')
  const [captureMode, setCaptureMode] = useState<CaptureMode | null>(null)
  const [sampleId, setSampleId] = useState(DOCUMENT_SAMPLES[0].id)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('Leyendo documento…')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedAlbaran | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const hintsRef = useRef<ParseHints>({ kind: 'auto', company: 'auto' })

  const selectedKind = kindHint ?? 'auto'
  hintsRef.current = { kind: selectedKind, company: companyHint }

  const samples = useMemo(
    () => DOCUMENT_SAMPLES.filter((sample) => selectedKind === 'auto' || sample.kind === selectedKind),
    [selectedKind],
  )
  const activeSample = samples.find((sample) => sample.id === sampleId) ?? samples[0]

  const applyResult = useCallback((result: ParsedAlbaran, label: string) => {
    setParsed(result)
    setFileName(label)
    setStep(3)
    setCameraOpen(false)
    if (result.lines.length === 0) {
      setError('No se detectaron líneas de producto. Vuelve atrás y prueba otro documento o cambia el tipo.')
      return
    }
    setError('')
  }, [])

  const processFile = useCallback(
    async (file: File) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const isImage = file.type.startsWith('image/')
      if (!isPdf && !isImage) {
        setError('Formato no admitido. Usa PDF o una foto JPG/PNG.')
        return
      }

      setLoading(true)
      setLoadingLabel(isPdf ? 'Leyendo PDF…' : 'Leyendo imagen con OCR…')
      setError('')
      try {
        const result = isPdf
          ? await parseAlbaranPdf(await file.arrayBuffer(), hintsRef.current)
          : await parseAlbaranImage(file, hintsRef.current)
        applyResult(result, file.name)
      } catch {
        setError(isPdf ? 'No se pudo leer el PDF.' : 'No se pudo leer la imagen. Mejora la luz o el encuadre.')
        setParsed(null)
      } finally {
        setLoading(false)
      }
    },
    [applyResult],
  )

  const loadSample = useCallback(async () => {
    if (!activeSample) return
    setLoading(true)
    setLoadingLabel('Leyendo PDF de ejemplo…')
    setError('')
    try {
      const response = await fetch(encodeURI(activeSample.file))
      if (!response.ok) throw new Error('fetch')
      const hints: ParseHints = {
        kind: selectedKind,
        company: companyHint === 'auto' ? activeSample.company : companyHint,
      }
      const result = await parseAlbaranPdf(await response.arrayBuffer(), hints)
      applyResult(result, `Ejemplo · ${activeSample.label}`)
    } catch {
      setError('No se pudo cargar el PDF de ejemplo.')
      setParsed(null)
    } finally {
      setLoading(false)
    }
  }, [activeSample, applyResult, companyHint, selectedKind])

  const reparseCurrent = useCallback(() => {
    if (!parsed?.rawText) return
    applyResult(parseAlbaranText(parsed.rawText, hintsRef.current), fileName || 'Documento')
  }, [applyResult, fileName, parsed])

  const setLineQty = useCallback((index: number, value: number) => {
    const qty = Number.isFinite(value) ? Math.round(value) : 0
    setParsed((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        lines: prev.lines.map((line, i) => (i === index ? { ...line, qty } : line)),
      }
    })
  }, [])

  const openCamera = useCallback(() => {
    if (canUseLiveCamera()) {
      setCameraOpen(true)
      return
    }
    openNativeCamera(photoInputRef.current)
  }, [])

  const goToCapture = () => {
    if (!kindHint) return
    setError('')
    setCaptureMode(null)
    setStep(2)
    const first = DOCUMENT_SAMPLES.find((sample) => kindHint === 'auto' || sample.kind === kindHint)
    if (first) setSampleId(first.id)
  }

  const restart = () => {
    setStep(1)
    setCaptureMode(null)
    setParsed(null)
    setError('')
    setFileName('')
    setCompanyHint('auto')
  }

  const confirmable = parsed?.lines.filter((line) => line.status === 'Confirmado').length ?? 0
  const kindLabel = kindHint && kindHint !== 'auto' ? DOCUMENT_KIND_LABELS[kindHint] : 'Detección automática'

  return (
    <section className="overflow-hidden rounded-2xl border border-[#cfe0d2] bg-white">
      <div className="border-b border-[#d8eadb] bg-[#f3f8f3] px-5 py-5 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#316742]">Con documento</p>
        <h2 className="mt-1 text-lg font-semibold text-[#1e3d28]">Leer factura, albarán o ticket</h2>
        <p className="mt-1 text-sm text-[#66746a]">Escanea, sube un PDF o prueba un ejemplo oficial. El lector saca las líneas.</p>
      </div>
      <div className="flex gap-2 border-b border-[#edf0ed] px-5 py-4 sm:px-6">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step
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
            <h2 className="text-lg font-semibold text-[#1e3d28]">¿Qué tipo de documento es?</h2>
            <p className="mt-1 text-sm text-[#66746a]">Elige uno para aplicar la plantilla adecuada. Si no lo tienes claro, usa «No lo sé».</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {KIND_OPTIONS.map((option) => {
                const Icon = option.icon
                const active = kindHint === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setKindHint(option.id)}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      active ? 'border-[#316742] bg-[#edf5ed]' : 'border-[#edf0ed] bg-white hover:border-[#b8d7bd]'
                    }`}
                  >
                    <span className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-[#316742] text-white' : 'bg-[#f0f4f0] text-[#316742]'}`}>
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{option.label}</span>
                      <span className="mt-0.5 block text-xs text-[#829187]">{option.hint}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={!kindHint}
                onClick={goToCapture}
                className="h-10 rounded-xl bg-[#316742] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#1e3d28]">¿Cómo lo leemos?</h2>
                <p className="mt-1 text-sm text-[#66746a]">Elige una sola vía. Los ejemplos oficiales son solo para probar el lector.</p>
              </div>
              <span className="rounded-full bg-[#f0f4f0] px-3 py-1 text-xs text-[#597360]">Tipo: {kindLabel}</span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <ModeCard
                active={captureMode === 'camera'}
                icon={Camera}
                title="Cámara"
                hint="Encuadra el papel o la pantalla"
                onClick={() => {
                  setCaptureMode('camera')
                  setError('')
                }}
              />
              <ModeCard
                active={captureMode === 'upload'}
                icon={FileText}
                title="PDF o foto"
                hint="Sube un archivo real del vivero"
                onClick={() => {
                  setCaptureMode('upload')
                  setError('')
                }}
              />
              <ModeCard
                active={captureMode === 'sample'}
                icon={ScanLine}
                title="Probar ejemplo"
                hint="PDF oficial, solo para demo"
                demo
                onClick={() => {
                  setCaptureMode('sample')
                  setError('')
                }}
              />
            </div>

            {captureMode === 'camera' && (
              <div className="mt-4 rounded-xl border border-[#edf0ed] bg-[#f8faf7] p-4">
                <p className="text-sm text-[#66746a]">Abre la cámara del dispositivo y encuadra la tabla del documento. No hace falta elegir un ejemplo.</p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={openCamera}
                  className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-[#316742] px-4 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Camera className="size-4" />
                  Abrir cámara
                </button>
              </div>
            )}

            {captureMode === 'upload' && (
              <div
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragging(false)
                  const file = event.dataTransfer.files[0]
                  if (file) processFile(file)
                }}
                className={`mt-4 flex min-h-44 flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center ${
                  dragging ? 'border-[#316742] bg-[#edf5ed]' : 'border-[#cbd5cc] bg-[#f8faf7]'
                }`}
              >
                <FileText className="size-8 text-[#85a38b]" />
                <p className="mt-3 text-sm font-medium">{loading ? loadingLabel : 'Arrastra aquí el PDF o la foto'}</p>
                <p className="mt-1 text-xs text-[#9aa59c]">O elige un archivo del dispositivo</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => inputRef.current?.click()}
                    className="rounded-lg border bg-white px-4 py-2 text-xs font-medium text-[#31543a] disabled:opacity-60"
                  >
                    Elegir PDF
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => photoInputRef.current?.click()}
                    className="rounded-lg border bg-white px-4 py-2 text-xs font-medium text-[#31543a] disabled:opacity-60"
                  >
                    Elegir foto
                  </button>
                </div>
              </div>
            )}

            {captureMode === 'sample' && (
              <div className="mt-4 rounded-xl border border-dashed border-[#c5d8c8] bg-[#f5f8f4] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#75917b]">Solo demo</p>
                <p className="mt-1 text-sm text-[#365d40]">Estos PDF viven en la carpeta de documentos oficiales. No es una entrada real.</p>
                {samples.length === 0 ? (
                  <p className="mt-3 text-sm text-[#66746a]">No hay ejemplos de este tipo. Usa cámara o sube un archivo.</p>
                ) : (
                  <>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {samples.map((sample) => {
                        const active = activeSample?.id === sample.id
                        return (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => setSampleId(sample.id)}
                            className={`rounded-xl border px-3 py-2.5 text-left ${
                              active ? 'border-[#316742] bg-white' : 'border-transparent bg-white/70 hover:border-[#b8d7bd]'
                            }`}
                          >
                            <span className="block text-sm font-medium">{sample.label}</span>
                            <span className="block text-xs text-[#829187]">
                              {DOCUMENT_KIND_LABELS[sample.kind]} · {sample.companyLabel}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                    <button
                      type="button"
                      disabled={loading || !activeSample}
                      onClick={loadSample}
                      className="mt-3 inline-flex h-10 items-center rounded-xl bg-[#316742] px-4 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {loading ? loadingLabel : `Leer «${activeSample?.label ?? 'ejemplo'}»`}
                    </button>
                  </>
                )}
              </div>
            )}

            {error && step === 2 && <div className="mt-4 rounded-xl bg-[#fde3e0] p-3 text-xs text-[#c55f58]">{error}</div>}

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setCaptureMode(null)
                  setError('')
                }}
                className="inline-flex h-10 items-center gap-1 text-sm font-medium text-[#597360]"
              >
                <ChevronLeft className="size-4" />
                Cambiar tipo
              </button>
            </div>
          </div>
        )}

        {step === 3 && parsed && (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#1e3d28]">Esto es lo que ha pillado el lector</h2>
                <p className="mt-1 text-sm text-[#66746a]">
                  {fileName || 'Documento'} · {parsed.lines.length} línea{parsed.lines.length === 1 ? '' : 's'}
                </p>
              </div>
              <span className="rounded-full bg-[#e3f5e8] px-3 py-1 text-xs text-[#328354]">
                {parsed.lines.length} detectada{parsed.lines.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#829187]">
              <span className="rounded-full bg-[#e4f1e5] px-2.5 py-1 text-[#316742]">{DOCUMENT_KIND_LABELS[parsed.kind]}</span>
              <span className="rounded-full bg-[#f0f4f0] px-2.5 py-1">{parsed.supplier}</span>
              <span className="rounded-full bg-[#f0f4f0] px-2.5 py-1">Nº {parsed.albaranNumber}</span>
              <span className="rounded-full bg-[#f0f4f0] px-2.5 py-1">{parsed.deliveryDate}</span>
              <span className="rounded-full bg-[#e4f1e5] px-2.5 py-1 text-[#316742]">{parsed.templateLabel}</span>
            </div>

            {error && <div className="mt-4 rounded-xl bg-[#fde3e0] p-3 text-xs text-[#c55f58]">{error}</div>}

            <div className="mt-4 flex flex-col gap-3">
              {parsed.lines.map((line, i) => (
                <div key={`${line.product}-${i}`} className="rounded-xl border border-[#edf0ed] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{line.product}</p>
                      <p className="text-sm text-[#829187]">{parsed.supplier}</p>
                      {line.status === 'Crear ficha' && (
                        <button
                          type="button"
                          onClick={() => onCreateFicha(line.product)}
                          className="mt-2 text-xs font-medium text-[#316742] hover:underline"
                        >
                          Crear ficha a mano
                        </button>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${STATUS_STYLE[line.status]}`}>{line.status}</span>
                      <div className="flex items-center gap-1 rounded-xl border border-[#d7ddd8] bg-[#f8faf7] p-0.5">
                        <button
                          type="button"
                          aria-label={`Restar una unidad de ${line.product}`}
                          onClick={() => setLineQty(i, line.qty - 1)}
                          className="flex size-8 items-center justify-center rounded-lg text-[#31543a] hover:bg-white"
                        >
                          <Minus className="size-3.5" strokeWidth={2.5} />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          aria-label={`Cantidad de ${line.product}`}
                          value={line.qty}
                          onChange={(event) => setLineQty(i, Number(event.target.value))}
                          className="h-8 w-14 border-0 bg-transparent text-center text-sm font-semibold text-[#1e3d28] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          aria-label={`Sumar una unidad de ${line.product}`}
                          onClick={() => setLineQty(i, line.qty + 1)}
                          className="flex size-8 items-center justify-center rounded-lg text-[#31543a] hover:bg-white"
                        >
                          <Plus className="size-3.5" strokeWidth={2.5} />
                        </button>
                      </div>
                      <span className="text-[11px] text-[#829187]">{line.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <details className="mt-4 rounded-xl border border-[#edf0ed] bg-[#fafbfa] px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-[#365d40]">¿No encaja el formato?</summary>
              <p className="mt-2 text-xs text-[#829187]">Cambia tipo o vivero y relee el mismo documento, sin volver a capturarlo.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-medium text-[#597360]">
                  Tipo
                  <select
                    className="mt-1 h-10 w-full rounded-xl border border-[#d7ddd8] bg-white px-3 text-sm text-[#31543a]"
                    value={kindHint ?? 'auto'}
                    onChange={(event) => setKindHint(event.target.value as DocumentKind | 'auto')}
                  >
                    <option value="auto">Auto</option>
                    {(Object.keys(DOCUMENT_KIND_LABELS) as DocumentKind[]).map((kind) => (
                      <option key={kind} value={kind}>
                        {DOCUMENT_KIND_LABELS[kind]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-medium text-[#597360]">
                  Vivero
                  <select
                    className="mt-1 h-10 w-full rounded-xl border border-[#d7ddd8] bg-white px-3 text-sm text-[#31543a]"
                    value={companyHint}
                    onChange={(event) => setCompanyHint(event.target.value as CompanyId)}
                  >
                    <option value="auto">Auto</option>
                    {(Object.keys(COMPANY_LABELS) as Exclude<CompanyId, 'auto'>[]).map((company) => (
                      <option key={company} value={company}>
                        {COMPANY_LABELS[company]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={reparseCurrent}
                className="mt-3 h-10 rounded-xl border bg-white px-4 text-sm font-medium text-[#31543a]"
              >
                Releer con estos datos
              </button>
            </details>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setStep(2)} className="inline-flex h-10 items-center gap-1 text-sm font-medium text-[#597360]">
                  <ChevronLeft className="size-4" />
                  Otro documento
                </button>
                <button type="button" onClick={restart} className="h-10 text-sm font-medium text-[#829187]">
                  Empezar de cero
                </button>
              </div>
              <button
                type="button"
                disabled={confirmable === 0}
                onClick={() =>
                  onComplete(
                    confirmable > 0
                      ? `Recepción confirmada: ${confirmable} línea${confirmable > 1 ? 's' : ''} aplicada${confirmable > 1 ? 's' : ''} al stock`
                      : 'No hay líneas confirmables',
                  )
                }
                className="h-10 rounded-xl bg-[#316742] px-5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar {confirmable > 0 ? `${confirmable} línea${confirmable > 1 ? 's' : ''}` : 'recepción'}
              </button>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) processFile(file)
          event.target.value = ''
        }}
      />
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) processFile(file)
          event.target.value = ''
        }}
      />

      <ReceptionCamera
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onResult={applyResult}
        onError={setError}
        hints={hintsRef.current}
        onNativeFallback={() => openNativeCamera(photoInputRef.current)}
      />
    </section>
  )
}

function ModeCard({
  active,
  icon: Icon,
  title,
  hint,
  demo,
  onClick,
}: {
  active: boolean
  icon: typeof Camera
  title: string
  hint: string
  demo?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-4 text-left transition-colors ${
        active ? 'border-[#316742] bg-[#edf5ed]' : demo ? 'border-dashed border-[#c5d8c8] bg-[#f8faf7] hover:border-[#8bb795]' : 'border-[#edf0ed] hover:border-[#b8d7bd]'
      }`}
    >
      {demo && <span className="mb-2 inline-block rounded-full bg-[#e4f1e5] px-2 py-0.5 text-[10px] font-medium text-[#316742]">Demo</span>}
      <span className={`flex size-9 items-center justify-center rounded-lg ${active ? 'bg-[#316742] text-white' : 'bg-[#f0f4f0] text-[#316742]'}`}>
        <Icon className="size-4" />
      </span>
      <span className="mt-3 block text-sm font-medium">{title}</span>
      <span className="mt-0.5 block text-xs text-[#829187]">{hint}</span>
    </button>
  )
}
