import { getInitials } from '@/lib/app-preferences'

export type UserRole = 'Administrador' | 'Almacén' | 'Ventas' | 'Planta exterior' | 'Recepción'
export type UserStatus = 'active' | 'inactive'

export type AppUser = {
  id: string
  displayName: string
  username: string
  email: string
  phone: string
  role: UserRole
  department: string
  status: UserStatus
  permissions: string[]
  notes: string
  lastAccess: string
  createdAt: string
}

const STORAGE_KEY = 'eiviplant-users-v1'

export const USER_ROLES: UserRole[] = ['Administrador', 'Almacén', 'Ventas', 'Planta exterior', 'Recepción']

export const PERMISSION_OPTIONS = [
  'Ver márgenes',
  'Gestionar usuarios',
  'Registrar entradas',
  'Registrar salidas',
  'Gestionar reservas',
  'Confirmar OCR',
  'Exportar datos',
  'Editar procedencias',
] as const

export const DEFAULT_APP_USERS: AppUser[] = [
  {
    id: 'u-admin',
    displayName: 'Usuario Administrador',
    username: 'admin',
    email: 'admin@eiviplant.com',
    phone: '+34 971 000 001',
    role: 'Administrador',
    department: 'Dirección',
    status: 'active',
    permissions: ['Ver márgenes', 'Gestionar usuarios', 'Confirmar OCR', 'Exportar datos', 'Editar procedencias'],
    notes: 'Acceso completo al panel de stock y configuración.',
    lastAccess: 'Hoy, 10:02',
    createdAt: '2024-01-10',
  },
  {
    id: 'u-almacen',
    displayName: 'Usuario Almacén',
    username: 'almacen',
    email: 'almacen@eiviplant.com',
    phone: '+34 971 000 002',
    role: 'Almacén',
    department: 'Almacén principal',
    status: 'active',
    permissions: ['Registrar entradas', 'Registrar salidas', 'Exportar datos'],
    notes: 'Entradas, salidas, mermas y recuentos en almacén.',
    lastAccess: 'Hoy, 09:01',
    createdAt: '2024-02-14',
  },
  {
    id: 'u-ventas',
    displayName: 'Usuario Ventas',
    username: 'ventas',
    email: 'ventas@eiviplant.com',
    phone: '+34 971 000 003',
    role: 'Ventas',
    department: 'Mostrador',
    status: 'active',
    permissions: ['Gestionar reservas', 'Registrar salidas'],
    notes: 'Consulta de stock, reservas y atención en mostrador.',
    lastAccess: 'Hoy, 08:47',
    createdAt: '2024-03-05',
  },
  {
    id: 'u-exterior',
    displayName: 'Usuario Planta exterior',
    username: 'planta.exterior',
    email: 'exterior@eiviplant.com',
    phone: '+34 971 000 004',
    role: 'Planta exterior',
    department: 'Invernadero A',
    status: 'active',
    permissions: ['Registrar entradas', 'Registrar salidas'],
    notes: 'Gestión de plantas de exterior e invernadero A.',
    lastAccess: 'Ayer, 16:40',
    createdAt: '2024-04-18',
  },
  {
    id: 'u-recepcion',
    displayName: 'Usuario Recepción',
    username: 'recepcion',
    email: 'recepcion@eiviplant.com',
    phone: '+34 971 000 005',
    role: 'Recepción',
    department: 'Muelle de entrada',
    status: 'inactive',
    permissions: ['Registrar entradas', 'Confirmar OCR'],
    notes: 'Cuenta desactivada temporalmente · sustituto en mostrador.',
    lastAccess: '12 feb, 09:15',
    createdAt: '2024-06-01',
  },
]

export function loadAppUsers(): AppUser[] {
  if (typeof window === 'undefined') return DEFAULT_APP_USERS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_APP_USERS
    const parsed = JSON.parse(raw) as AppUser[]
    return parsed.length > 0 ? parsed : DEFAULT_APP_USERS
  } catch {
    return DEFAULT_APP_USERS
  }
}

export function saveAppUsers(users: AppUser[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function createEmptyUser(): Omit<AppUser, 'id' | 'createdAt' | 'lastAccess'> {
  return {
    displayName: '',
    username: '',
    email: '',
    phone: '',
    role: 'Almacén',
    department: '',
    status: 'active',
    permissions: ['Registrar entradas'],
    notes: '',
  }
}

export function slugUsername(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

export function userInitials(user: Pick<AppUser, 'displayName'>) {
  if (user.displayName.startsWith('Usuario ')) {
    const part = user.displayName.replace('Usuario ', '')
    return part
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
  }
  return getInitials(user.displayName)
}

export function defaultPermissionsForRole(role: UserRole): string[] {
  switch (role) {
    case 'Administrador':
      return ['Ver márgenes', 'Gestionar usuarios', 'Confirmar OCR', 'Exportar datos', 'Editar procedencias']
    case 'Almacén':
      return ['Registrar entradas', 'Registrar salidas', 'Exportar datos']
    case 'Ventas':
      return ['Gestionar reservas', 'Registrar salidas']
    case 'Planta exterior':
      return ['Registrar entradas', 'Registrar salidas']
    case 'Recepción':
      return ['Registrar entradas', 'Confirmar OCR']
    default:
      return []
  }
}
