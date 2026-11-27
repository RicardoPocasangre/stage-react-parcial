// Estado global de STAGE: sesión, carrito y preferencias. Todas las
// transiciones pasan por este reducer; los componentes solo envían acciones.

export const ACTIONS = {
  LOGIN: 'session/login',
  UPDATE_USER: 'session/update',
  LOGOUT: 'session/logout',
  ADD_TO_CART: 'cart/add',
  SET_QTY: 'cart/setQty',
  REMOVE_FROM_CART: 'cart/remove',
  CLEAR_CART: 'cart/clear',
  SET_SIMULATE_ERROR: 'prefs/simulateError',
}

export function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return { ...state, user: action.user }

    case ACTIONS.UPDATE_USER:
      return { ...state, user: state.user ? { ...state.user, ...action.patch } : state.user }

    // Al cerrar sesión se conserva el carrito: el usuario puede seguir comprando.
    case ACTIONS.LOGOUT:
      return { ...state, user: null }

    case ACTIONS.ADD_TO_CART: {
      const { eventId, zoneId, qty } = action
      const existing = state.cart.find((i) => i.zoneId === zoneId)
      const cart = existing
        ? state.cart.map((i) => (i.zoneId === zoneId ? { ...i, qty: i.qty + qty } : i))
        : [...state.cart, { eventId, zoneId, qty }]
      return { ...state, cart }
    }

    case ACTIONS.SET_QTY:
      return {
        ...state,
        cart: state.cart.map((i) => (i.zoneId === action.zoneId ? { ...i, qty: action.qty } : i)),
      }

    case ACTIONS.REMOVE_FROM_CART:
      return { ...state, cart: state.cart.filter((i) => i.zoneId !== action.zoneId) }

    case ACTIONS.CLEAR_CART:
      return { ...state, cart: [] }

    case ACTIONS.SET_SIMULATE_ERROR:
      return { ...state, prefs: { ...state.prefs, simulateError: action.value } }

    default:
      return state
  }
}
