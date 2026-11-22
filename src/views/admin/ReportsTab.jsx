import BarChart from '../../components/BarChart.jsx'
import { CATEGORIES } from '../../data/events.js'
import { formatMoney } from '../../utils/format.js'
import { eventRevenue, occupancy } from './stats.js'

// Reportes estáticos: ingresos por evento, por categoría y ocupación.
export default function ReportsTab({ events }) {
  const byEvent = events.map((e) => ({ label: e.title, value: eventRevenue(e) }))
  const byOccupancy = events.map((e) => ({ label: e.title, value: occupancy(e) }))
  const byCategory = CATEGORIES.map((c) => ({
    label: c,
    value: events.filter((e) => e.category === c).reduce((s, e) => s + eventRevenue(e), 0),
  })).filter((d) => d.value > 0)

  return (
    <div className="reports">
      <BarChart title="Ingresos por evento" data={byEvent} format={formatMoney} />
      <BarChart title="Ingresos por categoría" data={byCategory} format={formatMoney} />
      <BarChart title="Ocupación por evento" data={byOccupancy} format={(v) => `${v} %`} />
    </div>
  )
}
