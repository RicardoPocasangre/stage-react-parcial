# Arquitectura de componentes y flujo de estado

## Capas

```
views/            pantallas; reciben el estado compartido por props
  └─ components/  piezas reutilizables y sin lógica de negocio
hooks/            useLocalStorage (persistencia), useAsync (carga/error/éxito)
api/              fakeApi: promesas con latencia y errores opcionales
data/ utils/      datos simulados, formato y validación
```

Regla de dependencias: `views` usa `components`, `hooks`, `api`, `utils` y `data`; `components` solo usa `utils` y `data`; `api` y `utils` no dependen de React.

## Estado

`App` es la única raíz de estado compartido:

```
App
├─ route            vista actual { name, params }
├─ events           catálogo (localStorage)
├─ orders           órdenes (localStorage)
├─ users / session  cuentas y sesión (localStorage)
├─ cart             líneas del carrito (localStorage)
├─ prefs            preferencias (localStorage)
└─ filters          búsqueda y categoría del listado
```

Se pasa a cada vista un objeto `shared` con los datos, los setters y `navigate`. El estado derivado (usuario actual, total del carrito, boletos por orden, métricas del panel) se calcula en el momento y no se duplica.

## Flujo de compra

```
Detalle ──addToCart──▶ cart ──▶ Carrito ──▶ Pago ──▶ Confirmación
                                  │                      │
                       cantidades y quitar        validar tarjeta y correo
                                                   comprobar disponibilidad
                                                   api.pay()  (async)
                                                   ├─ éxito: crea órdenes, suma `sold`, vacía el carrito
                                                   └─ error: mensaje y reintento, sin duplicar el cobro
```

Cada vista que consulta la API usa `useAsync`, que expone `loading`, `error` y `success`, permite reintentar y descarta respuestas obsoletas en la limpieza del efecto.

## Efectos

| Efecto | Dónde | Limpieza |
| --- | --- | --- |
| Guardar en `localStorage` al cambiar el estado | `useLocalStorage` | — |
| Consulta asíncrona a la API simulada | `useAsync` | Marca la respuesta como obsoleta |
| Aviso de «agregado al carrito» que se oculta solo | `EventDetailView` | `clearTimeout` |
| Título, scroll y foco al cambiar de vista | `App` | — |
| Evitar `setState` tras desmontar durante el pago | `CartView` | Bandera `mounted` |
