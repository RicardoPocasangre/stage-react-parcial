import { useMemo, useState } from 'react'
import { useLoaderData } from 'react-router'
import BarChart from '../../components/BarChart.jsx'
import Button from '../../components/Button.jsx'
import ColumnChart from '../../components/ColumnChart.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import Field from '../../components/Field.jsx'
import StatCard from '../../components/StatCard.jsx'
import { formatMoney } from '../../utils/format.js'
import { PERIODS, filterOrders, ordersToCsv, revenueByCategory, revenueByEvent, salesSeries, totals } from './stats.js'

// Reportes dinámicos construidos a partir de las órdenes: se recalculan al
// cambiar el evento o el periodo.
export default function ReportsTab() {
  const { events, orders } = useLoaderData()
  const [eventId, setEventId] = useState('')
  const [period, setPeriod] = useState('30')

  const filtered = useMemo(() => filterOrders(orders, { eventId, period }), [orders, eventId, period])
  const sum = totals(filtered)
  const titleOf = (id) => events.find((e) => e.id === id)?.title ?? 'Evento eliminado'

  const downloadCsv = () => {
    const blob = new Blob([ordersToCsv(filtered, events)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `reporte-stage-${period}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="reports">
      <form className="report-filters" onSubmit={(e) => e.preventDefault()} aria-label="Filtros del reporte">
        <Field as="select" label="Evento" value={eventId} onChange={(e) => setEventId(e.target.value)}>
          <option value="">Todos los eventos</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.title}</option>
          ))}
        </Field>
        <Field as="select" label="Periodo" value={period} onChange={(e) => setPeriod(e.target.value)}>
          {Object.entries(PERIODS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Field>
        <Button variant="secondary" onClick={downloadCsv} disabled={filtered.length === 0}>
          Descargar CSV
        </Button>
      </form>

      <div className="stats" role="status" aria-live="polite">
        <StatCard label="Ingresos" value={formatMoney(sum.revenue)} hint={PERIODS[period]} />
        <StatCard label="Boletos vendidos" value={sum.tickets} />
        <StatCard label="Órdenes pagadas" value={sum.orders} />
        <StatCard label="Ticket promedio" value={formatMoney(sum.average)} hint="Por orden" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Sin ventas en este periodo">Prueba con otro evento o un periodo más amplio.</EmptyState>
      ) : (
        <>
          <ColumnChart title="Ventas en el periodo" data={salesSeries(filtered, period)} format={formatMoney} />
          <div className="dash-charts">
            <BarChart title="Ingresos por evento" data={revenueByEvent(filtered, events)} format={formatMoney} />
            <BarChart title="Ingresos por categoría" data={revenueByCategory(filtered, events)} format={formatMoney} />
          </div>

          <div className="table-wrap">
            <table className="table">
              <caption className="visually-hidden">Órdenes incluidas en el reporte</caption>
              <thead>
                <tr>
                  <th scope="col">Orden</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Evento</th>
                  <th scope="col">Boletos</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id.toUpperCase()}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString('es-SV')}</td>
                      <td>{titleOf(o.eventId)}</td>
                      <td>{o.qty}</td>
                      <td>{formatMoney(o.total)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
