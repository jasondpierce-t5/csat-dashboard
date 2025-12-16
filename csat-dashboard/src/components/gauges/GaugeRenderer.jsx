import { useMemo } from 'react'
import { getGaugeComponent, getDefaultConfig } from '../../config/gaugeRegistry'

/**
 * GaugeRenderer - Dynamically renders gauge components based on configuration
 *
 * @param {Object} props
 * @param {Object} props.gaugeConfig - The gauge configuration from database
 * @param {Object} props.data - Transformed data for this gauge
 * @param {string} props.timestamp - Last updated timestamp
 * @param {boolean} props.isExpanded - Whether drill-down is expanded
 * @param {Function} props.onExpand - Callback to toggle drill-down
 * @param {boolean} props.isLoading - Loading state
 */
export default function GaugeRenderer({
  gaugeConfig,
  data,
  timestamp,
  isExpanded = false,
  onExpand,
  isLoading = false
}) {
  const typeKey = gaugeConfig?.gauge_type?.type_key

  // Get the component from registry
  const GaugeComponent = useMemo(() => {
    if (!typeKey) {
      console.warn('GaugeRenderer: No gauge type key found in config')
      return null
    }
    return getGaugeComponent(typeKey)
  }, [typeKey])

  // Merge default config with gauge-specific display config
  const mergedDisplayConfig = useMemo(() => {
    const defaultConfig = typeKey ? getDefaultConfig(typeKey) : {}
    return {
      ...defaultConfig,
      ...(gaugeConfig?.display_config || {})
    }
  }, [gaugeConfig, typeKey])

  // Build props based on gauge type
  const componentProps = useMemo(() => {
    const baseProps = {
      title: gaugeConfig?.title,
      timestamp,
      isExpanded,
      onExpand
    }

    // Handle different gauge types with their expected prop formats
    switch (typeKey) {
      case 'kpi_card': {
        // KPICard expects: title, value, subtitle, change, changeType
        const value = data?.value ?? 0
        const format = data?.format || 'number'
        const formattedValue = format === 'percent' ? `${value}%` : value.toLocaleString()

        return {
          ...baseProps,
          value: formattedValue,
          subtitle: mergedDisplayConfig.subtitle,
          change: mergedDisplayConfig.showChange ? data?.change : undefined,
          changeType: data?.changeType
        }
      }

      case 'pie_chart':
        // RatingPieChart expects: data (array with name, value, color)
        return {
          ...baseProps,
          data: data || []
        }

      case 'line_chart':
        // SatisfactionTrend expects: data (array with month, satisfaction)
        return {
          ...baseProps,
          data: data || [],
          targetValue: mergedDisplayConfig.targetValue || 90
        }

      case 'bar_chart':
        // TechPerformance expects: data (array with name, satisfaction, total)
        return {
          ...baseProps,
          data: data || [],
          minResponses: mergedDisplayConfig.minResponses || 5
        }

      case 'multi_line_chart':
        // MetricLineChart expects: data, lines config, xAxisKey
        return {
          ...baseProps,
          data: data?.chartData || [],
          lines: data?.lines || [],
          xAxisKey: 'month'
        }

      case 'data_table': {
        // DataTable expects: data, columns
        const dataConfig = gaugeConfig?.data_config || {}
        return {
          ...baseProps,
          data: data || [],
          columns: dataConfig.columns || []
        }
      }

      default:
        return {
          ...baseProps,
          data,
          ...mergedDisplayConfig
        }
    }
  }, [typeKey, gaugeConfig, data, timestamp, isExpanded, onExpand, mergedDisplayConfig])

  // If no component found, show error state
  if (!GaugeComponent) {
    return (
      <div className="widget-card">
        <div className="widget-header">
          <h3 className="widget-title">{gaugeConfig?.title || 'Unknown Gauge'}</h3>
        </div>
        <div className="widget-body h-32 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <p>Unknown gauge type</p>
            <p className="text-xs mt-1">{typeKey}</p>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="widget-card animate-pulse">
        <div className="widget-header">
          <div className="h-4 bg-slate-200 rounded w-32" />
        </div>
        <div className="widget-body h-32 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Render the gauge component with props
  return <GaugeComponent {...componentProps} />
}

/**
 * Helper component to render gauges in a grid based on position config
 */
export function GaugeGrid({ children, columns = 4 }) {
  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
      }}
    >
      {children}
    </div>
  )
}

/**
 * Wrapper for positioning gauges in the grid
 */
export function GaugeGridItem({ position, children }) {
  const style = useMemo(() => {
    if (!position) return {}

    return {
      gridColumn: position.width > 1 ? `span ${position.width}` : undefined,
      gridRow: position.height > 1 ? `span ${position.height}` : undefined
    }
  }, [position])

  return (
    <div style={style}>
      {children}
    </div>
  )
}
