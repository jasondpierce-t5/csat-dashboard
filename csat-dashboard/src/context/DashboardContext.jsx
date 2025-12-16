import { createContext, useContext, useReducer, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Initial state
const initialState = {
  // Dashboard state
  currentDashboardSlug: null,
  currentDashboard: null,
  availableDashboards: [],

  // Gauge state
  gaugeConfigs: [],
  gaugeTypes: {},

  // Data state
  rawData: [],
  lastUpdated: null,

  // Filter state
  filters: {
    startDate: '',
    endDate: '',
    customFilters: {}
  },

  // UI state
  expandedGaugeId: null,
  isLoading: true,
  error: null
}

// Action types
const ActionTypes = {
  SET_DASHBOARDS: 'SET_DASHBOARDS',
  SET_CURRENT_DASHBOARD: 'SET_CURRENT_DASHBOARD',
  SET_GAUGE_TYPES: 'SET_GAUGE_TYPES',
  SET_GAUGE_CONFIGS: 'SET_GAUGE_CONFIGS',
  SET_RAW_DATA: 'SET_RAW_DATA',
  SET_FILTERS: 'SET_FILTERS',
  SET_EXPANDED_GAUGE: 'SET_EXPANDED_GAUGE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  RESET_FILTERS: 'RESET_FILTERS'
}

// Reducer
function dashboardReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_DASHBOARDS: {
      const dashboards = action.payload
      // Use existing slug or default to first dashboard
      const selectedSlug = state.currentDashboardSlug || dashboards[0]?.slug || null
      // Find the full dashboard object
      const selectedDashboard = dashboards.find(d => d.slug === selectedSlug) || null
      return {
        ...state,
        availableDashboards: dashboards,
        currentDashboardSlug: selectedSlug,
        currentDashboard: selectedDashboard
      }
    }

    case ActionTypes.SET_CURRENT_DASHBOARD: {
      const dashboard = state.availableDashboards.find(d => d.slug === action.payload)
      return {
        ...state,
        currentDashboardSlug: action.payload,
        currentDashboard: dashboard || null,
        // Reset state when switching dashboards
        rawData: [],
        gaugeConfigs: [],
        expandedGaugeId: null,
        error: null,
        isLoading: true
      }
    }

    case ActionTypes.SET_GAUGE_TYPES:
      // Convert array to object keyed by type_key for easy lookup
      const gaugeTypesMap = {}
      action.payload.forEach(gt => {
        gaugeTypesMap[gt.type_key] = gt
      })
      return {
        ...state,
        gaugeTypes: gaugeTypesMap
      }

    case ActionTypes.SET_GAUGE_CONFIGS:
      return {
        ...state,
        gaugeConfigs: action.payload
      }

    case ActionTypes.SET_RAW_DATA:
      return {
        ...state,
        rawData: action.payload.data,
        lastUpdated: action.payload.timestamp
      }

    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      }

    case ActionTypes.RESET_FILTERS:
      return {
        ...state,
        filters: initialState.filters
      }

    case ActionTypes.SET_EXPANDED_GAUGE:
      return {
        ...state,
        expandedGaugeId: action.payload
      }

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      }

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }

    default:
      return state
  }
}

// Create context
const DashboardContext = createContext(null)

// Provider component
export function DashboardProvider({ children, defaultDashboard = null }) {
  const [state, dispatch] = useReducer(dashboardReducer, {
    ...initialState,
    currentDashboardSlug: defaultDashboard
  })

  // Fetch available dashboards
  const fetchDashboards = useCallback(async () => {
    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true })

      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error

      dispatch({ type: ActionTypes.SET_DASHBOARDS, payload: data || [] })
    } catch (err) {
      console.error('Error fetching dashboards:', err)
      dispatch({ type: ActionTypes.SET_ERROR, payload: err.message })
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false })
    }
  }, [])

  // Fetch gauge types
  const fetchGaugeTypes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('gauge_types')
        .select('*')

      if (error) throw error

      dispatch({ type: ActionTypes.SET_GAUGE_TYPES, payload: data || [] })
    } catch (err) {
      console.error('Error fetching gauge types:', err)
      dispatch({ type: ActionTypes.SET_ERROR, payload: err.message })
    }
  }, [])

  // Fetch gauge configs for current dashboard
  const fetchGaugeConfigs = useCallback(async (dashboardId) => {
    if (!dashboardId) return

    try {
      const { data, error } = await supabase
        .from('gauge_configs')
        .select(`
          *,
          gauge_type:gauge_types(*)
        `)
        .eq('dashboard_id', dashboardId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (error) throw error

      dispatch({ type: ActionTypes.SET_GAUGE_CONFIGS, payload: data || [] })
    } catch (err) {
      console.error('Error fetching gauge configs:', err)
      dispatch({ type: ActionTypes.SET_ERROR, payload: err.message })
    }
  }, [])

  // Fetch raw data for current dashboard's data source
  const fetchRawData = useCallback(async (dataSource) => {
    if (!dataSource) return

    try {
      dispatch({ type: ActionTypes.SET_LOADING, payload: true })

      const { data, error } = await supabase
        .from(dataSource)
        .select('*')
        .order('response_date', { ascending: false })

      if (error) throw error

      dispatch({
        type: ActionTypes.SET_RAW_DATA,
        payload: { data: data || [], timestamp: new Date() }
      })
    } catch (err) {
      console.error('Error fetching raw data:', err)
      dispatch({ type: ActionTypes.SET_ERROR, payload: err.message })
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false })
    }
  }, [])

  // Action: Select dashboard
  const selectDashboard = useCallback((slug) => {
    dispatch({ type: ActionTypes.SET_CURRENT_DASHBOARD, payload: slug })
  }, [])

  // Action: Set filters
  const setFilters = useCallback((newFilters) => {
    dispatch({ type: ActionTypes.SET_FILTERS, payload: newFilters })
  }, [])

  // Action: Reset filters
  const resetFilters = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_FILTERS })
  }, [])

  // Action: Toggle expanded gauge
  const toggleExpandedGauge = useCallback((gaugeId) => {
    dispatch({
      type: ActionTypes.SET_EXPANDED_GAUGE,
      payload: state.expandedGaugeId === gaugeId ? null : gaugeId
    })
  }, [state.expandedGaugeId])

  // Action: Collapse expanded gauge
  const collapseGauge = useCallback(() => {
    dispatch({ type: ActionTypes.SET_EXPANDED_GAUGE, payload: null })
  }, [])

  // Action: Refresh data
  const refreshData = useCallback(() => {
    if (state.currentDashboard?.data_source) {
      fetchRawData(state.currentDashboard.data_source)
    }
  }, [state.currentDashboard, fetchRawData])

  // Initial load: fetch dashboards and gauge types
  useEffect(() => {
    fetchDashboards()
    fetchGaugeTypes()
  }, [fetchDashboards, fetchGaugeTypes])

  // When current dashboard changes, fetch its gauge configs and data
  // Use currentDashboardSlug as dependency for reliable change detection
  useEffect(() => {
    if (state.currentDashboard) {
      fetchGaugeConfigs(state.currentDashboard.id)
      fetchRawData(state.currentDashboard.data_source)
    }
  }, [state.currentDashboardSlug, state.currentDashboard, fetchGaugeConfigs, fetchRawData])

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!state.currentDashboard?.data_source) return

    const interval = setInterval(() => {
      fetchRawData(state.currentDashboard.data_source)
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [state.currentDashboard, fetchRawData])

  // Context value
  const value = {
    // State
    ...state,

    // Actions
    selectDashboard,
    setFilters,
    resetFilters,
    toggleExpandedGauge,
    collapseGauge,
    refreshData,

    // Helpers
    getGaugeType: (typeKey) => state.gaugeTypes[typeKey] || null
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

// Hook to use dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

// Hook to get filtered data based on current filters
export function useFilteredData() {
  const { rawData, filters } = useDashboard()

  return rawData.filter(item => {
    // Date range filter
    if (filters.startDate) {
      const itemDate = new Date(item.response_date)
      const startDate = new Date(filters.startDate)
      if (itemDate < startDate) return false
    }

    if (filters.endDate) {
      const itemDate = new Date(item.response_date)
      const endDate = new Date(filters.endDate)
      endDate.setHours(23, 59, 59, 999)
      if (itemDate > endDate) return false
    }

    // Custom filters (e.g., techNames)
    if (filters.customFilters) {
      for (const [field, values] of Object.entries(filters.customFilters)) {
        if (Array.isArray(values) && values.length > 0) {
          if (!values.includes(item[field])) return false
        }
      }
    }

    return true
  })
}

export default DashboardContext
