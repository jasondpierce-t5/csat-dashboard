import KPICard from '../components/KPICard'
import RatingPieChart from '../components/RatingPieChart'
import SatisfactionTrend from '../components/SatisfactionTrend'
import TechPerformance from '../components/TechPerformance'
import MetricLineChart from '../components/MetricLineChart'
import DataTable from '../components/DataTable'

/**
 * Gauge Registry
 * Maps gauge type keys to React components and their configurations
 */
const gaugeRegistry = {
  kpi_card: {
    component: KPICard,
    displayName: 'KPI Card',
    supportsDrillDown: true,
    defaultConfig: {
      showChange: true
    },
    // Data transformer function name
    transformer: 'transformKPIData'
  },

  pie_chart: {
    component: RatingPieChart,
    displayName: 'Pie Chart',
    supportsDrillDown: true,
    defaultConfig: {},
    transformer: 'transformPieChartData'
  },

  line_chart: {
    component: SatisfactionTrend,
    displayName: 'Line Chart',
    supportsDrillDown: true,
    defaultConfig: {
      showTarget: true,
      targetValue: 90
    },
    transformer: 'transformLineChartData'
  },

  bar_chart: {
    component: TechPerformance,
    displayName: 'Bar Chart',
    supportsDrillDown: true,
    defaultConfig: {
      minResponses: 5
    },
    transformer: 'transformBarChartData'
  },

  multi_line_chart: {
    component: MetricLineChart,
    displayName: 'Multi-Line Chart',
    supportsDrillDown: false,
    defaultConfig: {},
    transformer: 'transformMultiLineData'
  },

  data_table: {
    component: DataTable,
    displayName: 'Data Table',
    supportsDrillDown: false,
    defaultConfig: {
      pageSize: 10
    },
    transformer: 'transformTableData'
  }
}

/**
 * Get gauge registration by type key
 * @param {string} typeKey - The gauge type key (e.g., 'kpi_card')
 * @returns {Object|null} The gauge registration or null if not found
 */
export function getGaugeRegistration(typeKey) {
  return gaugeRegistry[typeKey] || null
}

/**
 * Get gauge component by type key
 * @param {string} typeKey - The gauge type key
 * @returns {React.Component|null} The React component or null
 */
export function getGaugeComponent(typeKey) {
  const registration = gaugeRegistry[typeKey]
  return registration?.component || null
}

/**
 * Check if a gauge type supports drill-down
 * @param {string} typeKey - The gauge type key
 * @returns {boolean}
 */
export function supportsDrillDown(typeKey) {
  const registration = gaugeRegistry[typeKey]
  return registration?.supportsDrillDown || false
}

/**
 * Get default config for a gauge type
 * @param {string} typeKey - The gauge type key
 * @returns {Object} Default configuration object
 */
export function getDefaultConfig(typeKey) {
  const registration = gaugeRegistry[typeKey]
  return registration?.defaultConfig || {}
}

/**
 * Get all available gauge types
 * @returns {Array} Array of gauge type info
 */
export function getAllGaugeTypes() {
  return Object.entries(gaugeRegistry).map(([key, value]) => ({
    typeKey: key,
    displayName: value.displayName,
    supportsDrillDown: value.supportsDrillDown
  }))
}

/**
 * Register a new gauge type (for extensibility)
 * @param {string} typeKey - Unique type key
 * @param {Object} config - Gauge configuration
 */
export function registerGaugeType(typeKey, config) {
  if (gaugeRegistry[typeKey]) {
    console.warn(`Gauge type '${typeKey}' already exists. Overwriting.`)
  }
  gaugeRegistry[typeKey] = {
    component: config.component,
    displayName: config.displayName || typeKey,
    supportsDrillDown: config.supportsDrillDown || false,
    defaultConfig: config.defaultConfig || {},
    transformer: config.transformer || null
  }
}

export default gaugeRegistry
