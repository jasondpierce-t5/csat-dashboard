import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const getBarColor = (satisfaction) => {
  if (satisfaction >= 90) return '#27ae60'
  if (satisfaction >= 80) return '#2ecc71'
  if (satisfaction >= 70) return '#f39c12'
  if (satisfaction >= 60) return '#e67e22'
  return '#e74c3c'
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-lg">
        <p className="text-slate-700 font-medium text-sm">{data.name}</p>
        <p className="font-medium" style={{ color: getBarColor(data.satisfaction) }}>
          {data.satisfaction}% satisfaction
        </p>
        <p className="text-slate-400 text-xs mt-1">{data.responses} responses</p>
      </div>
    )
  }
  return null
}

export default function TechPerformance({ data, timestamp }) {
  if (!data || data.length === 0) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">Technician Performance</h3>
        </div>
        <div className="widget-body h-64 flex items-center justify-center text-slate-400">
          No data available (minimum 5 responses required)
        </div>
      </div>
    )
  }

  const chartHeight = Math.max(280, data.length * 40)

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Technician Performance</h3>
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

      <div className="widget-body" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" horizontal={false} />
            <XAxis
              type="number"
              stroke="#95a5a6"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#dfe6e9' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#95a5a6"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(52, 152, 219, 0.08)' }} />
            <Bar dataKey="satisfaction" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.satisfaction)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#27ae60' }} />
          <span>90%+ Excellent</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#2ecc71' }} />
          <span>80-89% Good</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#f39c12' }} />
          <span>70-79% Fair</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: '#e74c3c' }} />
          <span>&lt;70% Needs Improvement</span>
        </div>
      </div>

      <div className="widget-footer flex justify-between">
        <div className="flex items-center gap-1">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{timestamp || 'Just now'}</span>
        </div>
        <span className="text-xs text-slate-400">* Minimum 5 responses to qualify</span>
      </div>
    </div>
  )
}
