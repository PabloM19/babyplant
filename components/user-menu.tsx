'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, KeyRound, LogOut, Settings, UserRound, X } from 'lucide-react'
import { useAppPreferences } from '@/components/app-preferences-provider'
import { getInitials } from '@/lib/app-preferences'

type UserMenuProps = {
  onOpenSettings: () => void
  onNotice: (message: string) => void
}

export function UserMenu({ onOpenSettings, onNotice }: UserMenuProps) {
  const { profile, logout } = useAppPreferences()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const desktopTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const desktopMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      const inside =
        mobileTriggerRef.current?.contains(target) ||
        desktopTriggerRef.current?.contains(target) ||
        mobileMenuRef.current?.contains(target) ||
        desktopMenuRef.current?.contains(target)
      if (!inside) setOpen(false)
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
  }, [open])

  const initials = getInitials(profile.displayName)

  return (
    <>
      <div className="relative md:hidden">
        <button
          ref={mobileTriggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menú de usuario"
          className="flex size-11 items-center justify-center rounded-xl border bg-white active:bg-[#f0f4f0]"
        >
          <span className="text-sm font-semibold text-[var(--ep-primary)]">{initials}</span>
        </button>
        {open && (
          <div
            ref={mobileMenuRef}
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-[#e5e9e5] bg-white py-1 shadow-xl"
          >
            <UserDropdownItems
              profile={profile}
              onProfile={() => {
                setOpen(false)
                setProfileOpen(true)
              }}
              onSettings={() => {
                setOpen(false)
                onOpenSettings()
              }}
              onLogout={() => {
                setOpen(false)
                logout()
                onNotice('Sesión cerrada correctamente')
              }}
            />
          </div>
        )}
      </div>

      <div className="relative hidden md:block">
        <button
          ref={desktopTriggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-[#e3e9e3] hover:bg-[#f5f8f4]"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-[var(--ep-accent-soft)] text-sm font-semibold text-[var(--ep-primary)]">
            {initials}
          </div>
          <div className="hidden text-left lg:block">
            <p className="text-[13px] font-medium">{profile.displayName}</p>
            <p className="text-[11px] text-[#8a998e]">{profile.role}</p>
          </div>
          <ChevronDown className={`size-4 text-[#96a39a] transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            ref={desktopMenuRef}
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-[#e5e9e5] bg-white py-1 shadow-xl"
          >
            <UserDropdownItems
              profile={profile}
              onProfile={() => {
                setOpen(false)
                setProfileOpen(true)
              }}
              onSettings={() => {
                setOpen(false)
                onOpenSettings()
              }}
              onLogout={() => {
                setOpen(false)
                logout()
                onNotice('Sesión cerrada correctamente')
              }}
            />
          </div>
        )}
      </div>

      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} onNotice={onNotice} />
    </>
  )
}

function UserDropdownItems({
  profile,
  onProfile,
  onSettings,
  onLogout,
}: {
  profile: { displayName: string; email: string }
  onProfile: () => void
  onSettings: () => void
  onLogout: () => void
}) {
  return (
    <>
      <div className="border-b border-[#edf0ed] px-4 py-3">
        <p className="text-sm font-medium">{profile.displayName}</p>
        <p className="text-xs text-[#829187]">{profile.email}</p>
      </div>
      <MenuButton icon={UserRound} label="Ver perfil" onClick={onProfile} />
      <MenuButton icon={Settings} label="Configuración" onClick={onSettings} />
      <div className="my-1 border-t border-[#edf0ed]" />
      <MenuButton icon={LogOut} label="Cerrar sesión" tone="danger" onClick={onLogout} />
    </>
  )
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: typeof UserRound
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#f5f8f4] ${tone === 'danger' ? 'text-[#c55f58]' : 'text-[#253129]'}`}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </button>
  )
}

function ProfilePanel({ open, onClose, onNotice }: { open: boolean; onClose: () => void; onNotice: (m: string) => void }) {
  const { profile, saveProfileChanges } = useAppPreferences()
  const [tab, setTab] = useState<'profile' | 'security' | 'prefs'>('profile')
  const [draft, setDraft] = useState(profile)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (open) {
      setDraft(profile)
      setTab('profile')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }, [open, profile])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const saveProfile = () => {
    saveProfileChanges(draft)
    onNotice('Perfil actualizado correctamente')
    onClose()
  }

  const savePassword = () => {
    if (!currentPassword || !newPassword) {
      onNotice('Completa la contraseña actual y la nueva')
      return
    }
    if (newPassword.length < 8) {
      onNotice('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      onNotice('Las contraseñas no coinciden')
      return
    }
    onNotice('Contraseña actualizada (demo)')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return createPortal(
    <div className="fixed inset-0 z-[190] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" aria-label="Cerrar perfil" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-[var(--ep-accent-soft)] text-base font-semibold text-[var(--ep-primary)]">
              {getInitials(draft.displayName)}
            </div>
            <div>
              <h2 className="text-lg font-semibold">Mi perfil</h2>
              <p className="text-sm text-[#829187]">{draft.role}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg border p-2 text-[#829187] hover:bg-[#f5f8f4]">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex gap-1 border-b px-5 py-2">
          {[
            ['profile', 'Datos personales'],
            ['security', 'Seguridad'],
            ['prefs', 'Preferencias rápidas'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id as typeof tab)}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${tab === id ? 'bg-[var(--ep-accent-soft)] text-[var(--ep-primary)]' : 'text-[#829187] hover:bg-[#f5f8f4]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {tab === 'profile' && (
            <div className="space-y-4">
              <Field label="Nombre completo" value={draft.displayName} onChange={(v) => setDraft({ ...draft, displayName: v })} />
              <Field label="Nombre de usuario" value={draft.username} onChange={(v) => setDraft({ ...draft, username: v })} />
              <Field label="Correo electrónico" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} type="email" />
              <Field label="Teléfono" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
              <div>
                <p className="text-sm font-medium">Rol en el panel</p>
                <p className="mt-2 rounded-xl border bg-[#f5f8f4] px-3 py-2.5 text-sm text-[#66746a]">{draft.role}</p>
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-4">
              <p className="text-sm text-[#66746a]">Cambia tu contraseña de acceso al panel. En producción se validará contra el servidor de Eiviplant.</p>
              <Field label="Contraseña actual" value={currentPassword} onChange={setCurrentPassword} type="password" />
              <Field label="Nueva contraseña" value={newPassword} onChange={setNewPassword} type="password" />
              <Field label="Confirmar contraseña" value={confirmPassword} onChange={setConfirmPassword} type="password" />
              <button type="button" onClick={savePassword} className="inline-flex items-center gap-2 rounded-xl bg-[var(--ep-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--ep-primary-hover)]">
                <KeyRound className="size-4" />
                Actualizar contraseña
              </button>
            </div>
          )}

          {tab === 'prefs' && <QuickPrefs onNotice={onNotice} />}
        </div>

        {tab === 'profile' && (
          <div className="border-t px-5 py-4">
            <button type="button" onClick={saveProfile} className="w-full rounded-xl bg-[var(--ep-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--ep-primary-hover)]">
              Guardar perfil
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

function QuickPrefs({ onNotice }: { onNotice: (m: string) => void }) {
  const { preferences, updatePreferences } = useAppPreferences()

  return (
    <div className="space-y-4">
      <Toggle label="Avisos de stock bajo" checked={preferences.lowStockAlerts} onChange={(v) => updatePreferences({ lowStockAlerts: v })} />
      <Toggle label="Recordatorio de mermas" checked={preferences.mermaReminders} onChange={(v) => updatePreferences({ mermaReminders: v })} />
      <Toggle label="Animaciones de interfaz" checked={preferences.animateTransitions} onChange={(v) => updatePreferences({ animateTransitions: v })} />
      <Toggle label="Mostrar fotos de producto" checked={preferences.showProductPhotos} onChange={(v) => updatePreferences({ showProductPhotos: v })} />
      <p className="text-xs text-[#9aa59c]">Los cambios se aplican al instante. Más opciones en Configuración.</p>
      <button type="button" onClick={() => onNotice('Preferencias guardadas')} className="text-sm font-medium text-[var(--ep-primary)]">
        Guardado automático activo
      </button>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-10 w-full rounded-xl border px-3 outline-none focus:border-[var(--ep-primary)]"
      />
    </label>
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
