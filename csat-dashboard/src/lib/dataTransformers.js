/**
 * Data Transformers
 * Utility functions for transforming raw data based on gauge configurations
 */

/**
 * Calculate percentage based on a filter condition
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration
 * @returns {number} Percentage value
 */
export function calculatePercentage(data, config) {
  if (!data || data.length === 0) return 0

  const { numerator_field, numerator_value } = config
  const numerator = data.filter(item => item[numerator_field] === numerator_value).length
  const denominator = data.length

  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0
}

/**
 * Calculate count (optionally filtered)
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration
 * @returns {number} Count value
 */
export function calculateCount(data, config) {
  if (!data || data.length === 0) return 0

  if (config.filterField && config.filterValue) {
    return data.filter(item => item[config.filterField] === config.filterValue).length
  }

  return data.length
}

/**
 * Calculate distinct count of a field
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration
 * @returns {number} Distinct count
 */
export function calculateDistinctCount(data, config) {
  if (!data || data.length === 0) return 0

  const { field } = config
  const uniqueValues = new Set(data.map(item => item[field]).filter(Boolean))
  return uniqueValues.size
}

/**
 * Group data by a field and count occurrences
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration with groupBy, colors
 * @returns {Array} Array of { name, value, fill }
 */
export function groupByField(data, config) {
  if (!data || data.length === 0) return []

  const { groupBy, colors = {} } = config
  const groups = {}

  data.forEach(item => {
    const key = item[groupBy]
    if (key) {
      groups[key] = (groups[key] || 0) + 1
    }
  })

  return Object.entries(groups).map(([name, value]) => ({
    name,
    value,
    fill: colors[name] || getDefaultColor(name)
  }))
}

/**
 * Group data by time period (month)
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration
 * @returns {Array} Array of time-grouped data
 */
export function groupByTimePeriod(data, config) {
  if (!data || data.length === 0) return []

  const { dateField, groupBy = 'month', limit = 12 } = config
  const groups = {}

  data.forEach(item => {
    const date = new Date(item[dateField])
    if (isNaN(date.getTime())) return

    let key
    if (groupBy === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    } else if (groupBy === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().split('T')[0]
    } else if (groupBy === 'day') {
      key = date.toISOString().split('T')[0]
    }

    if (!groups[key]) {
      groups[key] = { items: [], date: new Date(key) }
    }
    groups[key].items.push(item)
  })

  // Sort by date and take last N periods
  const sortedKeys = Object.keys(groups).sort()
  const limitedKeys = sortedKeys.slice(-limit)

  return limitedKeys.map(key => {
    const group = groups[key]
    const date = new Date(key)
    return {
      month: key,
      label: date.toLocaleDateString('en-US', { month: 'short' }),
      items: group.items,
      count: group.items.length
    }
  })
}

/**
 * Calculate satisfaction trend over time
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration
 * @returns {Array} Array of { month, label, satisfaction, responses }
 */
export function calculateSatisfactionTrend(data, config) {
  if (!data || data.length === 0) return []

  const { dateField, numeratorField, numeratorValue, limit = 12 } = config
  const groups = groupByTimePeriod(data, { dateField, groupBy: 'month', limit })

  return groups.map(group => {
    const positiveCount = group.items.filter(
      item => item[numeratorField] === numeratorValue
    ).length
    const total = group.items.length
    const satisfaction = total > 0 ? Math.round((positiveCount / total) * 100) : 0

    return {
      month: group.month,
      label: group.label,
      satisfaction,
      responses: total
    }
  })
}

/**
 * Calculate metrics grouped by a field (e.g., technician performance)
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration
 * @returns {Array} Sorted array of { name, satisfaction, responses }
 */
export function calculateGroupedMetrics(data, config) {
  if (!data || data.length === 0) return []

  const {
    groupBy,
    numeratorField,
    numeratorValue,
    minCount = 1,
    orderBy = 'satisfaction',
    orderDirection = 'desc'
  } = config

  const groups = {}

  data.forEach(item => {
    const key = item[groupBy]
    if (!key) return

    if (!groups[key]) {
      groups[key] = { positive: 0, total: 0 }
    }
    groups[key].total++
    if (item[numeratorField] === numeratorValue) {
      groups[key].positive++
    }
  })

  // Convert to array and filter by minimum count
  let result = Object.entries(groups)
    .filter(([, stats]) => stats.total >= minCount)
    .map(([name, stats]) => ({
      name,
      satisfaction: stats.total > 0
        ? Math.round((stats.positive / stats.total) * 100)
        : 0,
      responses: stats.total
    }))

  // Sort
  result.sort((a, b) => {
    const aVal = a[orderBy]
    const bVal = b[orderBy]
    return orderDirection === 'desc' ? bVal - aVal : aVal - bVal
  })

  return result
}

/**
 * Transform data for multi-line chart
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration with metrics array
 * @returns {Object} { chartData: Array, lines: Array }
 */
export function transformMultiLineData(data, config) {
  if (!data || data.length === 0) return { chartData: [], lines: [] }

  const { dateField, metrics = [], limit = 12, includeTotalLine = false } = config
  const groups = groupByTimePeriod(data, { dateField, groupBy: 'month', limit })

  const chartData = groups.map(group => {
    const result = {
      month: group.label
    }

    metrics.forEach(metric => {
      const count = group.items.filter(
        item => item[metric.field] === metric.value
      ).length
      result[metric.name] = count
    })

    if (includeTotalLine) {
      result.Total = group.count
    }

    return result
  })

  // Build lines config for MetricLineChart
  const lines = metrics.map(metric => ({
    dataKey: metric.name,
    name: metric.name,
    color: metric.color || 'blue'
  }))

  if (includeTotalLine) {
    lines.push({
      dataKey: 'Total',
      name: 'Total',
      color: 'blue',
      dashed: true
    })
  }

  return { chartData, lines }
}

/**
 * Transform data for table display
 * @param {Array} data - Raw data array
 * @param {Object} config - Data configuration with columns, ordering, limit
 * @returns {Array} Formatted table data
 */
export function transformTableData(data, config) {
  if (!data || data.length === 0) return []

  const { orderBy, orderDirection = 'desc', limit = 10 } = config

  let result = [...data]

  // Apply ordering
  if (orderBy) {
    result.sort((a, b) => {
      const aVal = a[orderBy]
      const bVal = b[orderBy]

      if (aVal < bVal) return orderDirection === 'desc' ? 1 : -1
      if (aVal > bVal) return orderDirection === 'desc' ? -1 : 1
      return 0
    })
  }

  // Apply limit
  if (limit) {
    result = result.slice(0, limit)
  }

  return result
}

/**
 * Main transformer function - routes to appropriate transformer based on config
 * @param {Array} data - Raw data array
 * @param {Object} dataConfig - Gauge's data_config
 * @returns {any} Transformed data
 */
export function transformData(data, dataConfig) {
  if (!data || !dataConfig) return null

  const { aggregation, metric } = dataConfig

  switch (aggregation) {
    case 'percentage':
      return calculatePercentage(data, dataConfig)

    case 'count':
      return calculateCount(data, dataConfig)

    case 'distinct':
      return calculateDistinctCount(data, dataConfig)

    default:
      break
  }

  switch (metric) {
    case 'satisfaction_rate':
      return calculatePercentage(data, dataConfig)

    case 'total_count':
      return calculateCount(data, dataConfig)

    case 'unique_count':
      return calculateDistinctCount(data, dataConfig)

    case 'filtered_count':
      return calculateCount(data, dataConfig)

    case 'satisfaction_percentage':
      return calculateSatisfactionTrend(data, dataConfig)

    default:
      return data
  }
}

/**
 * Get a default color for a value (used when no color mapping provided)
 */
function getDefaultColor(value) {
  const colorMap = {
    'Gold Star': '#22c55e',
    'Yellow Light': '#eab308',
    'Red Light': '#ef4444'
  }
  return colorMap[value] || '#3498db'
}

export default {
  calculatePercentage,
  calculateCount,
  calculateDistinctCount,
  groupByField,
  groupByTimePeriod,
  calculateSatisfactionTrend,
  calculateGroupedMetrics,
  transformMultiLineData,
  transformTableData,
  transformData
}
