'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  applyPreferencesToDocument,
  DEFAULT_PREFERENCES,
  DEFAULT_PROFILE,
  loadPreferences,
  loadProfile,
  loadSession,
  savePreferences,
  saveProfile,
  saveSession,
  type AppPreferences,
  type UserProfile,
  type UserSession,
} from '@/lib/app-preferences'
import {
  DEFAULT_APP_USERS,
  loadAppUsers,
  saveAppUsers,
  type AppUser,
  type UserStatus,
} from '@/lib/app-users'

type AppPreferencesContextValue = {
  preferences: AppPreferences
  profile: UserProfile
  session: UserSession
  users: AppUser[]
  updatePreferences: (patch: Partial<AppPreferences>) => void
  replacePreferences: (prefs: AppPreferences) => void
  resetPreferences: () => void
  updateProfile: (patch: Partial<UserProfile>) => void
  saveProfileChanges: (profile: UserProfile) => void
  createUser: (data: Omit<AppUser, 'id' | 'createdAt' | 'lastAccess'>) => AppUser
  updateUser: (id: string, patch: Partial<Omit<AppUser, 'id' | 'createdAt'>>) => void
  setUserStatus: (id: string, status: UserStatus) => void
  deleteUser: (id: string) => void
  login: () => void
  logout: () => void
}

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null)

function formatUserDate(date = new Date()) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES)
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [session, setSession] = useState<UserSession>({ isLoggedIn: true })
  const [users, setUsers] = useState<AppUser[]>(DEFAULT_APP_USERS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setPreferences(loadPreferences())
    setProfile(loadProfile())
    setSession(loadSession())
    setUsers(loadAppUsers())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    applyPreferencesToDocument(preferences)
    savePreferences(preferences)
  }, [preferences, hydrated])

  useEffect(() => {
    if (!hydrated) return
    saveAppUsers(users)
  }, [users, hydrated])

  const updatePreferences = useCallback((patch: Partial<AppPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }))
  }, [])

  const replacePreferences = useCallback((prefs: AppPreferences) => {
    setPreferences(prefs)
  }, [])

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
  }, [])

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }))
  }, [])

  const saveProfileChanges = useCallback((next: UserProfile) => {
    setProfile(next)
    saveProfile(next)
  }, [])

  const createUser = useCallback((data: Omit<AppUser, 'id' | 'createdAt' | 'lastAccess'>) => {
    const created: AppUser = {
      ...data,
      id: `u-${Date.now()}`,
      createdAt: formatUserDate(),
      lastAccess: 'Sin acceso',
    }
    setUsers((prev) => [...prev, created])
    return created
  }, [])

  const updateUser = useCallback((id: string, patch: Partial<Omit<AppUser, 'id' | 'createdAt'>>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))
  }, [])

  const setUserStatus = useCallback((id: string, status: UserStatus) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)))
  }, [])

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }, [])

  const login = useCallback(() => {
    const next = { isLoggedIn: true }
    setSession(next)
    saveSession(next)
  }, [])

  const logout = useCallback(() => {
    const next = { isLoggedIn: false }
    setSession(next)
    saveSession(next)
  }, [])

  const value = useMemo(
    () => ({
      preferences,
      profile,
      session,
      users,
      updatePreferences,
      replacePreferences,
      resetPreferences,
      updateProfile,
      saveProfileChanges,
      createUser,
      updateUser,
      setUserStatus,
      deleteUser,
      login,
      logout,
    }),
    [
      preferences,
      profile,
      session,
      users,
      updatePreferences,
      replacePreferences,
      resetPreferences,
      updateProfile,
      saveProfileChanges,
      createUser,
      updateUser,
      setUserStatus,
      deleteUser,
      login,
      logout,
    ],
  )

  if (!hydrated) {
    return <div className="min-h-screen bg-[var(--ep-bg,#fbfcfa)]" />
  }

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>
}

export function useAppPreferences() {
  const ctx = useContext(AppPreferencesContext)
  if (!ctx) throw new Error('useAppPreferences debe usarse dentro de AppPreferencesProvider')
  return ctx
}
