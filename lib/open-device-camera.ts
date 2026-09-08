/** Vista previa en vivo solo en contexto seguro (localhost o HTTPS). */
export function canUseLiveCamera() {
  if (typeof window === 'undefined') return false
  return Boolean(window.isSecureContext && navigator.mediaDevices?.getUserMedia)
}

/** Abre la cámara nativa del móvil vía input file (funciona en HTTP). */
export function openNativeCamera(input: HTMLInputElement | null) {
  input?.click()
}
