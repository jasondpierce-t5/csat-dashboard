import { useState, Fragment } from 'react'

export default function DataTable({ title, columns, data, timestamp, onRowClick }) {
  const [expandedRowIdx, setExpandedRowIdx] = useState(null)

  const getRatingBadgeClass = (rating) => {
    switch (rating) {
      case 'Gold Star':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Yellow Light':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Red Light':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  const getStatusClass = (value, type) => {
    if (type === 'date') {
      const date = new Date(value)
      const now = new Date()
      const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24))

      if (daysUntil < 0) return 'status-badge--urgent'
      if (daysUntil <= 30) return 'status-badge--urgent'
      if (daysUntil <= 90) return 'status-badge--warning'
      return ''
    }
    return ''
  }

  const formatValue = (value, column) => {
    if (column.type === 'date' && value) {
      const date = new Date(value)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
    if (column.type === 'link') {
      return (
        <span
          className="text-accent-blue hover:text-accent-blue/80 cursor-pointer underline"
          onClick={(e) => {
            e.stopPropagation()
            if (onRowClick) onRowClick(column.key, value)
          }}
        >
          {value}
        </span>
      )
    }
    if (column.type === 'rating') {
      return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getRatingBadgeClass(value)}`}>
          {value}
        </span>
      )
    }
    if (column.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
      }).format(value)
    }
    if (column.type === 'percent') {
      return `${value}%`
    }
    return value
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

      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} style={col.width ? { width: col.width } : {}}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-slate-400 py-8">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <Fragment key={rowIdx}>
                  <tr
                    data-row={rowIdx}
                    onClick={() => setExpandedRowIdx(expandedRowIdx === rowIdx ? null : rowIdx)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    {columns.map((col, colIdx) => {
                      const value = row[col.key]
                      const statusClass = col.highlight ? getStatusClass(value, col.type) : ''

                      return (
                        <td key={colIdx}>
                          {statusClass ? (
                            <span className={`status-badge ${statusClass}`}>
                              {formatValue(value, col)}
                            </span>
                          ) : (
                            formatValue(value, col)
                          )}
                        </td>
                      )
                    })}
                  </tr>
                  {expandedRowIdx === rowIdx && (
                    <tr key={`${rowIdx}-detail`}>
                      <td colSpan={columns.length} className="bg-slate-50 p-4">
                        <div className="text-sm">
                          <h4 className="font-semibold text-slate-700 mb-3">Response Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Object.entries(row).map(([key, value]) => (
                              <div key={key} className="bg-white p-3 rounded border border-slate-200">
                                <div className="text-xs text-slate-500 mb-1">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </div>
                                <div className="text-slate-700 font-medium">
                                  {key === 'rating' ? (
                                    <span className={`px-2 py-0.5 text-xs rounded border ${getRatingBadgeClass(value)}`}>
                                      {value || '-'}
                                    </span>
                                  ) : key.includes('date') && value ? (
                                    new Date(value).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  ) : (
                                    value || '-'
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
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
