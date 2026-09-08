'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { parseAlbaranCapture, type ParsedAlbaran } from '@/lib/parse-albaran-image'

type Props = {
  open: boolean
  onClose: () => void
  onResult: (result: ParsedAlbaran, sourceLabel: string) => void
  onError: (message: string) => void
  onNativeFallback?: () => void
}

export function ReceptionCamera({ open, onClose, onResult, onError, onNativeFallback }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [ready, setReady] = useState(false)
  const [scanning, setScanning] = useState(false)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setReady(false)
  }, [])

  useEffect(() => {
    if (!open) {
      stopCamera()
      return
    }

    let cancelled = false

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        onNativeFallback?.()
        onClose()
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
          setReady(true)
        }
      } catch {
        onNativeFallback?.()
        onClose()
      }
    }

    start()
    return () => {
      cancelled = true
      stopCamera()
    }
  }, [open, onClose, onNativeFallback, stopCamera])

  const capture = useCallback(async () => {
    const video = videoRef.current
    if (!video || !ready || scanning) return

    setScanning(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('canvas')

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const result = await parseAlbaranCapture(canvas)

      if (result.lines.length === 0) {
        onError('No se detectaron líneas. Acerca el albarán, mejora la luz y vuelve a capturar.')
        return
      }

      onResult(result, 'Captura con cámara')
      onClose()
    } catch {
      onError('No se pudo leer la foto. Inténtalo de nuevo con mejor iluminación.')
    } finally {
      setScanning(false)
    }
  }, [ready, scanning, onClose, onError, onResult])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Camera className="size-5 text-[#316742]" />
            <h3 className="font-semibold">Escanear albarán</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar cámara">
            <X className="size-5 text-[#829187]" />
          </button>
        </div>

        <div className="relative aspect-[3/4] bg-black sm:aspect-[4/3]">
          <video ref={videoRef} playsInline muted className="size-full object-cover" />
          <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-white/70" />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-white">
              Activando cámara…
            </div>
          )}
        </div>

        <div className="space-y-3 px-5 py-4">
          <p className="text-xs text-[#829187]">Encuadra la tabla del albarán dentro del recuadro. Funciona con el albarán impreso o en pantalla.</p>
          <button
            type="button"
            disabled={!ready || scanning}
            onClick={capture}
            className="w-full rounded-xl bg-[#316742] py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            {scanning ? 'Leyendo texto…' : 'Capturar y leer'}
          </button>
        </div>
      </div>
    </div>
  )
}
