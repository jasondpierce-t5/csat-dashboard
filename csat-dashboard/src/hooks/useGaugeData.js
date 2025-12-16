import { useMemo } from 'react'
import {
  calculatePercentage,
  calculateCount,
  calculateDistinctCount,
  groupByField,
  calculateSatisfactionTrend,
  calculateGroupedMetrics,
  transformMultiLineData,
  transformTableData
} from '../lib/dataTransformers'

/**
 * Hook to transform raw data for a specific gauge based on its configuration
 *
 * @param {Object} gaugeConfig - The gauge configuration from database
 * @param {Array} filteredData - The filtered raw data
 * @returns {any} Transformed data ready for the gauge component
 */
export function useGaugeData(gaugeConfig, filteredData) {
  return useMemo(() => {
    if (!gaugeConfig || !filteredData || filteredData.length === 0) {
      return null
    }

    const { data_config, gauge_type } = gaugeConfig
    const typeKey = gauge_type?.type_key

    if (!data_config) {
      return filteredData
    }

    // Route to appropriate transformer based on gauge type
    switch (typeKey) {
      case 'kpi_card':
        return transformKPIData(filteredData, data_config)

      case 'pie_chart':
        return transformPieChartData(filteredData, data_config)

      case 'line_chart':
        return transformLineChartData(filteredData, data_config)

      case 'bar_chart':
        return transformBarChartData(filteredData, data_config)

      case 'multi_line_chart':
        return transformMultiLineData(filteredData, data_config)

      case 'data_table':
        return transformTableData(filteredData, data_config)

      default:
        return filteredData
    }
  }, [gaugeConfig, filteredData])
}

/**
 * Transform data for KPI cards
 */
function transformKPIData(data, config) {
  const { metric, aggregation } = config

  switch (aggregation || metric) {
    case 'percentage':
    case 'satisfaction_rate':
      return {
        value: calculatePercentage(data, config),
        format: 'percent'
      }

    case 'count':
    case 'total_count':
    case 'filtered_count':
      return {
        value: calculateCount(data, config),
        format: 'number'
      }

    case 'distinct':
    case 'unique_count':
      return {
        value: calculateDistinctCount(data, config),
        format: 'number'
      }

    default:
      return {
        value: data.length,
        format: 'number'
      }
  }
}

/**
 * Transform data for pie charts
 */
function transformPieChartData(data, config) {
  return groupByField(data, config)
}

/**
 * Transform data for line charts (satisfaction trend)
 */
function transformLineChartData(data, config) {
  return calculateSatisfactionTrend(data, {
    dateField: config.dateField || 'response_date',
    numeratorField: config.numeratorField || 'rating',
    numeratorValue: config.numeratorValue || 'Gold Star',
    limit: config.limit || 12
  })
}

/**
 * Transform data for bar charts (e.g., technician performance)
 */
function transformBarChartData(data, config) {
  return calculateGroupedMetrics(data, {
    groupBy: config.groupBy || 'tech_first_name',
    numeratorField: config.numeratorField || 'rating',
    numeratorValue: config.numeratorValue || 'Gold Star',
    minCount: config.minCount || 5,
    orderBy: config.orderBy || 'satisfaction',
    orderDirection: config.orderDirection || 'desc'
  })
}

/**
 * Hook to get drill-down data for a gauge
 *
 * @param {Object} gaugeConfig - The gauge configuration
 * @param {Array} filteredData - The filtered raw data
 * @param {Object} drillDownContext - Optional context for filtering drill-down data
 * @returns {Array} Drill-down data
 */
export function useDrillDownData(gaugeConfig, filteredData, drillDownContext = {}) {
  return useMemo(() => {
    if (!gaugeConfig?.drill_down_config || !filteredData) {
      return []
    }

    const { drill_down_config } = gaugeConfig
    let result = [...filteredData]

    // Apply drill-down specific filter
    if (drill_down_config.filterField && drill_down_config.filterValue) {
      result = result.filter(
        item => item[drill_down_config.filterField] === drill_down_config.filterValue
      )
    }

    // Apply context filters (e.g., clicked value from parent gauge)
    if (drillDownContext.filterField && drillDownContext.filterValue) {
      result = result.filter(
        item => item[drillDownContext.filterField] === drillDownContext.filterValue
      )
    }

    // Order by date descending by default
    result.sort((a, b) => new Date(b.response_date) - new Date(a.response_date))

    // Apply max rows limit
    if (drill_down_config.maxRows) {
      result = result.slice(0, drill_down_config.maxRows)
    }

    return result
  }, [gaugeConfig, filteredData, drillDownContext])
}

export default useGaugeData
