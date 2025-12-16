import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const CHART_COLORS = {
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f39c12',
  red: '#e74c3c',
  purple: '#9b59b6',
  teal: '#1abc9c',
  orange: '#e67e22',
  pink: '#e84393',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-lg">
        <p className="text-slate-700 font-medium text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-1 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-500">{entry.name}:</span>
            <span className="font-medium" style={{ color: entry.color }}>
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
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
            className="legend-line"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function MetricLineChart({
  title,
  data,
  lines,
  xAxisKey = 'month',
  yAxisFormatter,
  timestamp,
  height = 280,
}) {
  if (!data || data.length === 0) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">{title}</h3>
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
        <h3 className="widget-title">{title}</h3>
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

      <div className="widget-body" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#ecf0f1"
              vertical={false}
            />
            <XAxis
              dataKey={xAxisKey}
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
              tickFormatter={yAxisFormatter}
              dx={-8}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {lines.map((line, index) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={CHART_COLORS[line.color] || line.color}
                strokeWidth={2}
                dot={{
                  fill: CHART_COLORS[line.color] || line.color,
                  strokeWidth: 0,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: CHART_COLORS[line.color] || line.color,
                  strokeWidth: 2,
                  stroke: 'white',
                }}
                strokeDasharray={line.dashed ? '5 5' : undefined}
              />
            ))}
          </LineChart>
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
