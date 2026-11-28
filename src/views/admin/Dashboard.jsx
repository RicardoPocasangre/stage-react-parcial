import { useLoaderData } from 'react-router'
import Badge from '../../components/Badge.jsx'
import BarChart from '../../components/BarChart.jsx'
import ColumnChart from '../../components/ColumnChart.jsx'
import StatCard from '../../components/StatCard.jsx'
import { formatMoney } from '../../utils/format.js'
import TicketVerifier from './TicketVerifier.jsx'
import { salesLast7Days, summary, topEvents } from './stats.js'

const STATUS = { pagada: ['success', 'Pagado'], pendiente: ['warning', 'Pendiente'] }

// Resumen: KPIs, ventas de los últimos 7 días, eventos con más ventas y compras recientes.
export default function Dashboard() {
  const { events, orders, users } = useLoaderData()
  const s = summary(events)
  const recent = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
  const titleOf = (id) => events.find((e) => e.id === id)?.title ?? 'Evento eliminado'
  const clientOf = (id) => users.find((u) => u.id === id)?.name ?? 'Cliente'

  return (
    <>
      <div className="stats">
        <StatCard label="Ventas totales" value={formatMoney(s.revenue)} hint="Boletos vendidos × precio" />
        <StatCard label="Boletos vendidos" value={s.sold.toLocaleString('es-SV')} />
        <StatCard label="Eventos activos" value={s.active} />
        <StatCard label="Ocupación promedio" value={`${s.occupancy} %`} hint="Vendidos sobre capacidad" />
      </div>

      <div className="dash-charts">
        <ColumnChart title="Ventas de los últimos 7 días" data={salesLast7Days(orders)} format={formatMoney} />
        <BarChart title="Eventos con más ventas" data={topEvents(events)} format={(v) => `${v} boletos`} />
      </div>

      <h2 className="section-title">Compras recientes</h2>
      <div className="table-wrap">
        <table className="table">
          <caption className="visually-hidden">Últimas cinco compras</caption>
          <thead>
            <tr>
              <th scope="col">Orden</th>
              <th scope="col">Cliente</th>
              <th scope="col">Evento</th>
              <th scope="col">Total</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => {
              const [tone, label] = STATUS[o.status] ?? ['neutral', o.status]
              return (
                <tr key={o.id}>
                  <td>#{o.id.toUpperCase()}</td>
                  <td>{clientOf(o.userId)}</td>
                  <td>{titleOf(o.eventId)}</td>
                  <td>{formatMoney(o.total)}</td>
                  <td><Badge tone={tone}>{label}</Badge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <TicketVerifier orders={orders} events={events} />
    </>
  )
}
