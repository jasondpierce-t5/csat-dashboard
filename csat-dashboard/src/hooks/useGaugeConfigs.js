import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch gauge configurations for a dashboard
 * @param {string} dashboardId - UUID of the dashboard
 */
export function useGaugeConfigs(dashboardId) {
  const [gaugeConfigs, setGaugeConfigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGaugeConfigs = useCallback(async () => {
    if (!dashboardId) {
      setGaugeConfigs([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('gauge_configs')
        .select(`
          *,
          gauge_type:gauge_types(*)
        `)
        .eq('dashboard_id', dashboardId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      setGaugeConfigs(data || [])
    } catch (err) {
      console.error('Error fetching gauge configs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [dashboardId])

  useEffect(() => {
    fetchGaugeConfigs()
  }, [fetchGaugeConfigs])

  // Group gauge configs by section
  const gaugesBySection = useMemo(() => {
    const sections = {}

    gaugeConfigs.forEach(gauge => {
      const sectionName = gauge.section || 'Default'
      if (!sections[sectionName]) {
        sections[sectionName] = []
      }
      sections[sectionName].push(gauge)
    })

    // Sort gauges within each section by display_order
    Object.keys(sections).forEach(section => {
      sections[section].sort((a, b) => a.display_order - b.display_order)
    })

    return sections
  }, [gaugeConfigs])

  // Get ordered section names
  const sectionOrder = useMemo(() => {
    const sectionFirstOrder = {}

    gaugeConfigs.forEach(gauge => {
      const sectionName = gauge.section || 'Default'
      if (!(sectionName in sectionFirstOrder)) {
        sectionFirstOrder[sectionName] = gauge.display_order
      } else {
        sectionFirstOrder[sectionName] = Math.min(
          sectionFirstOrder[sectionName],
          gauge.display_order
        )
      }
    })

    return Object.keys(sectionFirstOrder).sort(
      (a, b) => sectionFirstOrder[a] - sectionFirstOrder[b]
    )
  }, [gaugeConfigs])

  return {
    gaugeConfigs,
    gaugesBySection,
    sectionOrder,
    loading,
    error,
    refetch: fetchGaugeConfigs
  }
}

/**
 * Hook to fetch all gauge types
 */
export function useGaugeTypes() {
  const [gaugeTypes, setGaugeTypes] = useState([])
  const [gaugeTypesMap, setGaugeTypesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGaugeTypes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('gauge_types')
        .select('*')

      if (fetchError) throw fetchError

      setGaugeTypes(data || [])

      // Create lookup map
      const map = {}
      ;(data || []).forEach(gt => {
        map[gt.type_key] = gt
      })
      setGaugeTypesMap(map)
    } catch (err) {
      console.error('Error fetching gauge types:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGaugeTypes()
  }, [fetchGaugeTypes])

  const getGaugeType = useCallback((typeKey) => {
    return gaugeTypesMap[typeKey] || null
  }, [gaugeTypesMap])

  return {
    gaugeTypes,
    gaugeTypesMap,
    getGaugeType,
    loading,
    error,
    refetch: fetchGaugeTypes
  }
}

export default useGaugeConfigs
