import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-lg">
        <p className="text-slate-700 font-medium text-sm">{label}</p>
        <p className="text-accent-green font-medium">{payload[0].value}% satisfaction</p>
        <p className="text-slate-400 text-xs mt-1">{payload[0].payload.responses} responses</p>
      </div>
    )
  }
  return null
}

export default function SatisfactionTrend({ data, timestamp }) {
  if (!data || data.length === 0) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">Satisfaction Trend</h3>
        </div>
        <div className="widget-body h-64 flex items-center justify-center text-slate-400">
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">Satisfaction Trend</h3>
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
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#95a5a6"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#dfe6e9' }}
              dy={8}
            />
            <YAxis
              stroke="#95a5a6"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              dx={-8}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={90}
              stroke="#27ae60"
              strokeDasharray="5 5"
              label={{
                value: '90% Target',
                fill: '#27ae60',
                fontSize: 10,
                position: 'right'
              }}
            />
            <Line
              type="monotone"
              dataKey="satisfaction"
              stroke="#3498db"
              strokeWidth={2}
              dot={{ fill: '#3498db', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#3498db', strokeWidth: 2, stroke: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: '#3498db' }} />
          <span>Satisfaction %</span>
        </div>
        <div className="legend-item">
          <span className="legend-line" style={{ backgroundColor: '#27ae60', borderStyle: 'dashed' }} />
          <span>90% Target</span>
        </div>
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
