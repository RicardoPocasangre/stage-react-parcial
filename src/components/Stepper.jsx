// Los cuatro pasos del prototipo: la selección ocurre en el detalle del evento.
export const PURCHASE_STEPS = ['Selección', 'Carrito', 'Pago', 'Confirmación']

// Indicador de progreso del flujo de compra.
export default function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Progreso de la compra">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo'
        return (
          <li
            key={step}
            className={`stepper__item is-${state}`}
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <span className="stepper__dot" aria-hidden="true">
              {state === 'done' ? '✓' : index + 1}
            </span>
            <span className="stepper__label">{step}</span>
          </li>
        )
      })}
    </ol>
  )
}
