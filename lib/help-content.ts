export type HelpTopic = {
  id: string
  section: string
  title: string
  summary: string
  paragraphs: string[]
  tips: string[]
}

export type TutorialStep = {
  id: string
  section: string
  title: string
  description: string
  bullets: string[]
}

export type HelpFaq = {
  id: string
  question: string
  answer: string
  tags: string[]
}

export type HelpConcept = {
  term: string
  definition: string
}

export const helpIntro = {
  title: 'Centro de ayuda de Eiviplant',
  description:
    'Este panel centraliza el stock del garden center: existencias por producto y procedencia, reservas de clientes, movimientos con trazabilidad y recepción de albaranes.',
}

export const helpConcepts: HelpConcept[] = [
  {
    term: 'Stock físico',
    definition: 'Unidades que hay realmente en almacén, invernadero o cuarentena.',
  },
  {
    term: 'Reservado',
    definition: 'Unidades comprometidas con un cliente. Siguen contando como físicas, pero ya no están disponibles para vender.',
  },
  {
    term: 'Inmovilizado',
    definition: 'Stock bloqueado temporalmente, por ejemplo en cuarentena fitosanitaria, hasta su revisión o liberación.',
  },
  {
    term: 'Disponible',
    definition: 'Lo que puedes vender o asignar ahora: físico menos reservado e inmovilizado.',
  },
  {
    term: 'Procedencia',
    definition: 'Origen de un lote concreto: proveedor, coste de compra, margen, fecha de entrada y referencia de albarán.',
  },
  {
    term: 'Código Eiviplant',
    definition: 'Identificador interno del producto en catálogo. Es la referencia común entre existencias, TPV y recepción.',
  },
]

export const helpTopics: HelpTopic[] = [
  {
    id: 'resumen',
    section: 'Resumen',
    title: 'Resumen del garden',
    summary: 'Vista general de disponibilidad, tareas pendientes y actividad reciente.',
    paragraphs: [
      'El resumen concentra lo más urgente del día: cuánto stock real tienes, qué parte está comprometida y qué tareas requieren acción.',
      'La tarjeta de disponibilidad desglosa físico, reservado, inmovilizado y disponible. Desde ahí puedes saltar directamente a Existencias.',
      'Las tareas pendientes enlazan con Recepción, Reservas o Movimientos según el tipo de incidencia.',
      'La actividad reciente muestra los últimos movimientos para detectar entradas, salidas o ajustes sin entrar en el histórico completo.',
    ],
    tips: [
      'Empieza aquí cada mañana para ver recepciones OCR pendientes y reservas que vencen pronto.',
      'Usa «Ver existencias» cuando necesites comprobar una referencia concreta.',
    ],
  },
  {
    id: 'existencias',
    section: 'Existencias',
    title: 'Catálogo y existencias',
    summary: 'Consulta productos, filtra por estado y despliega lotes por proveedor.',
    paragraphs: [
      'Existencias separa la ficha de producto de sus procedencias. Un mismo artículo puede tener varios lotes con costes y márgenes distintos.',
      'Puedes buscar por nombre, código Eiviplant, código de barras, pasaporte o proveedor, y filtrar por estado de stock y por zona (Interior, Exterior, Cuarentena).',
      'Al desplegar lotes ves proveedor, referencia, código de barras, pasaporte fitosanitario, coste, margen y desglose de unidades por procedencia.',
      'La selección múltiple permite exportar un subconjunto del catálogo.',
    ],
    tips: [
      'Si un producto tiene varias procedencias, revisa el margen por lote antes de decidir qué stock vender primero.',
      'Stock bajo avisa cuando quedan pocas unidades disponibles, no cuando el físico es alto pero casi todo está reservado.',
    ],
  },
  {
    id: 'movimientos',
    section: 'Movimientos',
    title: 'Movimientos y trazabilidad',
    summary: 'Histórico de entradas, salidas, reservas, mermas y ajustes con usuario y motivo.',
    paragraphs: [
      'Cada cambio de stock queda registrado con producto, cantidad, tipo, motivo, usuario y fecha.',
      'Los filtros por tipo (Entrada, Salida, Reserva, Merma, etc.) ayudan a auditar un flujo concreto.',
      'Las entradas suelen vincularse a albaranes de proveedor; las salidas pueden venir de TPV, pedidos o retiradas de reserva.',
      'El inmovilizado aparece como movimiento neutral cuando el stock pasa a cuarentena u otro bloqueo.',
    ],
    tips: [
      'Antes de registrar una merma, confirma la procedencia afectada si el producto tiene varios lotes.',
      'Exporta el histórico cuando necesites conciliar con contabilidad o revisiones internas.',
    ],
  },
  {
    id: 'reservas',
    section: 'Reservas',
    title: 'Reservas de clientes',
    summary: 'Compromisos de venta que reducen disponibilidad sin retirar el stock físico.',
    paragraphs: [
      'Una reserva resta unidades disponibles pero mantiene el stock físico hasta que el cliente recoge o se cancela.',
      'Las reservas activas muestran cliente, cantidad, fecha de vencimiento y notas operativas.',
      'Puedes crear una reserva nueva eligiendo producto, cantidad, cliente y fecha de vencimiento; no se puede reservar más de lo disponible.',
      'Las vencidas requieren seguimiento comercial; las retiradas confirman que el material ya salió del garden.',
      'Los indicadores superiores resumen activas, por vencer y retiradas en el mes.',
    ],
    tips: [
      'Revisa las reservas por vencer desde el resumen para evitar bloquear stock innecesariamente.',
      'En esta fase demo no se gestionan cobros; en producción se conectará con el flujo comercial de Eiviplant.',
    ],
  },
  {
    id: 'recepcion',
    section: 'Recepción',
    title: 'Recepción de documentos',
    summary: 'Registra entradas leyendo factura, albarán, pedido o ticket en PDF, foto o cámara.',
    paragraphs: [
      'Recepción es un asistente de tres pasos: tipo de documento, cómo lo lees (cámara, archivo o ejemplo) y revisión de líneas.',
      'Los PDF oficiales son solo una vía de prueba, aparte de la captura real. Si una línea no está en catálogo, puedes crear la ficha a mano.',
      'Tras confirmar, las unidades se suman al stock.',
    ],
    tips: [
      'Si estás probando el lector, elige «Probar ejemplo» en el segundo paso. No se mezcla con la cámara.',
      'En foto u OCR usa buena luz y el documento plano, sin sombras sobre las líneas.',
    ],
  },
  {
    id: 'proveedores',
    section: 'Proveedores',
    title: 'Proveedores y procedencias',
    summary: 'Ficha de cada vivero: contacto comercial, email de albaranes y tabla libre de datos extra.',
    paragraphs: [
      'Cada proveedor agrupa las procedencias desde las que compras distintos productos o lotes.',
      'Abre la ficha para llamar o escribir al comercial y al email de administración sin salir del panel.',
      'La tabla libre guarda datos operativos (día de entrega, pedido mínimo, formato de albarán) que el equipo consulta a mitad de tarea.',
    ],
    tips: [
      'Compara referencias por proveedor para detectar concentración de compras en pocos origenes.',
      'Usa el detalle de procedencias para negociar con datos de coste y margen reales.',
    ],
  },
  {
    id: 'ubicaciones',
    section: 'Ubicaciones',
    title: 'Ubicaciones físicas',
    summary: 'Dónde está el stock: invernaderos, almacén y cuarentena fitosanitaria.',
    paragraphs: [
      'Las ubicaciones organizan el stock por espacio físico del garden center.',
      'Cada tarjeta indica zona (Interior, Exterior o Cuarentena), cuántas referencias hay y el total de unidades.',
      'La cuarentena fitosanitaria concentra stock inmovilizado pendiente de revisión.',
    ],
    tips: [
      'Si un producto está en cuarentena, su disponible será cero aunque el físico siga visible en movimientos.',
      'Usa ubicaciones para planificar recuentos por zona en lugar de revisar todo el catálogo.',
    ],
  },
  {
    id: 'informes',
    section: 'Informes',
    title: 'Informes y auditoría',
    summary: 'Gráficos de movimiento, métricas del mes y log de acciones del equipo.',
    paragraphs: [
      'Informes resume entradas, salidas, reservas y referencias activas del periodo.',
      'El gráfico de barras apiladas muestra la evolución semanal de movimientos por tipo.',
      'El log de acciones registra quién hizo qué, en qué módulo y con qué detalle, con filtros y paginación.',
    ],
    tips: [
      'Filtra el log por usuario o módulo para auditar recepciones, ajustes o exportaciones.',
      'Combina informes con Movimientos cuando necesites el detalle línea a línea de una semana concreta.',
    ],
  },
  {
    id: 'usuarios',
    section: 'Usuarios',
    title: 'Gestión de usuarios',
    summary: 'Alta, edición y desactivación de cuentas del panel (solo administrador).',
    paragraphs: [
      'Desde Usuarios el administrador crea cuentas operativas: almacén, ventas, planta exterior o recepción.',
      'Cada ficha incluye rol, departamento, permisos y estado activo o inactivo.',
      'Puedes desactivar una cuenta sin borrarla o eliminarla definitivamente si ya no se usa.',
    ],
    tips: [
      'Usa nombres operativos como «Usuario Almacén» para identificar rápido el turno o zona.',
      'Revisa permisos al crear: ventas no necesita ver márgenes; almacén sí registra entradas y salidas.',
    ],
  },
  {
    id: 'configuracion',
    section: 'Configuración',
    title: 'Configuración',
    summary: 'Preferencias del panel, usuarios y parámetros operativos del garden.',
    paragraphs: [
      'Configuración concentrará ajustes de cuenta, permisos, alertas de stock y integraciones con TPV o ERP.',
      'En esta demo los cambios muestran avisos simulados; en producción se guardarán en el entorno de Eiviplant.',
    ],
    tips: ['Consulta esta sección cuando conectemos el panel con datos reales de tienda y almacén.'],
  },
]

export const helpFaqs: HelpFaq[] = [
  {
    id: 'faq-disponible',
    question: '¿Por qué tengo stock físico pero disponible en cero?',
    answer: 'Probablemente todo el físico está reservado para clientes o inmovilizado en cuarentena. Revisa procedencias y reservas activas del producto.',
    tags: ['disponible', 'reservas', 'cuarentena'],
  },
  {
    id: 'faq-procedencias',
    question: '¿Por qué un producto tiene varias procedencias?',
    answer: 'Porque has recibido lotes del mismo artículo en fechas o proveedores distintos, cada uno con su coste y margen.',
    tags: ['procedencias', 'proveedores', 'lotes'],
  },
  {
    id: 'faq-ocr',
    question: '¿Qué hago si el OCR no lee bien el albarán?',
    answer: 'Repite la foto con mejor luz, prueba con el PDF original o corrige manualmente las líneas antes de confirmar la recepción.',
    tags: ['recepción', 'ocr', 'albarán'],
  },
  {
    id: 'faq-exportar',
    question: '¿Cómo exporto existencias seleccionadas?',
    answer: 'En Existencias marca los productos con el selector y usa la barra flotante «Exportar» en la parte inferior.',
    tags: ['existencias', 'exportar', 'csv'],
  },
  {
    id: 'faq-stock-bajo',
    question: '¿Cuándo aparece «Stock bajo»?',
    answer: 'Cuando las unidades disponibles (no reservadas ni inmovilizadas) son pocas, normalmente ocho o menos en esta demo.',
    tags: ['alertas', 'stock bajo'],
  },
  {
    id: 'faq-busqueda',
    question: '¿Puedo buscar por código de proveedor?',
    answer: 'Sí. La búsqueda de Existencias incluye nombres de proveedor además de nombre de producto y código Eiviplant.',
    tags: ['búsqueda', 'existencias'],
  },
]

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    section: 'Resumen',
    title: 'Bienvenido al panel de stock',
    description: 'Este recorrido te enseña para qué sirve cada zona del panel de Eiviplant. Puedes salir cuando quieras y retomarlo desde Ayuda.',
    bullets: ['Duración aproximada: 3 minutos', 'Usa Siguiente para avanzar por cada módulo', 'El panel navegará automáticamente a la sección correspondiente'],
  },
  {
    id: 'resumen',
    section: 'Resumen',
    title: 'Resumen del garden',
    description: 'Aquí arranca el día a día: disponibilidad global, tareas urgentes y últimos movimientos.',
    bullets: [
      'Disponibilidad real = físico − reservado − inmovilizado',
      'Las tareas enlazan con recepciones OCR, reservas por vencer o mermas pendientes',
      'La actividad reciente evita entrar en históricos largos para un vistazo rápido',
    ],
  },
  {
    id: 'existencias',
    section: 'Existencias',
    title: 'Catálogo y existencias',
    description: 'Consulta cada producto con foto, código Eiviplant y desglose de unidades.',
    bullets: [
      'Alterna entre vista tarjetas y lista según el tipo de revisión',
      'Despliega lotes para ver proveedor, código de barras y pasaporte',
      'Filtra por estado de stock o por zona (interior, exterior, cuarentena)',
    ],
  },
  {
    id: 'movimientos',
    section: 'Movimientos',
    title: 'Trazabilidad completa',
    description: 'Todo cambio de stock queda registrado con motivo y usuario responsable.',
    bullets: [
      'Entradas, salidas, reservas, mermas y ajustes en un solo histórico',
      'Filtra por tipo de movimiento para auditorías puntuales',
      'Exporta cuando necesites conciliar con otros sistemas',
    ],
  },
  {
    id: 'reservas',
    section: 'Reservas',
    title: 'Compromisos con clientes',
    description: 'Las reservas bloquean disponibilidad hasta recogida o cancelación.',
    bullets: [
      'Crea una reserva nueva con producto, cantidad, cliente y vencimiento',
      'Prioriza las reservas por vencer para liberar stock',
      'Las retiradas confirman material ya entregado',
    ],
  },
  {
    id: 'recepcion',
    section: 'Recepción',
    title: 'Entrada de mercancía',
    description: 'Digitaliza facturas, albaranes, pedidos o tickets para cargar stock más rápido.',
    bullets: [
      'Elige el tipo de documento (albarán, factura, pedido, ticket…)',
      'Decide si usas cámara, un archivo o un PDF de ejemplo',
      'Revisa las líneas y crea ficha si el producto no está en catálogo',
    ],
  },
  {
    id: 'proveedores',
    section: 'Proveedores',
    title: 'Origen del stock',
    description: 'Visualiza de quién compras cada referencia y cuántos productos tienes por proveedor.',
    bullets: [
      'Abre la ficha para ver teléfono y email de albaranes',
      'Completa la tabla libre con entregas, mínimos u otras notas',
      'Útil para negociar y planificar pedidos',
    ],
  },
  {
    id: 'ubicaciones',
    section: 'Ubicaciones',
    title: 'Dónde está cada cosa',
    description: 'Organiza el stock por invernadero, almacén o cuarentena fitosanitaria.',
    bullets: [
      'Consulta referencias y unidades por zona',
      'La cuarentena concentra stock inmovilizado',
      'Facilita recuentos parciales por espacio',
    ],
  },
  {
    id: 'informes',
    section: 'Informes',
    title: 'Métricas y auditoría',
    description: 'Analiza el mes y revisa el log de acciones del equipo.',
    bullets: [
      'Gráfico semanal de entradas, salidas y reservas',
      'Log filtrable por usuario, módulo y fecha',
      'Complementa el detalle de Movimientos',
    ],
  },
  {
    id: 'finish',
    section: 'Resumen',
    title: 'Recorrido completado',
    description: 'Ya conoces las piezas principales del panel. Vuelve a Ayuda cuando necesites repasar un módulo o consultar preguntas frecuentes.',
    bullets: [
      'Empieza por Resumen cada jornada',
      'Usa la búsqueda rápida del header para localizar productos',
      'Desde Ayuda puedes reiniciar este tutorial cuando quieras',
    ],
  },
]

export function findHelpTopic(id: string) {
  return helpTopics.find((t) => t.id === id)
}

export function filterHelpContent(query: string) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return { topics: helpTopics, faqs: helpFaqs }
  }
  const topics = helpTopics.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.section.toLowerCase().includes(q) ||
      t.paragraphs.some((p) => p.toLowerCase().includes(q)),
  )
  const faqs = helpFaqs.filter(
    (f) =>
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.tags.some((tag) => tag.includes(q)),
  )
  return { topics, faqs }
}
