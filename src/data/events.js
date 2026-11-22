// Datos simulados propios del dominio de STAGE (venta de boletos), alineados
// con el prototipo de Figma de la Primera entrega. Cada zona lleva capacidad y
// boletos vendidos: la disponibilidad se calcula.
import { simpleHash } from '../utils/format.js'

export const CATEGORIES = ['Concierto', 'Teatro', 'Deporte']

// Texto de los chips de filtro (plural, como en el prototipo)
export const CATEGORY_LABEL = { Concierto: 'Conciertos', Teatro: 'Teatro', Deporte: 'Deportes' }

export const CATEGORY_ICON = {
  Concierto: '/img/icon-music.png',
  Teatro: '/img/icon-star.png',
  Deporte: '/img/icon-ball.png',
}

export const seedEvents = [
  {
    id: 'ev-aurora',
    title: 'Festival Aurora',
    category: 'Concierto',
    status: 'publicado',
    date: '2026-12-12T19:00:00',
    doors: '5:00 p. m.',
    venue: 'Arena Central',
    city: 'San Salvador',
    description:
      'Una noche de música en vivo con artistas invitados, pantallas inmersivas y una puesta en escena pensada para todo el público. Habrá zonas de comida y puntos de hidratación dentro del recinto.',
    zones: [
      { id: 'aurora-gen', name: 'General', desc: 'Pista, de pie', price: 25, capacity: 400, sold: 80 },
      { id: 'aurora-pref', name: 'Preferencial', desc: 'Gradas con asiento numerado', price: 45, capacity: 150, sold: 30 },
      { id: 'aurora-vip', name: 'VIP', desc: 'Palco con servicio de bar', price: 80, capacity: 40, sold: 16 },
    ],
  },
  {
    id: 'ev-jazz',
    title: 'Noche de Jazz',
    category: 'Concierto',
    status: 'publicado',
    date: '2026-12-19T20:00:00',
    doors: '7:00 p. m.',
    venue: 'Teatro Municipal',
    city: 'San Salvador',
    description:
      'Cuarteto de jazz en vivo con repertorio de clásicos y composiciones originales. Una noche íntima para disfrutar la música de cerca.',
    zones: [
      { id: 'jazz-gen', name: 'General', desc: 'Butacas sin numerar', price: 18, capacity: 250, sold: 95 },
      { id: 'jazz-mesas', name: 'Mesas', desc: 'Mesa para cuatro con servicio', price: 55, capacity: 40, sold: 36 },
    ],
  },
  {
    id: 'ev-ultimo-acto',
    title: 'El Último Acto',
    category: 'Teatro',
    status: 'publicado',
    date: '2026-12-11T19:30:00',
    doors: '6:30 p. m.',
    venue: 'Teatro Municipal',
    city: 'San Salvador',
    description:
      'Drama contemporáneo con elenco nacional sobre una compañía de teatro que ensaya su última función. Duración aproximada: 100 minutos.',
    zones: [
      { id: 'acto-platea', name: 'Platea', desc: 'Butacas al nivel del escenario', price: 15, capacity: 220, sold: 150 },
      { id: 'acto-balcon', name: 'Balcón', desc: 'Segundo nivel, vista completa', price: 10, capacity: 120, sold: 40 },
    ],
  },
  {
    id: 'ev-copa',
    title: 'Final Copa Metropolitana',
    category: 'Deporte',
    status: 'publicado',
    date: '2027-01-09T16:00:00',
    doors: '2:00 p. m.',
    venue: 'Estadio Metropolitano',
    city: 'San Salvador',
    description:
      'La final del torneo más esperado de la temporada. Acceso por puertas identificadas según la zona de tu boleto; no se permite el ingreso de bebidas en envase de vidrio.',
    zones: [
      { id: 'copa-gen', name: 'General', desc: 'Graderío descubierto', price: 12, capacity: 900, sold: 410 },
      { id: 'copa-sombra', name: 'Sombra', desc: 'Graderío techado', price: 25, capacity: 500, sold: 260 },
      { id: 'copa-palco', name: 'Palco', desc: 'Asiento reservado y acceso preferente', price: 60, capacity: 80, sold: 48 },
    ],
  },
  {
    id: 'ev-sinfonia',
    title: 'Sinfonía de Invierno',
    category: 'Concierto',
    status: 'publicado',
    date: '2027-01-23T18:00:00',
    doors: '5:00 p. m.',
    venue: 'Auditorio Nacional',
    city: 'San Salvador',
    description:
      'La orquesta sinfónica interpreta un programa de invierno con obras de Vivaldi, Tchaikovsky y compositores centroamericanos.',
    zones: [
      { id: 'sinfonia-gen', name: 'General', desc: 'Butacas numeradas', price: 30, capacity: 300, sold: 120 },
      { id: 'sinfonia-pref', name: 'Preferencial', desc: 'Primeras filas', price: 55, capacity: 80, sold: 52 },
    ],
  },
  {
    id: 'ev-comedia',
    title: 'Comedia en Escena',
    category: 'Teatro',
    status: 'publicado',
    date: '2027-01-15T20:00:00',
    doors: '7:00 p. m.',
    venue: 'Teatro del Parque',
    city: 'San Salvador',
    description:
      'Cinco humoristas salvadoreños en una misma noche. Contenido para mayores de 15 años.',
    zones: [
      { id: 'comedia-gen', name: 'General', desc: 'Butacas numeradas', price: 14, capacity: 180, sold: 61 },
      { id: 'comedia-primera', name: 'Primera fila', desc: 'Cerca del escenario', price: 28, capacity: 30, sold: 24 },
    ],
  },
  {
    id: 'ev-torneo',
    title: 'Torneo Relámpago',
    category: 'Deporte',
    status: 'publicado',
    date: '2027-01-16T10:00:00',
    doors: '9:00 a. m.',
    venue: 'Coliseo Sur',
    city: 'San Salvador',
    description:
      'Torneo de un día con equipos juveniles de todo el país. Entrada con descuento para grupos escolares.',
    zones: [
      { id: 'torneo-gen', name: 'General', desc: 'Graderío libre', price: 10, capacity: 600, sold: 150 },
      { id: 'torneo-cancha', name: 'Cancha', desc: 'Asientos a pie de cancha', price: 18, capacity: 60, sold: 20 },
    ],
  },
  {
    id: 'ev-gala',
    title: 'Gala de Danza',
    category: 'Teatro',
    status: 'publicado',
    date: '2027-01-30T19:00:00',
    doors: '6:00 p. m.',
    venue: 'Teatro Municipal',
    city: 'San Salvador',
    description:
      'Una noche de danza clásica y contemporánea con compañías invitadas y estrenos coreográficos.',
    zones: [
      { id: 'gala-platea', name: 'Platea', desc: 'Butacas al nivel del escenario', price: 20, capacity: 220, sold: 90 },
      { id: 'gala-palco', name: 'Palco', desc: 'Vista lateral elevada', price: 35, capacity: 60, sold: 22 },
    ],
  },
]

// Cuentas de demostración (documentadas en el README, sin datos personales reales)
export const seedUsers = [
  {
    id: 'u-cliente',
    name: 'Cliente Demo',
    email: 'cliente@stage.test',
    role: 'cliente',
    passwordHash: simpleHash('Cliente123'),
  },
  {
    id: 'u-admin',
    name: 'Administrador STAGE',
    email: 'admin@stage.test',
    role: 'administrador',
    passwordHash: simpleHash('Admin123'),
  },
  {
    id: 'u-org',
    name: 'Organizador Demo',
    email: 'organizador@stage.test',
    role: 'organizador',
    passwordHash: simpleHash('Organizador123'),
  },
]

// Órdenes de ejemplo (últimos días) para que el panel y los reportes tengan datos con sentido
const order = (n, eventId, zoneId, zoneName, qty, unitPrice, createdAt, status = 'pagada') => ({
  id: `ord-${1000 + n}`,
  userId: 'u-cliente',
  eventId,
  zoneId,
  zoneName,
  qty,
  unitPrice,
  total: qty * unitPrice,
  createdAt,
  status,
})

export const seedOrders = [
  order(1, 'ev-aurora', 'aurora-pref', 'Preferencial', 2, 45, '2026-11-15T10:15:00'),
  order(2, 'ev-jazz', 'jazz-gen', 'General', 2, 18, '2026-11-15T16:40:00'),
  order(3, 'ev-ultimo-acto', 'acto-platea', 'Platea', 3, 15, '2026-11-16T19:05:00'),
  order(4, 'ev-copa', 'copa-sombra', 'Sombra', 4, 25, '2026-11-17T09:30:00'),
  order(5, 'ev-aurora', 'aurora-gen', 'General', 6, 25, '2026-11-18T14:20:00'),
  order(6, 'ev-sinfonia', 'sinfonia-gen', 'General', 2, 30, '2026-11-18T20:10:00'),
  order(7, 'ev-comedia', 'comedia-gen', 'General', 5, 14, '2026-11-19T11:00:00'),
  order(8, 'ev-aurora', 'aurora-vip', 'VIP', 2, 80, '2026-11-19T18:45:00', 'pendiente'),
  order(9, 'ev-jazz', 'jazz-mesas', 'Mesas', 1, 55, '2026-11-20T12:30:00'),
  order(10, 'ev-gala', 'gala-platea', 'Platea', 3, 20, '2026-11-20T21:00:00'),
  order(11, 'ev-torneo', 'torneo-gen', 'General', 8, 10, '2026-11-21T10:05:00'),
  order(12, 'ev-aurora', 'aurora-pref', 'Preferencial', 2, 45, '2026-11-21T15:25:00'),
]
