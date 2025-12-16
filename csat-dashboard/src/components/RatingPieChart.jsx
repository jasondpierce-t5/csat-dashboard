import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-lg">
        <p className="text-slate-700 font-medium text-sm">{data.name}</p>
        <p className="text-slate-500 text-sm">{data.value} responses</p>
        <p className="text-slate-400 text-xs mt-1">
          {((data.value / data.total) * 100).toFixed(1)}% of total
        </p>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }) => {
  return (
    <div className="chart-legend">
      {payload.map((entry, index) => (
        <div key={index} className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function RatingPieChart({ data, timestamp }) {
  if (!data || data.length === 0) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">Rating Distribution</h3>
        </div>
        <div className="widget-body h-64 flex items-center justify-center text-slate-400">
          No data available
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithTotal = data.map(item => ({ ...item, total }))

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Rating Distribution</h3>
        <div className="widget-menu">
          <button className="p-1 rounded hover:bg-slate-100 transition-colors">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="widget-body h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithTotal}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {dataWithTotal.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {timestamp && (
        <div className="widget-footer">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{timestamp}</span>
        </div>
      )}
    </div>
  )
}
