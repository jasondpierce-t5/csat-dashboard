import { useMemo } from 'react'

/**
 * DrillDownPanel - Expandable panel showing detailed data for a gauge
 *
 * @param {Object} props
 * @param {Object} props.config - The drill_down_config from gauge configuration
 * @param {Array} props.data - The drill-down data to display
 * @param {Function} props.onClose - Callback to close the panel
 */
export default function DrillDownPanel({ config, data, onClose }) {
  if (!config || !data) return null

  const { title, columns = [], type = 'table' } = config

  // Format columns for display
  const formattedColumns = useMemo(() => {
    if (Array.isArray(columns) && columns.length > 0) {
      // Handle both string array and object array formats
      return columns.map(col => {
        if (typeof col === 'string') {
          return {
            key: col,
            header: formatColumnHeader(col),
            type: inferColumnType(col)
          }
        }
        return col
      })
    }
    // Auto-detect columns from data
    if (data.length > 0) {
      return Object.keys(data[0]).slice(0, 5).map(key => ({
        key,
        header: formatColumnHeader(key),
        type: inferColumnType(key)
      }))
    }
    return []
  }, [columns, data])

  const formatValue = (value, column) => {
    if (value === null || value === undefined) return '-'

    switch (column.type) {
      case 'date':
        return new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      case 'datetime':
        return new Date(value).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(value)
      case 'percent':
        return `${value}%`
      case 'number':
        return value.toLocaleString()
      default:
        return String(value)
    }
  }

  const getRatingBadgeClass = (rating) => {
    switch (rating) {
      case 'Gold Star':
        return 'status-badge--success'
      case 'Yellow Light':
        return 'status-badge--warning'
      case 'Red Light':
        return 'status-badge--urgent'
      default:
        return 'status-badge--info'
    }
  }

  return (
    <div className="drill-down-panel mt-4 border-t border-slate-200 pt-4 animate-fade-in">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">
          {title || 'Details'}
        </h4>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-100 transition-colors"
          aria-label="Close details"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Table Content */}
      {type === 'table' && (
        <div className="overflow-x-auto max-h-64 overflow-y-auto">
          {data.length === 0 ? (
            <p className="text-center text-slate-400 py-4 text-sm">
              No data available
            </p>
          ) : (
            <table className="data-table text-sm">
              <thead className="sticky top-0 bg-white">
                <tr>
                  {formattedColumns.map((col, idx) => (
                    <th key={idx} className="text-xs">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {formattedColumns.map((col, colIdx) => {
                      const value = row[col.key]
                      const isRating = col.key === 'rating'

                      return (
                        <td key={colIdx} className="text-xs">
                          {isRating && value ? (
                            <span className={`status-badge ${getRatingBadgeClass(value)}`}>
                              {value}
                            </span>
                          ) : (
                            formatValue(value, col)
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Summary Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          Showing {data.length} record{data.length !== 1 ? 's' : ''}
        </span>
        {data.length > 0 && (
          <button className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors">
            Export
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Format a column key to a human-readable header
 */
function formatColumnHeader(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

/**
 * Infer column type from key name
 */
function inferColumnType(key) {
  const lowerKey = key.toLowerCase()

  if (lowerKey.includes('date')) return 'date'
  if (lowerKey.includes('time')) return 'datetime'
  if (lowerKey.includes('price') || lowerKey.includes('amount') || lowerKey.includes('cost')) {
    return 'currency'
  }
  if (lowerKey.includes('percent') || lowerKey.includes('rate')) return 'percent'
  if (lowerKey.includes('count') || lowerKey.includes('total') || lowerKey.includes('num')) {
    return 'number'
  }

  return 'text'
}
