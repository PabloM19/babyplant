'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Eye, EyeOff, Leaf, Loader2 } from 'lucide-react'
import { useAppPreferences } from '@/components/app-preferences-provider'

const SLIDES = [
  {
    image: '/locations/invernadero-a.jpg',
    title: 'Control total del garden center',
    subtitle: 'Existencias, reservas y recepción en un solo panel.',
  },
  {
    image: '/locations/invernadero-b.jpg',
    title: 'Trazabilidad por lote y proveedor',
    subtitle: 'Cada planta con su procedencia, coste y margen.',
  },
  {
    image: '/products/monstera.jpg',
    title: 'Recepción inteligente con OCR',
    subtitle: 'Digitaliza albaranes y actualiza stock al instante.',
  },
] as const

export function LoginScreen() {
  const { login, profile } = useAppPreferences()
  const [slide, setSlide] = useState(0)
  const [email, setEmail] = useState(profile.email)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    setEmail(profile.email)
  }, [profile.email])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Introduce tu correo electrónico.')
      return
    }
    if (!password.trim()) {
      setError('Introduce tu contraseña.')
      return
    }
    if (password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres.')
      return
    }

    setLoading(true)
    await new Promise((r) => window.setTimeout(r, 700))
    setLoading(false)

    if (remember) localStorage.setItem('eiviplant-remember-email', email.trim())
    else localStorage.removeItem('eiviplant-remember-email')

    login()
  }

  useEffect(() => {
    const saved = localStorage.getItem('eiviplant-remember-email')
    if (saved) setEmail(saved)
  }, [])

  const current = SLIDES[slide]

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#141f18] p-4 sm:p-6 md:p-10">
      <div className="grid w-full max-w-[980px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1a2920] shadow-2xl md:min-h-[600px] md:grid-cols-[42%_58%]">
        {/* Panel visual */}
        <div className="relative min-h-[220px] md:min-h-full">
          {SLIDES.map((item, index) => (
            <div
              key={item.image}
              className={`absolute inset-0 transition-opacity duration-700 ${index === slide ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden={index !== slide}
            >
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141f18] via-[#141f18]/55 to-[#141f18]/20" />

          <div className="relative flex h-full flex-col p-5 sm:p-6 md:p-7">
            <div className="flex items-start justify-between gap-3">
              <img src="/logo-eiviplant.jpg" alt="Eiviplant" className="h-9 rounded-md object-contain brightness-110 md:h-10" />
              <a
                href="https://eiviplant.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/90 backdrop-blur-sm transition-colors hover:bg-white/15"
              >
                Ir a la web
                <ArrowRight className="size-3" />
              </a>
            </div>

            <div className="mt-auto space-y-3 pb-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur-sm">
                <Leaf className="size-3.5 text-[#9fd4a8]" />
                Panel de stock · Eiviplant
              </div>
              <h2 className="max-w-[280px] text-xl font-semibold leading-snug text-white sm:text-2xl">{current.title}</h2>
              <p className="max-w-[300px] text-sm leading-relaxed text-white/75">{current.subtitle}</p>
              <div className="flex gap-2 pt-1">
                {SLIDES.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Slide ${index + 1}`}
                    onClick={() => setSlide(index)}
                    className={`h-1 rounded-full transition-all ${index === slide ? 'w-7 bg-white' : 'w-4 bg-white/35 hover:bg-white/55'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 md:px-12">
          <div className="mx-auto w-full max-w-[360px]">
            <h1 className="text-2xl font-semibold tracking-tight text-white">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-white/60">
              ¿Primera vez aquí?{' '}
              <button type="button" className="font-medium text-[#9fd4a8] hover:text-[#b8e8bf]">
                Solicitar acceso
              </button>
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Field label="Correo electrónico">
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@eiviplant.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Contraseña">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/45 hover:text-white/75"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="size-4 rounded border-white/20 accent-[#3c9561] bg-[#243828]"
                />
                Recordarme en este dispositivo
              </label>

              {error && (
                <p className="rounded-xl border border-[#c55f58]/40 bg-[#c55f58]/10 px-3 py-2 text-sm text-[#f5b5b0]" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#316742] text-sm font-semibold text-white transition-colors hover:bg-[#3c9561] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Entrando…
                  </>
                ) : (
                  'Entrar al panel'
                )}
              </button>

              <button type="button" className="w-full text-center text-xs text-white/45 hover:text-white/65">
                ¿Olvidaste tu contraseña?
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-wide text-white/35">o continúa con</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SocialButton label="Google" onClick={() => setError('Inicio con Google disponible en producción')} />
              <SocialButton label="Apple" onClick={() => setError('Inicio con Apple disponible en producción')} />
            </div>

            <p className="mt-8 text-center text-[11px] leading-relaxed text-white/35">
              Demo interna · cualquier contraseña válida (mín. 4 caracteres)
              <br />
              Usuario sugerido: {profile.username}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-[#243828] px-3.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#5a9a68] focus:ring-2 focus:ring-[#3c9561]/25'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/55">{label}</span>
      {children}
    </label>
  )
}

function SocialButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/12 bg-[#243828] text-sm font-medium text-white/85 transition-colors hover:border-white/20 hover:bg-[#2a4034]"
    >
      {label === 'Google' ? (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            fill="#EA4335"
            d="M12 11.2v2.9h4.0c-.2 1-1.4 2.9-4.0 2.9-2.4 0-4.4-2-4.4-4.4s2-4.4 4.4-4.4c1.4 0 2.3.6 2.8 1.1l1.9-1.9C15.9 6.8 14.1 6 12 6 7.6 6 4 9.6 4 14s3.6 8 8 8c4.6 0 7.6-3.2 7.6-7.8 0-.5 0-.9-.1-1.2H12z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4 fill-white" aria-hidden>
          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.788.96-2.042 1.7-3.2 1.61-.152-1.15.426-2.35 1.12-3.08.84-.89 2.213-1.56 3.257-1.61zM20.8 17.03c-.585 1.35-.865 1.94-1.62 3.13-1.05 1.66-2.53 3.73-4.37 3.73-1.64 0-2.06-1.07-4.28-1.06-2.23.01-2.71 1.08-4.35 1.07-1.84-.01-3.24-1.88-4.29-3.54-2.95-4.64-3.26-10.08-1.44-12.97 1.28-2.01 3.3-3.19 5.2-3.19 1.94 0 3.16 1.08 4.76 1.08 1.54 0 2.48-1.08 4.71-1.08 1.68 0 3.45.91 4.73 2.49-4.16 2.26-3.49 8.14.86 9.88-.12.32-.25.64-.4.96z" />
        </svg>
      )}
      {label}
    </button>
  )
}
