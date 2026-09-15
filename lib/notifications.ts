export type NotificationLevel = 'critical' | 'warning' | 'info'

export type AppNotification = {
  id: string
  level: NotificationLevel
  title: string
  detail: string
  time: string
  section: string
  unread: boolean
}

export const DEMO_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    level: 'critical',
    title: 'Sansevieria trifasciata agotada',
    detail: 'Sin unidades disponibles. Reponer antes del fin de semana.',
    time: 'Hace 12 min',
    section: 'Existencias',
    unread: true,
  },
  {
    id: 'n2',
    level: 'critical',
    title: 'Olivo miniatura en cuarentena',
    detail: '24 uds. inmovilizadas · lote VL-9920 pendiente de revisión.',
    time: 'Hace 1 h',
    section: 'Ubicaciones',
    unread: true,
  },
  {
    id: 'n3',
    level: 'warning',
    title: 'Reservas por vencer',
    detail: '3 reservas activas caducan esta semana. Contactar clientes.',
    time: 'Hace 2 h',
    section: 'Reservas',
    unread: true,
  },
  {
    id: 'n4',
    level: 'warning',
    title: 'Stock bajo en geranio e hibiscus',
    detail: '7 y 4 uds. disponibles. Umbral de alerta superado.',
    time: 'Hoy, 09:18',
    section: 'Existencias',
    unread: true,
  },
  {
    id: 'n5',
    level: 'info',
    title: 'Albarán OCR pendiente',
    detail: '18 líneas detectadas en VL-8841. Confirmar recepción.',
    time: 'Hoy, 09:42',
    section: 'Recepción',
    unread: true,
  },
]

export const LEVEL_META: Record<
  NotificationLevel,
  { label: string; iconBg: string; iconText: string; bar: string; chip: string }
> = {
  critical: {
    label: 'Urgente',
    iconBg: 'bg-[#fde3e0]',
    iconText: 'text-[#c55f58]',
    bar: 'bg-[#c55f58]',
    chip: 'bg-[#fde3e0] text-[#c55f58]',
  },
  warning: {
    label: 'Atención',
    iconBg: 'bg-[#fef3c7]',
    iconText: 'text-[#b45309]',
    bar: 'bg-[#d59036]',
    chip: 'bg-[#fef3c7] text-[#8a5a12]',
  },
  info: {
    label: 'Info',
    iconBg: 'bg-[#e0edf8]',
    iconText: 'text-[#2b6cb0]',
    bar: 'bg-[#3b82c4]',
    chip: 'bg-[#e0edf8] text-[#2b6cb0]',
  },
}
