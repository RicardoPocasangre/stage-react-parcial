# STAGE · Implementación React del MVP

Aplicación React que reproduce los flujos principales del prototipo de Figma de **STAGE**, una plataforma de venta y gestión de boletos para eventos. Es la entrega parcial del Proyecto 3: componentes reutilizables, estado local, eventos, listas, formularios, efectos y persistencia en el navegador. No hay backend, base de datos, pago real ni envío real de correos.

## Descripción

- **Público:** listado de eventos con búsqueda y filtros, detalle con zonas y precios, carrito y compra en cuatro pasos con pago simulado, boleto con código QR.
- **Cuenta:** inicio de sesión, registro, recuperación de contraseña y perfil, todo con sesión simulada.
- **Administración:** dashboard, listado de eventos, inventario y precios, usuarios y reportes con gráficos estáticos.

Se cubren los **ocho módulos** del MVP: usuarios y autenticación, eventos, inventario y precios, proceso de compra, pagos, boletos electrónicos, panel de administración y reportes.

## Instalación y ejecución

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # genera dist/
npm run preview   # sirve el build
```

## Cuentas de demostración

Las contraseñas son ficticias y solo existen en este proyecto académico.

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Cliente | cliente@stage.test | Cliente123 |
| Administrador | admin@stage.test | Admin123 |
| Organizador | organizador@stage.test | Organizador123 |

Para probar el pago: la tarjeta `4242 4242 4242 4242` se aprueba; una terminada en `0000` se rechaza. El interruptor **Simular error de red** del pie de página fuerza los estados de error en todas las operaciones asíncronas.

## Estructura

```
.
├── docs/                  # arquitectura y capturas en los tres breakpoints
├── public/img/            # logotipo, favicon e íconos de la marca
└── src/
    ├── api/               # API simulada (promesas con latencia y errores)
    ├── components/        # componentes reutilizables del Design System
    ├── data/              # eventos, usuarios y órdenes de ejemplo
    ├── hooks/             # useLocalStorage y useAsync
    ├── styles/            # tokens, base y una hoja por área
    ├── utils/             # formato y validación
    ├── views/             # pantallas (y views/admin/ con las secciones del panel)
    ├── App.jsx            # estado compartido y selección de vista
    └── main.jsx
```

## Inventario de componentes

| Componente | Uso |
| --- | --- |
| `Button`, `Badge`, `Chip`, `Notice` | Elementos básicos con variantes y tonos |
| `Field`, `QuantityInput`, `SearchBar` | Entradas controladas con etiqueta, ayuda y error accesibles |
| `Header`, `Footer`, `Link`, `Stepper` | Estructura y navegación |
| `EventCard`, `ZoneOption`, `CartLine`, `OrderSummary`, `PaymentForm`, `Confirmation` | Catálogo, carrito, pago y confirmación |
| `TicketCard` | Boleto con QR generado en el cliente |
| `LoadingState`, `ErrorState`, `EmptyState` | Estados asíncronos |
| `StatCard`, `BarChart`, `ColumnChart` | Panel y reportes |
| `AuthCard` | Pantallas de autenticación |

## Mapa de estado y persistencia

El estado compartido vive en `App` y baja a las vistas por props (estado elevado). Los datos persistentes usan `useLocalStorage`:

| Clave en `localStorage` | Contenido |
| --- | --- |
| `stage.events.v2` | Catálogo con zonas, precios y boletos vendidos |
| `stage.orders.v2` | Órdenes pagadas |
| `stage.users` | Cuentas (contraseña con hash simulado) |
| `stage.session` | Id del usuario con sesión |
| `stage.cart` | Líneas del carrito |
| `stage.prefs` | Preferencias (simulación de errores) |

El estado de cada vista (filtros, paso del checkout, formularios, pestañas) es local o se eleva solo cuando otra vista lo necesita. Los filtros del listado viven en `App` para conservarse al volver desde el detalle.

## Datos simulados

Los ocho eventos del prototipo de Figma (con sus recintos y precios), las categorías Concierto, Teatro y Deporte, de dos a tres zonas por evento con precio, capacidad y boletos vendidos; tres cuentas de demostración y doce órdenes de ejemplo de los últimos días para el panel y los reportes. Se encuentran en `src/data/events.js`.

## Responsive y accesibilidad

Tres breakpoints: móvil 375 px (base), tablet 768 px y escritorio 1440 px (reglas desde 1024 px). HTML semántico, etiquetas asociadas a cada campo, mensajes de error con `role="alert"`, navegación por teclado, foco visible, enlace para saltar al contenido, textos alternativos y respeto de `prefers-reduced-motion`. Las capturas de las pantallas principales (listado, detalle, carrito, boletos y panel de administración) están en [`docs/capturas`](docs/capturas), en móvil 375 px, tablet 768 px y escritorio 1440 px.

## Limitaciones y decisiones de diseño

- **Sin React Router:** la navegación se resuelve con estado de vista, como permite esta entrega; el botón «atrás» del navegador no cambia de pantalla.
- **Autenticación simulada:** el hash de contraseña es solo ilustrativo; no ofrece seguridad real.
- **Pago simulado:** no se guarda ningún dato de tarjeta.
- **Inventario:** la disponibilidad se descuenta al pagar y se vuelve a verificar justo antes de cobrar.
- **Gráficos:** construidos con HTML y CSS, sin librerías; el QR usa `qrcode.react`.
- **Fuente:** *Plus Jakarta Sans* desde Google Fonts; sin conexión se usa la del sistema.

Documento de arquitectura: [`docs/arquitectura.md`](docs/arquitectura.md).

## Fidelidad al prototipo de Figma

La app sigue las pantallas de la página «03 Mockups y Prototipo» del Figma de la Primera entrega:

| Pantalla de Figma | Vista en la app |
| --- | --- |
| W01 Inicio de sesión, W02 Registro, W03 Recuperar contraseña | LoginView, RegisterView, RecoverView |
| W04 Perfil de usuario | ProfileView (datos personales y seguridad) |
| W05 Listado y búsqueda, W05b Sin resultados | EventsView |
| W06 Detalle del evento | EventDetailView |
| W08 Carrito, W09 Pago, W10 Confirmación y boleto | CartView (con PaymentForm y Confirmation) |
| W11 Mis boletos | TicketsView |
| W12 Panel, W13 Eventos, W14 Inventario y precios, W15 Usuarios, W16 Reportes | AdminView y iews/admin/ |

Diferencias conocidas respecto al prototipo:

- **Selección de asientos (W07):** la app elige zona y cantidad; no hay mapa de asientos numerados.
- **Reserva de 10 minutos del carrito (W08):** no se implementa la cuenta regresiva.
- **Descargar boletos (W10):** no se implementa; los boletos se consultan en «Mis boletos».
- **Eliminar evento (W13b):** el panel permite publicar, despublicar y finalizar eventos, pero no eliminarlos.
- **Tendencias de los KPI (por ejemplo «+12 % vs. mes anterior»):** se omiten porque los datos simulados no tienen un mes anterior.
- **Fechas de algunos eventos:** las del prototipo no se leían con claridad y se eligieron fechas coherentes.