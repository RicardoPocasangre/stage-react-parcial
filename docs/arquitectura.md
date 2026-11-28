# Arquitectura y decisiones de diseño

## Capas

```
views/            pantallas: leen datos del router (loaders) y del Context
  └─ components/  piezas reutilizables del Design System
state/            Context + useReducer: sesión, carrito y preferencias
api/              capa de acceso a datos sobre una API falsa (fetch + localStorage)
loaders.js        funciones que el router ejecuta antes de pintar una ruta
data/ utils/      constantes del dominio, formato, validación, carrito y boletos
```

Regla de dependencias: `views` usa `components`, `state`, `api` (solo a través de loaders o de acciones del usuario) y `utils`; `components` no conoce a `views`; `api` y `utils` no dependen de React.

## Enrutamiento

`createBrowserRouter` + `RouterProvider` (modo datos) en `src/router.jsx`:

```
/ (RootLayout: encabezado, <main>, pie, avisos PWA)
 └─ ErrorBoundary (RouteError) ── los errores se muestran dentro del layout
     ├─ /  /eventos  /eventos/:id  /carrito  /checkout  /login  /registro  /recuperar
     ├─ ProtectedRoute (sesión) ── /boletos  /perfil
     ├─ /admin → ProtectedRoute (administrador u organizador)
     │     └─ AdminLayout ── index, eventos, inventario
     │            └─ ProtectedRoute (administrador) ── reportes, usuarios
     └─ *  → 404
```

- **Rutas protegidas:** `ProtectedRoute` redirige a `/login?redirect=<ruta>` sin sesión y muestra 403 si el rol no alcanza. Es un componente reactivo: si la persona cierra sesión estando dentro, la ruta se protege al instante.
- **Datos antes de pintar:** cada ruta declara su `loader`. El router pasa un `request.signal` que se cancela al abandonar la ruta, y se reenvía a la API.
- **Carga diferida:** las secciones del panel usan `lazy` (code splitting), por lo que un cliente nunca descarga ese código.
- **Filtros en la URL:** el listado usa `?q=&categoria=&orden=`; se pueden compartir y sobreviven a recargar.
- **Subruta de GitHub Pages:** `basename` sale de `import.meta.env.BASE_URL`; `404.html` es copia de `index.html`.

## Estado global

Context + `useReducer` (`src/state`). Un solo reducer con acciones explícitas, dos contextos (estado y `dispatch`) y tres hooks de consumo (`useSession`, `useCart`, `usePrefs`). Persiste en `localStorage` en cada cambio; la sesión se escribe además de forma síncrona al iniciar o cerrar sesión, porque los loaders del router corren al navegar, antes de que React ejecute los efectos.

**Qué no va en el Context:** los datos de negocio (eventos, órdenes, usuarios) pertenecen a la API y llegan por loaders; el estado de formularios y de pasos es local. Así no se duplica información y no hay prop drilling.

## API falsa

`src/api` es la única capa que sabe de dónde salen los datos:

```
loader / formulario ──▶ api.events.list() ──▶ gate()           latencia + «Simular error de red»
                                        └──▶ readCollection()   localStorage si ya hay cambios, si no fetch a public/api/*.json
                       api.events.update() ─▶ writeCollection() persiste en localStorage
```

- Todas las funciones reciben `{ signal }` y las esperas simuladas son cancelables (`AbortController`).
- Los errores son `ApiError` con mensaje en español y código HTTP simulado (404, 409, 422…): `RouteError` y los formularios los muestran tal cual.
- Es una API falsa local (estrategia 2 del enunciado): lee JSON, simula latencia y persiste las mutaciones en `localStorage`.

## Flujo de compra

```
Detalle ──cart.add──▶ Context ──▶ /carrito ──▶ /checkout ──▶ confirmación + QR
                                                   │
                                  validar tarjeta · comprobar disponibilidad
                                  api.orders.checkout()  (cobro simulado)
                                  ├─ éxito: crea órdenes, suma `sold`, vacía el carrito
                                  └─ error: mensaje y reintento, sin doble envío (ref `submitting`)
```

## Panel administrativo

CRUD de eventos (crear, editar, publicar, finalizar y eliminar con confirmación), edición de precios y capacidad por zona (la capacidad no puede bajar de lo vendido), usuarios y reportes dinámicos por evento y periodo calculados desde las órdenes. Después de cada mutación se llama a `revalidate()` y los loaders reconsultan la API.

## PWA

| Recurso | Estrategia | Razón |
| --- | --- | --- |
| App shell (HTML, JS, CSS, íconos) | Precache | La app abre sin conexión y siempre con una versión coherente |
| `/api/*.json` | `NetworkFirst` (4 s de espera) | Datos frescos si hay red; última respuesta si no |
| Imágenes | `CacheFirst` | Cambian poco; ahorran datos |
| Fuentes | `StaleWhileRevalidate` / `CacheFirst` | Evitan texto sin estilo sin conexión |
| Navegación | `navigateFallback` → `index.html` | Cualquier ruta de la SPA carga offline |

`registerType: 'prompt'`: la nueva versión no reemplaza a la actual sin permiso; el usuario decide en el aviso «Actualizar». Al iniciar, la app pide una vez las colecciones semilla para que queden en la caché de la API aunque no se hayan visitado esas pantallas.

## Decisiones

- **Rutas en español** (`/eventos`, `/carrito`, `/boletos`…) para coincidir con el enunciado.
- **Un solo `reducer`** en lugar de varios Context: el estado es pequeño y las acciones quedan documentadas en un solo lugar.
- **Hash de contraseña simulado** y credenciales de demostración documentadas: no se guardan secretos reales.
- **QR con control**: el código incluye un dígito de control derivado de la orden, de modo que un QR alterado no pasa la verificación.
- **Sin backend**: toda la persistencia es `localStorage`; se documentan las limitaciones en el README.
