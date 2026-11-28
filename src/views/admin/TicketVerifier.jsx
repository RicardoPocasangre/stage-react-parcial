import { useState } from 'react'
import Button from '../../components/Button.jsx'
import Field from '../../components/Field.jsx'
import Notice from '../../components/Notice.jsx'
import { parseTicketCode } from '../../utils/tickets.js'

// Verifica el código que codifica el QR de un boleto: comprueba el código de
// control y que la orden exista y tenga ese número de boleto.
export default function TicketVerifier({ orders, events }) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)

  const verify = (event) => {
    event.preventDefault()
    const parsed = parseTicketCode(code)
    if (!parsed.valid) {
      setResult({ tone: 'danger', text: 'Código no válido: el formato o el código de control no coinciden.' })
      return
    }
    const order = orders.find((o) => o.id === parsed.orderId)
    if (!order || parsed.number > order.qty) {
      setResult({ tone: 'danger', text: 'El código es auténtico, pero no corresponde a una orden registrada.' })
      return
    }
    const title = events.find((e) => e.id === order.eventId)?.title ?? 'Evento eliminado'
    setResult({
      tone: 'success',
      text: `Boleto válido: ${title}, zona ${order.zoneName}, boleto ${parsed.number} de ${order.qty}.`,
    })
  }

  return (
    <section aria-labelledby="verifier-title">
      <h2 className="section-title" id="verifier-title">Verificar boleto</h2>
      <form className="form verifier" onSubmit={verify} noValidate>
        <Field
          label="Código del boleto"
          hint="Está debajo del QR, por ejemplo STG-ORD-1001-01-XXXX."
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            setResult(null)
          }}
        />
        <Button type="submit">Verificar</Button>
      </form>
      {result && <Notice tone={result.tone}>{result.text}</Notice>}
    </section>
  )
}
