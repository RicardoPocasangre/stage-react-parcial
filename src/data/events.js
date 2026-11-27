// Constantes del dominio de STAGE. Los eventos, usuarios y órdenes de ejemplo
// viven ahora en public/api/*.json y se leen a través de src/api.
import { asset } from '../utils/assets.js'

export const CATEGORIES = ['Concierto', 'Teatro', 'Deporte']

// Texto de los chips de filtro (plural, como en el prototipo)
export const CATEGORY_LABEL = { Concierto: 'Conciertos', Teatro: 'Teatro', Deporte: 'Deportes' }

export const CATEGORY_ICON = {
  Concierto: asset('img/icon-music.png'),
  Teatro: asset('img/icon-star.png'),
  Deporte: asset('img/icon-ball.png'),
}
