'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  CircleOff,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useAppPreferences } from '@/components/app-preferences-provider'
import {
  createEmptyUser,
  defaultPermissionsForRole,
  PERMISSION_OPTIONS,
  slugUsername,
  USER_ROLES,
  userInitials,
  type AppUser,
  type UserRole,
  type UserStatus,
} from '@/lib/app-users'

type UsersPanelProps = {
  onNotice: (message: string) => void
}

type ViewMode = 'list' | 'detail' | 'create'

export function UsersPanel({ onNotice }: UsersPanelProps) {
  const { users, createUser, updateUser, setUserStatus, deleteUser } = useAppPreferences()
  const [view, setView] = useState<ViewMode>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'Todos' | UserRole>('Todos')
  const [statusFilter, setStatusFilter] = useState<'Todos' | UserStatus>('Todos')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const selected = users.find((u) => u.id === selectedId) ?? null

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const text = `${u.displayName} ${u.username} ${u.email} ${u.role} ${u.department}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesRole = roleFilter === 'Todos' || u.role === roleFilter
      const matchesStatus = statusFilter === 'Todos' || u.status === statusFilter
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [users, query, roleFilter, statusFilter])

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.status === 'active').length,
      inactive: users.filter((u) => u.status === 'inactive').length,
    }),
    [users],
  )

  const openCreate = () => {
    setSelectedId(null)
    setView('create')
  }

  const openDetail = (id: string) => {
    setSelectedId(id)
    setView('detail')
    setMenuOpen(null)
  }

  const backToList = () => {
    setView('list')
    setSelectedId(null)
  }

  if (view === 'detail' && selected) {
    return (
      <UserDetail
        user={selected}
        onBack={backToList}
        onSave={(patch) => {
          updateUser(selected.id, patch)
          onNotice(`Usuario ${patch.displayName ?? selected.displayName} actualizado`)
        }}
        onToggleStatus={() => {
          const next = selected.status === 'active' ? 'inactive' : 'active'
          setUserStatus(selected.id, next)
          onNotice(next === 'active' ? 'Usuario reactivado' : 'Usuario desactivado')
        }}
        onDelete={() => {
          if (!window.confirm(`¿Eliminar definitivamente a ${selected.displayName}?`)) return
          deleteUser(selected.id)
          onNotice('Usuario eliminado')
          backToList()
        }}
      />
    )
  }

  if (view === 'create') {
    return (
      <UserDetail
        user={null}
        onBack={backToList}
        onSave={(data) => {
          const created = createUser(data)
          onNotice(`Usuario ${created.displayName} creado`)
          openDetail(created.id)
        }}
      />
    )
  }

  return (
    <>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-[#84a08a]">Administración</p>
          <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-[#213529]">Usuarios</h1>
          <p className="mt-1 text-sm text-[#829187]">
            Crea y gestiona cuentas del panel: almacén, ventas, planta exterior y recepción.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--ep-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--ep-primary-hover)]"
        >
          <Plus className="size-4" />
          Nuevo usuario
        </button>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="Total" value={String(stats.total)} />
        <StatCard label="Activos" value={String(stats.active)} tone="ok" />
        <StatCard label="Inactivos" value={String(stats.inactive)} tone="muted" />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 sm:max-w-[340px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9baa9f]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, usuario o departamento…"
            aria-label="Buscar usuarios"
            className="h-10 w-full rounded-xl border border-[#e3e9e3] bg-white pl-10 text-sm outline-none focus:border-[#8bb795]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="h-10 rounded-xl border bg-white px-3 text-sm outline-none"
          aria-label="Filtrar por rol"
        >
          <option value="Todos">Todos los roles</option>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <div className="flex gap-1 rounded-xl bg-[#f0f4f0] p-1 text-xs font-medium text-[#7f8e83]">
          {(['Todos', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s === 'Todos' ? 'Todos' : s)}
              className={`rounded-lg px-3 py-2 capitalize ${statusFilter === s ? 'bg-white text-[#31543a] shadow-sm' : ''}`}
            >
              {s === 'Todos' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="hidden border-b bg-[#f8faf7] px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#829187] md:grid md:grid-cols-[minmax(220px,1.4fr)_120px_140px_120px_48px] md:gap-3">
          <span>Usuario</span>
          <span>Rol</span>
          <span>Departamento</span>
          <span>Estado</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#829187]">No hay usuarios que coincidan con los filtros.</p>
        ) : (
          filtered.map((user) => (
            <div
              key={user.id}
              className="border-b border-[#edf0ed] last:border-0 md:grid md:grid-cols-[minmax(220px,1.4fr)_120px_140px_120px_48px] md:items-center md:gap-3"
            >
              <button
                type="button"
                onClick={() => openDetail(user.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#f5f8f4] md:col-span-4 md:grid md:grid-cols-[minmax(220px,1.4fr)_120px_140px_120px] md:items-center md:gap-3 md:py-3"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--ep-accent-soft)] text-sm font-semibold text-[var(--ep-primary)]">
                    {userInitials(user)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{user.displayName}</span>
                    <span className="block truncate text-xs text-[#829187]">
                      @{user.username} · {user.email}
                    </span>
                  </span>
                </span>
                <span className="hidden text-sm text-[#66746a] md:block">{user.role}</span>
                <span className="hidden truncate text-sm text-[#66746a] md:block">{user.department}</span>
                <span className="hidden md:block">
                  <StatusBadge status={user.status} />
                </span>
              </button>

              <div className="relative flex justify-end px-5 pb-4 md:px-2 md:py-0">
                <div className="flex items-center gap-2 md:hidden">
                  <StatusBadge status={user.status} />
                  <span className="text-xs text-[#829187]">{user.role}</span>
                </div>
                <button
                  type="button"
                  aria-label={`Opciones de ${user.displayName}`}
                  onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                  className="ml-auto rounded-lg p-1.5 hover:bg-[#f0f4f0] md:ml-0"
                >
                  <MoreHorizontal className="size-5 text-[#9baa9f]" />
                </button>
                {menuOpen === user.id && (
                  <div className="absolute right-5 top-full z-10 w-44 overflow-hidden rounded-xl border bg-white py-1 shadow-xl md:right-0">
                    <MenuAction label="Ver detalle" onClick={() => openDetail(user.id)} />
                    <MenuAction
                      label={user.status === 'active' ? 'Desactivar' : 'Activar'}
                      onClick={() => {
                        setUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')
                        setMenuOpen(null)
                        onNotice(user.status === 'active' ? 'Usuario desactivado' : 'Usuario reactivado')
                      }}
                    />
                    <MenuAction
                      label="Eliminar"
                      tone="danger"
                      onClick={() => {
                        if (!window.confirm(`¿Eliminar a ${user.displayName}?`)) return
                        deleteUser(user.id)
                        setMenuOpen(null)
                        onNotice('Usuario eliminado')
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

function UserDetail({
  user,
  onBack,
  onSave,
  onToggleStatus,
  onDelete,
}: {
  user: AppUser | null
  onBack: () => void
  onSave: (data: Omit<AppUser, 'id' | 'createdAt' | 'lastAccess'>) => void
  onToggleStatus?: () => void
  onDelete?: () => void
}) {
  const isNew = !user
  const [draft, setDraft] = useState<Omit<AppUser, 'id' | 'createdAt' | 'lastAccess'>>(
    user ?? { ...createEmptyUser(), displayName: 'Usuario ', department: '' },
  )
  const [error, setError] = useState('')

  const setRole = (role: UserRole) => {
    setDraft((d) => ({
      ...d,
      role,
      permissions: defaultPermissionsForRole(role),
    }))
  }

  const togglePermission = (perm: string) => {
    setDraft((d) => ({
      ...d,
      permissions: d.permissions.includes(perm) ? d.permissions.filter((p) => p !== perm) : [...d.permissions, perm],
    }))
  }

  const submit = () => {
    if (!draft.displayName.trim()) {
      setError('El nombre del usuario es obligatorio.')
      return
    }
    if (!draft.username.trim()) {
      setError('El nombre de usuario es obligatorio.')
      return
    }
    if (!draft.email.trim()) {
      setError('El correo electrónico es obligatorio.')
      return
    }
    setError('')
    onSave({
      ...draft,
      displayName: draft.displayName.trim(),
      username: draft.username.trim().toLowerCase(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      department: draft.department.trim() || 'Sin asignar',
    })
  }

  return (
    <>
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--ep-primary)]">
        <ArrowLeft className="size-4" />
        Volver al listado
      </button>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--ep-accent-soft)] text-lg font-semibold text-[var(--ep-primary)]">
            {draft.displayName ? userInitials({ displayName: draft.displayName }) : <UserRound className="size-6" />}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#84a08a]">
              {isNew ? 'Alta de usuario' : 'Ficha de usuario'}
            </p>
            <h1 className="text-2xl font-semibold text-[#213529]">{isNew ? 'Nuevo usuario' : user!.displayName}</h1>
            {!isNew && (
              <p className="mt-1 text-sm text-[#829187]">
                Último acceso: {user!.lastAccess} · Alta: {user!.createdAt}
              </p>
            )}
          </div>
        </div>
        {!isNew && user && <StatusBadge status={user.status} large />}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Datos de la cuenta</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre visible"
              value={draft.displayName}
              onChange={(v) => setDraft({ ...draft, displayName: v })}
              placeholder="Usuario Almacén"
            />
            <FormField
              label="Nombre de usuario"
              value={draft.username}
              onChange={(v) => setDraft({ ...draft, username: v })}
              placeholder="almacen"
              hint={
                draft.displayName && !draft.username
                  ? `Sugerido: ${slugUsername(draft.displayName)}`
                  : undefined
              }
            />
            <FormField label="Correo" value={draft.email} onChange={(v) => setDraft({ ...draft, email: v })} type="email" />
            <FormField label="Teléfono" value={draft.phone} onChange={(v) => setDraft({ ...draft, phone: v })} />
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Rol</span>
              <select
                value={draft.role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-2 h-10 w-full rounded-xl border bg-white px-3 outline-none focus:border-[var(--ep-primary)]"
              >
                {USER_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <FormField
              label="Departamento / zona"
              value={draft.department}
              onChange={(v) => setDraft({ ...draft, department: v })}
              placeholder="Invernadero A, Almacén principal…"
              className="sm:col-span-2"
            />
            {!isNew && (
              <label className="block text-sm sm:col-span-2">
                <span className="font-medium">Estado</span>
                <select
                  value={draft.status}
                  onChange={(e) => setDraft({ ...draft, status: e.target.value as UserStatus })}
                  className="mt-2 h-10 w-full rounded-xl border bg-white px-3 outline-none"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </label>
            )}
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Notas internas</span>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                rows={3}
                className="mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[var(--ep-primary)]"
                placeholder="Turno, responsabilidades, observaciones…"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-[var(--ep-primary)]" />
            <h2 className="font-semibold">Permisos</h2>
          </div>
          <p className="mt-2 text-xs text-[#829187]">Ajusta qué puede hacer este usuario en el panel.</p>
          <div className="mt-4 space-y-2">
            {PERMISSION_OPTIONS.map((perm) => (
              <label key={perm} className="flex cursor-pointer items-center justify-between rounded-xl border border-[#edf0ed] px-3 py-2.5 text-sm">
                <span>{perm}</span>
                <input
                  type="checkbox"
                  checked={draft.permissions.includes(perm)}
                  onChange={() => togglePermission(perm)}
                  className="size-4 accent-[var(--ep-primary)]"
                />
              </label>
            ))}
          </div>
        </section>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-[#c55f58]/30 bg-[#fde3e0] px-4 py-3 text-sm text-[#9e4a44]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--ep-primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--ep-primary-hover)]"
        >
          <CheckCircle2 className="size-4" />
          {isNew ? 'Crear usuario' : 'Guardar cambios'}
        </button>
        {!isNew && onToggleStatus && (
          <button
            type="button"
            onClick={onToggleStatus}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium text-[#597360] hover:bg-[#f5f8f4]"
          >
            <CircleOff className="size-4" />
            {user!.status === 'active' ? 'Desactivar' : 'Reactivar'}
          </button>
        )}
        {!isNew && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ebcbc8] px-4 py-2.5 text-sm font-medium text-[#c55f58] hover:bg-[#fde3e0]"
          >
            <Trash2 className="size-4" />
            Eliminar
          </button>
        )}
      </div>
    </>
  )
}

function StatCard({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'ok' | 'muted' }) {
  const toneClass =
    tone === 'ok' ? 'text-[#316742]' : tone === 'muted' ? 'text-[#829187]' : 'text-[#213529]'
  return (
    <div className="rounded-2xl border bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#829187]">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status, large }: { status: UserStatus; large?: boolean }) {
  const active = status === 'active'
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${large ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'} ${
        active ? 'bg-[#e3f5e8] text-[#328354]' : 'bg-[#edf0ed] text-[#66746a]'
      }`}
    >
      {active ? 'Activo' : 'Inactivo'}
    </span>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  hint,
  className = '',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  hint?: string
  className?: string
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-10 w-full rounded-xl border px-3 outline-none focus:border-[var(--ep-primary)]"
      />
      {hint && <span className="mt-1 block text-xs text-[#9aa59c]">{hint}</span>}
    </label>
  )
}

function MenuAction({
  label,
  onClick,
  tone = 'default',
}: {
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#f5f8f4] ${tone === 'danger' ? 'text-[#c55f58]' : 'text-[#253129]'}`}
    >
      {label}
    </button>
  )
}
