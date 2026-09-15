'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Check, CircleAlert, Info, Trash2, TriangleAlert, X } from 'lucide-react'
import { DEMO_NOTIFICATIONS, LEVEL_META, type AppNotification } from '@/lib/notifications'

type NotificationsPanelProps = {
  onOpen: (section: string) => void
}

export function NotificationsPanel({ onOpen }: NotificationsPanelProps) {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [items, setItems] = useState<AppNotification[]>(() => DEMO_NOTIFICATIONS.map((n) => ({ ...n })))
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (isMobile) return
      const target = e.target as Node
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, isMobile])

  useEffect(() => {
    if (!open || !isMobile) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open, isMobile])

  const unreadCount = useMemo(() => items.filter((n) => n.unread).length, [items])
  const badge = unreadCount > 9 ? '9+' : String(unreadCount)

  const markSeen = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  const markAllSeen = () => {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  const openItem = (item: AppNotification) => {
    setOpen(false)
    onOpen(item.section)
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
        className="relative flex size-11 touch-manipulation items-center justify-center rounded-xl border bg-white active:bg-[#f0f4f0] md:size-auto md:border-0 md:p-2 md:hover:bg-[#f5f8f4]"
      >
        <Bell className={`size-[18px] ${unreadCount > 0 ? 'text-[#316742]' : 'text-[#829187]'}`} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c55f58] px-1 text-[9px] font-semibold leading-none text-white md:right-0.5 md:top-0.5">
            {badge}
          </span>
        )}
      </button>

      {open &&
        (isMobile ? (
          createPortal(
            <div className="fixed inset-0 z-[200] md:hidden">
              <button type="button" aria-label="Cerrar notificaciones" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
              <div
                ref={panelRef}
                role="dialog"
                aria-label="Notificaciones"
                className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-hidden rounded-t-3xl bg-white shadow-2xl"
                style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
              >
                <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-[#dfe6df]" />
                <NotificationList
                  items={items}
                  unreadCount={unreadCount}
                  onClose={() => setOpen(false)}
                  onMarkAll={markAllSeen}
                  onOpenItem={openItem}
                  onSeen={markSeen}
                  onRemove={removeItem}
                  mobile
                />
              </div>
            </div>,
            document.body,
          )
        ) : (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notificaciones"
            className="absolute right-0 top-[calc(100%+10px)] z-[80] hidden w-[380px] overflow-hidden rounded-2xl border border-[#e5e9e5] bg-white shadow-2xl md:block"
          >
            <span className="absolute -top-1.5 right-[14px] size-3 rotate-45 border-l border-t border-[#e5e9e5] bg-white" />
            <NotificationList
              items={items}
              unreadCount={unreadCount}
              onClose={() => setOpen(false)}
              onMarkAll={markAllSeen}
              onOpenItem={openItem}
              onSeen={markSeen}
              onRemove={removeItem}
            />
          </div>
        ))}
    </div>
  )
}

function NotificationList({
  items,
  unreadCount,
  onClose,
  onMarkAll,
  onOpenItem,
  onSeen,
  onRemove,
  mobile,
}: {
  items: AppNotification[]
  unreadCount: number
  onClose: () => void
  onMarkAll: () => void
  onOpenItem: (item: AppNotification) => void
  onSeen: (id: string) => void
  onRemove: (id: string) => void
  mobile?: boolean
}) {
  return (
    <>
      <div className={`flex items-center justify-between gap-3 border-b border-[#edf0ed] px-4 ${mobile ? 'pt-3 pb-3' : 'py-3'}`}>
        <div>
          <p className="text-sm font-semibold text-[#1e3d28]">Notificaciones</p>
          <p className="text-[11px] text-[#829187]">{unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}</p>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button type="button" onClick={onMarkAll} className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--ep-primary)] hover:bg-[#f5f8f4]">
              Marcar leídas
            </button>
          )}
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1.5 text-[#829187] hover:bg-[#f5f8f4]">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className={mobile ? 'ep-scroll max-h-[68vh] overflow-y-auto' : 'ep-scroll max-h-[420px] overflow-y-auto'}>
        {items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[#829187]">No hay avisos por ahora. Recarga para volver a las 5 de prueba.</p>
        ) : (
          items.map((item) => (
            <NotificationRow key={item.id} item={item} onOpen={() => onOpenItem(item)} onSeen={() => onSeen(item.id)} onRemove={() => onRemove(item.id)} />
          ))
        )}
      </div>
    </>
  )
}

function NotificationRow({
  item,
  onOpen,
  onSeen,
  onRemove,
}: {
  item: AppNotification
  onOpen: () => void
  onSeen: () => void
  onRemove: () => void
}) {
  const meta = LEVEL_META[item.level]
  const Icon = item.level === 'critical' ? CircleAlert : item.level === 'warning' ? TriangleAlert : Info

  return (
    <div className={`relative border-b border-[#f0f3f0] px-4 py-3.5 last:border-0 ${item.unread ? 'bg-[#fbfcfa]' : 'bg-white'}`}>
      <span className={`absolute inset-y-3 left-1.5 w-1 rounded-full ${meta.bar}`} />
      <div className="flex gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${meta.iconBg} ${meta.iconText}`}>
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="w-full text-left">
            <span className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-[#213529]">{item.title}</span>
              {item.unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[#c55f58]" />}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-[#66746a]">{item.detail}</span>
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.chip}`}>{meta.label}</span>
            <span className="text-[11px] text-[#9aa59c]">{item.time}</span>
            {item.unread ? (
              <button
                type="button"
                onClick={onSeen}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[#d8eadb] bg-white px-2 py-1 text-[11px] font-medium text-[#316742] hover:bg-[#edf5ed]"
              >
                <Check className="size-3" strokeWidth={2.5} />
                Visto
              </button>
            ) : (
              <button
                type="button"
                onClick={onRemove}
                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[#ebcbc8] bg-white px-2 py-1 text-[11px] font-medium text-[#c55f58] hover:bg-[#fde3e0]"
              >
                <Trash2 className="size-3" />
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
