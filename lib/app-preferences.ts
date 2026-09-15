export type ThemeMode = 'light' | 'dark' | 'system'
export type FontFamilyId = 'system' | 'humanist' | 'serif' | 'mono'
export type FontSizeId = 'compact' | 'comfortable' | 'large'
export type DensityId = 'compact' | 'comfortable' | 'spacious'
export type ChipStyleId = 'pill' | 'rounded' | 'square'
export type RadiusId = 'sm' | 'md' | 'lg' | 'xl'
export type ColorPresetId = 'eiviplant' | 'forest' | 'ocean' | 'sunset' | 'custom'

export type ColorTokens = {
  primary: string
  primaryHover: string
  sidebar: string
  background: string
  accentSoft: string
  muted: string
}

export type AppPreferences = {
  themeMode: ThemeMode
  colorPreset: ColorPresetId
  colors: ColorTokens
  fontFamily: FontFamilyId
  fontSize: FontSizeId
  density: DensityId
  chipStyle: ChipStyleId
  borderRadius: RadiusId
  showProductPhotos: boolean
  animateTransitions: boolean
  lowStockAlerts: boolean
  mermaReminders: boolean
  marginsAdminOnly: boolean
  reservationReminders: boolean
  ocrAutoConfirm: boolean
  eiviplantCodeFormat: string
  gardenCenterName: string
  defaultInventoryView: 'grid' | 'list'
  movementRowsPerPage: number
  language: 'es' | 'ca' | 'en'
  dateFormat: 'dmy' | 'ymd'
  currencySymbol: '€' | '$' | '£'
}

export type UserProfile = {
  displayName: string
  username: string
  email: string
  role: string
  phone: string
}

export type UserSession = {
  isLoggedIn: boolean
}

const STORAGE_KEY_PREFS = 'eiviplant-preferences-v1'
const STORAGE_KEY_PROFILE = 'eiviplant-profile-v1'
const STORAGE_KEY_SESSION = 'eiviplant-session-v1'

export const COLOR_PRESETS: Record<Exclude<ColorPresetId, 'custom'>, ColorTokens> = {
  eiviplant: {
    primary: '#316742',
    primaryHover: '#285a37',
    sidebar: '#dcefe0',
    background: '#fbfcfa',
    accentSoft: '#e4f1e5',
    muted: '#829187',
  },
  forest: {
    primary: '#2d5a27',
    primaryHover: '#244a20',
    sidebar: '#d4e8d0',
    background: '#f7faf6',
    accentSoft: '#dcefdc',
    muted: '#6b8a66',
  },
  ocean: {
    primary: '#1d6b8a',
    primaryHover: '#16566f',
    sidebar: '#d8ecf4',
    background: '#f8fbfd',
    accentSoft: '#e3f2f8',
    muted: '#6a8a96',
  },
  sunset: {
    primary: '#b45309',
    primaryHover: '#92400e',
    sidebar: '#fdebd3',
    background: '#fffbf7',
    accentSoft: '#fef3c7',
    muted: '#9a7349',
  },
}

export const FONT_FAMILIES: Record<FontFamilyId, string> = {
  system: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  humanist: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
}

export const FONT_SCALES: Record<FontSizeId, number> = {
  compact: 0.9375,
  comfortable: 1,
  large: 1.0625,
}

export const RADIUS_VALUES: Record<RadiusId, string> = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
}

export const CHIP_RADIUS: Record<ChipStyleId, string> = {
  pill: '9999px',
  rounded: '0.5rem',
  square: '0.25rem',
}

export const DEFAULT_PROFILE: UserProfile = {
  displayName: 'Usuario Administrador',
  username: 'admin',
  email: 'admin@eiviplant.com',
  role: 'Administrador',
  phone: '+34 971 000 001',
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  themeMode: 'light',
  colorPreset: 'eiviplant',
  colors: COLOR_PRESETS.eiviplant,
  fontFamily: 'system',
  fontSize: 'comfortable',
  density: 'comfortable',
  chipStyle: 'pill',
  borderRadius: 'lg',
  showProductPhotos: true,
  animateTransitions: true,
  lowStockAlerts: true,
  mermaReminders: true,
  marginsAdminOnly: true,
  reservationReminders: true,
  ocrAutoConfirm: false,
  eiviplantCodeFormat: 'Proveedor · Fecha entrada · Nº interno',
  gardenCenterName: 'Eiviplant · Sant Antoni de Portmany',
  defaultInventoryView: 'list',
  movementRowsPerPage: 15,
  language: 'es',
  dateFormat: 'dmy',
  currencySymbol: '€',
}

function isBrowser() {
  return typeof window !== 'undefined'
}

export function loadPreferences(): AppPreferences {
  if (!isBrowser()) return DEFAULT_PREFERENCES
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFS)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<AppPreferences>
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      colors: { ...DEFAULT_PREFERENCES.colors, ...parsed.colors },
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function savePreferences(prefs: AppPreferences) {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs))
}

export function loadProfile(): UserProfile {
  if (!isBrowser()) return DEFAULT_PROFILE
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE)
    if (!raw) return DEFAULT_PROFILE
    const parsed = { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
    if (parsed.displayName === 'Luz Urbano' || parsed.username === 'luz.urbano') return DEFAULT_PROFILE
    return parsed
  } catch {
    return DEFAULT_PROFILE
  }
}

export function saveProfile(profile: UserProfile) {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile))
}

export function loadSession(): UserSession {
  if (!isBrowser()) return { isLoggedIn: true }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION)
    if (!raw) return { isLoggedIn: true }
    return JSON.parse(raw) as UserSession
  } catch {
    return { isLoggedIn: true }
  }
}

export function saveSession(session: UserSession) {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session))
}

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function applyPreferencesToDocument(prefs: AppPreferences) {
  if (!isBrowser()) return
  const root = document.documentElement
  const { colors } = prefs

  root.style.setProperty('--ep-primary', colors.primary)
  root.style.setProperty('--ep-primary-hover', colors.primaryHover)
  root.style.setProperty('--ep-sidebar', colors.sidebar)
  root.style.setProperty('--ep-bg', colors.background)
  root.style.setProperty('--ep-accent-soft', colors.accentSoft)
  root.style.setProperty('--ep-muted', colors.muted)
  root.style.setProperty('--ep-font-family', FONT_FAMILIES[prefs.fontFamily])
  root.style.setProperty('--ep-font-scale', String(FONT_SCALES[prefs.fontSize]))
  root.style.setProperty('--ep-radius', RADIUS_VALUES[prefs.borderRadius])
  root.style.setProperty('--ep-chip-radius', CHIP_RADIUS[prefs.chipStyle])

  root.dataset.density = prefs.density
  root.dataset.chipStyle = prefs.chipStyle
  root.dataset.animate = prefs.animateTransitions ? 'on' : 'off'

  root.classList.remove('light', 'dark')
  if (prefs.themeMode === 'dark') root.classList.add('dark')
  else if (prefs.themeMode === 'light') root.classList.add('light')
}
