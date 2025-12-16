import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Generic hook to fetch data from any Supabase table
 *
 * @param {string} tableName - Name of the Supabase table
 * @param {Object} options - Fetch options
 * @param {string} options.select - Columns to select (default: '*')
 * @param {Object} options.orderBy - { column, ascending }
 * @param {number} options.limit - Max rows to fetch
 * @param {number} options.refreshInterval - Auto-refresh interval in ms (default: 300000 = 5 min)
 * @param {boolean} options.enabled - Whether to fetch data (default: true)
 */
export function useDataSource(tableName, options = {}) {
  const {
    select = '*',
    orderBy,
    limit,
    refreshInterval = 5 * 60 * 1000,
    enabled = true
  } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    if (!tableName || !enabled) {
      setData([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(tableName).select(select)

      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? false
        })
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data: result, error: fetchError } = await query

      if (fetchError) throw fetchError

      setData(result || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error(`Error fetching from ${tableName}:`, err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tableName, select, orderBy, limit, enabled])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh
  useEffect(() => {
    if (!enabled || !refreshInterval) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval, enabled])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  }
}

/**
 * Hook to fetch data with filters applied
 *
 * @param {string} tableName - Name of the Supabase table
 * @param {Object} filters - Filter conditions
 * @param {Object} options - Additional options
 */
export function useFilteredDataSource(tableName, filters = {}, options = {}) {
  const {
    select = '*',
    orderBy,
    refreshInterval = 5 * 60 * 1000,
    enabled = true
  } = options

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchData = useCallback(async () => {
    if (!tableName || !enabled) {
      setData([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      let query = supabase.from(tableName).select(select)

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (key.endsWith('_gte')) {
            query = query.gte(key.replace('_gte', ''), value)
          } else if (key.endsWith('_lte')) {
            query = query.lte(key.replace('_lte', ''), value)
          } else if (key.endsWith('_in') && Array.isArray(value)) {
            query = query.in(key.replace('_in', ''), value)
          } else {
            query = query.eq(key, value)
          }
        }
      })

      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? false
        })
      }

      const { data: result, error: fetchError } = await query

      if (fetchError) throw fetchError

      setData(result || [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error(`Error fetching from ${tableName}:`, err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tableName, select, filters, orderBy, enabled])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!enabled || !refreshInterval) return

    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval, enabled])

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData
  }
}

export default useDataSource
