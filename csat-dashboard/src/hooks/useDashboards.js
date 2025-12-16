import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook to fetch all available dashboards
 * Can be used standalone or relies on DashboardContext
 */
export function useDashboards() {
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboards = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('dashboard_configs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (fetchError) throw fetchError

      setDashboards(data || [])
    } catch (err) {
      console.error('Error fetching dashboards:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboards()
  }, [fetchDashboards])

  return {
    dashboards,
    loading,
    error,
    refetch: fetchDashboards
  }
}

/**
 * Hook to fetch a single dashboard by slug
 */
export function useDashboardBySlug(slug) {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDashboard = useCallback(async () => {
    if (!slug) {
      setDashboard(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('dashboard_configs')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (fetchError) throw fetchError

      setDashboard(data)
    } catch (err) {
      console.error('Error fetching dashboard:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return {
    dashboard,
    loading,
    error,
    refetch: fetchDashboard
  }
}

export default useDashboards
