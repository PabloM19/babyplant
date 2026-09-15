'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Lightbulb,
  Play,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import {
  filterHelpContent,
  helpConcepts,
  helpIntro,
  helpTopics,
  tutorialSteps,
  type HelpTopic,
} from '@/lib/help-content'

type HelpCenterProps = {
  open: boolean
  onClose: () => void
  onStartTutorial: () => void
  onOpenTopic: (topic: HelpTopic) => void
  initialTopicId?: string | null
}

type GuidedTourProps = {
  active: boolean
  stepIndex: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  highlightSection: string | null
}

export function HelpCenter({ open, onClose, onStartTutorial, onOpenTopic, initialTopicId }: HelpCenterProps) {
  const [query, setQuery] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [canScrollMore, setCanScrollMore] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedTopicId(null)
      return
    }
    if (initialTopicId) setSelectedTopicId(initialTopicId)
  }, [open, initialTopicId])

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const { overflow: prevHtmlOverflow, overscrollBehavior: prevHtmlOverscroll } = html.style
    const { overflow: prevBodyOverflow, paddingRight: prevPadding } = document.body.style
    const scrollbarWidth = window.innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      html.style.overflow = prevHtmlOverflow
      html.style.overscrollBehavior = prevHtmlOverscroll
      document.body.style.overflow = prevBodyOverflow
      document.body.style.paddingRight = prevPadding
    }
  }, [open])

  const updateScrollHint = () => {
    const el = listRef.current
    if (!el) {
      setCanScrollMore(false)
      return
    }
    setCanScrollMore(el.scrollHeight - el.scrollTop - el.clientHeight > 28)
  }

  useEffect(() => {
    if (!open || selectedTopicId) return
    const id = window.requestAnimationFrame(updateScrollHint)
    return () => window.cancelAnimationFrame(id)
  }, [open, selectedTopicId, query])

  const filtered = useMemo(() => filterHelpContent(query), [query])
  const selectedTopic = helpTopics.find((t) => t.id === selectedTopicId) ?? null

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[160] flex justify-end overscroll-none">
      <button
        type="button"
        aria-label="Cerrar centro de ayuda"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
      />
      <aside
        className="relative flex h-full w-full max-w-[440px] flex-col bg-[#fbfcfa] shadow-2xl"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#e5e9e5] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#75917b]">Soporte</p>
            <h2 className="mt-1 text-lg font-semibold text-[#1e3d28]">{helpIntro.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg border border-[#e3e9e3] bg-white p-2 text-[#597360] hover:bg-[#f5f8f4]"
          >
            <X className="size-4" />
          </button>
        </div>

        {selectedTopic ? (
          <HelpTopicDetail
            topic={selectedTopic}
            onBack={() => setSelectedTopicId(null)}
            onGoToSection={() => onOpenTopic(selectedTopic)}
          />
        ) : (
          <>
            <div className="space-y-4 border-b border-[#e5e9e5] px-5 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar en la ayuda…"
                  aria-label="Buscar en la ayuda"
                  className="h-10 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 text-sm outline-none focus:border-[#8bb795]"
                />
              </div>
              <p className="text-sm leading-relaxed text-[#66746a]">{helpIntro.description}</p>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onStartTutorial()
                }}
                className="flex w-full items-center gap-3 rounded-xl bg-[#316742] px-4 py-3 text-left text-white transition-colors hover:bg-[#285a37]"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-white/15">
                  <Play className="size-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold">Iniciar tutorial guiado</span>
                  <span className="block text-xs text-white/80">Recorrido por todas las secciones del panel</span>
                </span>
                <ChevronRight className="size-4 shrink-0" />
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <div ref={listRef} onScroll={updateScrollHint} className="ep-scroll h-full overflow-y-auto px-5 py-4">
              {!query && (
                <section className="mb-6">
                  <SectionLabel icon={<Lightbulb className="size-3.5" />} label="Conceptos clave" />
                  <div className="mt-3 space-y-2">
                    {helpConcepts.map((c) => (
                      <div key={c.term} className="rounded-xl border border-[#edf0ed] bg-white px-3 py-3">
                        <p className="text-sm font-medium text-[#1e3d28]">{c.term}</p>
                        <p className="mt-1 text-xs leading-relaxed text-[#66746a]">{c.definition}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section className="mb-6">
                <SectionLabel icon={<BookOpen className="size-3.5" />} label={query ? 'Resultados' : 'Módulos del panel'} />
                <div className="mt-3 space-y-2">
                  {filtered.topics.length === 0 ? (
                    <EmptyHelp message="No hay módulos que coincidan con tu búsqueda." />
                  ) : (
                    filtered.topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => setSelectedTopicId(topic.id)}
                        className="flex w-full items-start gap-3 rounded-xl border border-[#edf0ed] bg-white px-3 py-3 text-left transition-colors hover:border-[#b8d7bd] hover:bg-[#f5f8f4]"
                      >
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e4f1e5] text-[#316742]">
                          <CircleHelp className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{topic.title}</span>
                          <span className="mt-0.5 block text-xs text-[#829187]">{topic.summary}</span>
                        </span>
                        <ChevronRight className="mt-1 size-4 shrink-0 text-[#9baa9f]" />
                      </button>
                    ))
                  )}
                </div>
              </section>

              <section className="pb-8">
                <SectionLabel icon={<Sparkles className="size-3.5" />} label="Preguntas frecuentes" />
                <div className="mt-3 space-y-2">
                  {filtered.faqs.length === 0 ? (
                    <EmptyHelp message="No hay preguntas que coincidan con tu búsqueda." />
                  ) : (
                    filtered.faqs.map((faq) => (
                      <details key={faq.id} className="group rounded-xl border border-[#edf0ed] bg-white px-3 py-3">
                        <summary className="cursor-pointer list-none text-sm font-medium text-[#1e3d28] marker:content-none [&::-webkit-details-marker]:hidden">
                          {faq.question}
                        </summary>
                        <p className="mt-2 text-xs leading-relaxed text-[#66746a]">{faq.answer}</p>
                      </details>
                    ))
                  )}
                </div>
              </section>
              </div>
              {canScrollMore && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center bg-gradient-to-t from-[#fbfcfa] via-[#fbfcfa]/90 to-transparent pb-3 pt-10">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#d8eadb] bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[#316742] shadow-sm">
                    Más secciones
                    <ChevronDown className="size-3.5 animate-bounce" />
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>,
    document.body,
  )
}

function HelpTopicDetail({ topic, onBack, onGoToSection }: { topic: HelpTopic; onBack: () => void; onGoToSection: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-[#e5e9e5] px-5 py-4">
        <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#316742]">
          <ArrowLeft className="size-3.5" />
          Volver al índice
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#75917b]">{topic.section}</p>
        <h3 className="mt-1 text-xl font-semibold text-[#1e3d28]">{topic.title}</h3>
        <p className="mt-2 text-sm text-[#66746a]">{topic.summary}</p>
      </div>

      <div className="ep-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-3">
          {topic.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-[#4a574d]">
              {paragraph}
            </p>
          ))}
        </div>

        {topic.tips.length > 0 && (
          <div className="mt-5 rounded-xl border border-[#d8eadb] bg-[#edf5ed] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#316742]">Consejos prácticos</p>
            <ul className="mt-3 space-y-2">
              {topic.tips.map((tip) => (
                <li key={tip} className="flex gap-2 text-sm leading-relaxed text-[#365d40]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#316742]" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-[#e5e9e5] px-5 py-4">
        <button
          type="button"
          onClick={onGoToSection}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#316742] px-4 py-3 text-sm font-medium text-white hover:bg-[#285a37]"
        >
          Ir a {topic.section}
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

export function GuidedTour({ active, stepIndex, onNext, onPrev, onSkip, highlightSection }: GuidedTourProps) {
  const step = tutorialSteps[stepIndex]
  const total = tutorialSteps.length
  const isFirst = stepIndex === 0
  const isLast = stepIndex === total - 1

  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [active])

  if (!active || !step) return null

  return createPortal(
    <>
      {highlightSection ? (
        <TourHighlight section={highlightSection} />
      ) : (
        <div className="fixed inset-0 z-[170] bg-black/45" aria-hidden />
      )}

      <div className="fixed inset-x-0 bottom-0 z-[180] p-4 md:inset-x-auto md:bottom-8 md:left-1/2 md:w-full md:max-w-xl md:-translate-x-1/2">
        <div
          className="rounded-2xl border border-[#dfe6df] bg-white p-5 shadow-2xl"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-title"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#75917b]">
              Tutorial · Paso {stepIndex + 1} de {total}
            </p>
            <button type="button" onClick={onSkip} className="text-xs font-medium text-[#829187] hover:text-[#597360]">
              Salir
            </button>
          </div>

          <div className="mb-4 flex gap-1">
            {tutorialSteps.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? 'bg-[#316742]' : 'bg-[#e3e9e3]'}`}
              />
            ))}
          </div>

          <p id="tour-section" className="text-xs font-medium text-[#316742]">
            {step.section}
          </p>
          <h3 id="tour-title" className="mt-1 text-lg font-semibold text-[#1e3d28]">
            {step.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#66746a]">{step.description}</p>

          <ul className="mt-4 space-y-2">
            {step.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2 text-sm text-[#4a574d]">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#8bb795]" />
                {bullet}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={onPrev}
                className="rounded-xl border border-[#dfe6df] px-4 py-2.5 text-sm font-medium text-[#597360] hover:bg-[#f5f8f4]"
              >
                Anterior
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#316742] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#285a37]"
            >
              {isLast ? 'Finalizar tutorial' : 'Siguiente'}
              {!isLast && <ChevronRight className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

function TourHighlight({ section }: { section: string }) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const update = () => {
      const el = document.querySelector(`[data-tour-nav="${section}"]`)
      if (el) setRect(el.getBoundingClientRect())
      else setRect(null)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    const id = window.setInterval(update, 250)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.clearInterval(id)
    }
  }, [section])

  if (!rect) return null

  const pad = 6
  return (
    <div
      className="pointer-events-none fixed z-[175] rounded-xl ring-2 ring-[#8bb795] ring-offset-2 ring-offset-transparent"
      style={{
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.45)',
      }}
    />
  )
}

function SectionLabel({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#75917b]">
      {icon}
      {label}
    </div>
  )
}

function EmptyHelp({ message }: { message: string }) {
  return <p className="rounded-xl border border-dashed border-[#dfe6df] px-3 py-4 text-center text-xs text-[#829187]">{message}</p>
}
