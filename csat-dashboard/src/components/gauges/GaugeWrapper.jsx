import { useMemo, useState, Component } from 'react'
import { useDashboard, useFilteredData } from '../../context/DashboardContext'
import { useGaugeData, useDrillDownData } from '../../hooks/useGaugeData'
import { supportsDrillDown } from '../../config/gaugeRegistry'
import GaugeRenderer, { GaugeGridItem } from './GaugeRenderer'
import DrillDownPanel from './DrillDownPanel'

/**
 * Error boundary to catch rendering errors in gauges
 */
class GaugeErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Gauge rendering error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget-card">
          <div className="widget-header">
            <h3 className="widget-title">{this.props.title || 'Error'}</h3>
          </div>
          <div className="widget-body h-32 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-accent-red">Failed to render gauge</p>
              <p className="text-xs mt-1">{this.state.error?.message}</p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * GaugeWrapper - Wraps gauge components with drill-down functionality
 *
 * @param {Object} props
 * @param {Object} props.gaugeConfig - The gauge configuration from database
 */
export default function GaugeWrapper({ gaugeConfig, onLinkClick }) {
  const {
    expandedGaugeId,
    toggleExpandedGauge,
    lastUpdated,
    isLoading
  } = useDashboard()

  const filteredData = useFilteredData()

  // Transform data for the gauge
  const transformedData = useGaugeData(gaugeConfig, filteredData)

  // Get drill-down data if expanded
  const isExpanded = expandedGaugeId === gaugeConfig.id
  const drillDownData = useDrillDownData(gaugeConfig, filteredData)

  // Check if this gauge type supports drill-down
  const hasDrillDown = useMemo(() => {
    const typeKey = gaugeConfig?.gauge_type?.type_key
    return typeKey && supportsDrillDown(typeKey) && gaugeConfig?.drill_down_config
  }, [gaugeConfig])

  // Format timestamp
  const timestamp = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now'

  // Handle expand toggle
  const handleExpand = hasDrillDown
    ? () => toggleExpandedGauge(gaugeConfig.id)
    : undefined

  // Handle close drill-down
  const handleClose = () => toggleExpandedGauge(gaugeConfig.id)

  return (
    <GaugeGridItem position={gaugeConfig.position}>
      <GaugeErrorBoundary title={gaugeConfig?.title}>
        <div className={`gauge-wrapper ${isExpanded ? 'gauge-wrapper--expanded' : ''}`}>
          <GaugeRenderer
            gaugeConfig={gaugeConfig}
            data={transformedData}
            timestamp={timestamp}
            isExpanded={isExpanded}
            onExpand={handleExpand}
            isLoading={isLoading}
            onLinkClick={onLinkClick}
          />

          {/* Drill-down panel */}
          {isExpanded && hasDrillDown && (
            <DrillDownPanel
              config={gaugeConfig.drill_down_config}
              data={drillDownData}
              onClose={handleClose}
            />
          )}
        </div>
      </GaugeErrorBoundary>
    </GaugeGridItem>
  )
}

/**
 * Render a section of gauges
 */
export function GaugeSection({ title, gauges, defaultExpanded = true, onLinkClick }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (!gauges || gauges.length === 0) return null

  // Calculate grid layout
  const gridColumns = Math.max(
    ...gauges.map(g => (g.position?.col || 0) + (g.position?.width || 1)),
    4
  )

  return (
    <section className="mb-6">
      <div
        className="section-header cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>{title}</span>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`
          }}
        >
          {gauges.map(gauge => (
            <GaugeWrapper key={gauge.id} gaugeConfig={gauge} onLinkClick={onLinkClick} />
          ))}
        </div>
      </div>
    </section>
  )
}

