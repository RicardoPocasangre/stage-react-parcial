import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { ACTIONS, reducer } from './reducer.js'
import { readSession, writeSession } from './session.js'

// Context + useReducer: una única fuente de verdad para la sesión, el carrito
// y las preferencias. El estado se guarda en localStorage en cada cambio.
const KEYS = {
  cart: 'stage.cart.v3',
  prefs: 'stage.prefs.v3',
}

const load = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

const save = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Sin almacenamiento disponible la app sigue funcionando en memoria.
  }
}

const init = () => ({
  user: readSession(),
  cart: load(KEYS.cart, []),
  prefs: load(KEYS.prefs, { simulateError: false }),
})

const StateContext = createContext(null)
const DispatchContext = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  useEffect(() => writeSession(state.user), [state.user])
  useEffect(() => save(KEYS.cart, state.cart), [state.cart])
  useEffect(() => save(KEYS.prefs, state.prefs), [state.prefs])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

function useStoreState() {
  const state = useContext(StateContext)
  if (state === null) throw new Error('Falta <StoreProvider> en la raíz de la aplicación.')
  return state
}

function useStoreDispatch() {
  const dispatch = useContext(DispatchContext)
  if (dispatch === null) throw new Error('Falta <StoreProvider> en la raíz de la aplicación.')
  return dispatch
}

// ---- Hooks de consumo: cada vista toma solo lo que necesita, sin prop drilling ----

export function useSession() {
  const { user } = useStoreState()
  const dispatch = useStoreDispatch()
  return useMemo(
    () => ({
      user,
      isStaff: user?.role === 'administrador' || user?.role === 'organizador',
      isAdmin: user?.role === 'administrador',
      // La sesión se escribe de inmediato (además del efecto) para que los
      // loaders del router, que corren al navegar, ya vean al usuario nuevo.
      login: (nextUser) => {
        writeSession(nextUser)
        dispatch({ type: ACTIONS.LOGIN, user: nextUser })
      },
      updateUser: (patch) => {
        writeSession({ ...user, ...patch })
        dispatch({ type: ACTIONS.UPDATE_USER, patch })
      },
      logout: () => {
        writeSession(null)
        dispatch({ type: ACTIONS.LOGOUT })
      },
    }),
    [user, dispatch],
  )
}

export function useCart() {
  const { cart } = useStoreState()
  const dispatch = useStoreDispatch()
  return useMemo(
    () => ({
      items: cart,
      count: cart.reduce((sum, item) => sum + item.qty, 0),
      add: (item) => dispatch({ type: ACTIONS.ADD_TO_CART, ...item }),
      setQty: (zoneId, qty) => dispatch({ type: ACTIONS.SET_QTY, zoneId, qty }),
      remove: (zoneId) => dispatch({ type: ACTIONS.REMOVE_FROM_CART, zoneId }),
      clear: () => dispatch({ type: ACTIONS.CLEAR_CART }),
    }),
    [cart, dispatch],
  )
}

export function usePrefs() {
  const { prefs } = useStoreState()
  const dispatch = useStoreDispatch()
  return useMemo(
    () => ({
      simulateError: prefs.simulateError,
      setSimulateError: (value) => dispatch({ type: ACTIONS.SET_SIMULATE_ERROR, value }),
    }),
    [prefs, dispatch],
  )
}
