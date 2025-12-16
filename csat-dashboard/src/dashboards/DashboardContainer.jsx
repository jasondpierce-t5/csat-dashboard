import { useMemo } from 'react'
import { useDashboard, useFilteredData } from '../context/DashboardContext'
import { GaugeSection } from '../components/gauges/GaugeWrapper'
import { FilterControls } from '../components/FilterControls'

/**
 * DashboardContainer - Main container for rendering dashboard content
 * Renders gauges organized by sections based on configuration
 */
export default function DashboardContainer() {
  const {
    currentDashboard,
    gaugeConfigs,
    rawData,
    filters,
    setFilters,
    isLoading,
    error,
    refreshData
  } = useDashboard()

  // Extract unique tech names for filter dropdown
  const techNames = useMemo(() => {
    if (!rawData || rawData.length === 0) return []

    const names = new Set()
    rawData.forEach(item => {
      if (item.tech_first_name) {
        names.add(item.tech_first_name)
      }
    })
    return Array.from(names).sort()
  }, [rawData])

  // Group gauges by section
  const gaugesBySection = useMemo(() => {
    if (!gaugeConfigs || gaugeConfigs.length === 0) return {}

    const sections = {}
    const sectionOrder = {}

    gaugeConfigs.forEach(gauge => {
      const sectionName = gauge.section || 'Default'

      if (!sections[sectionName]) {
        sections[sectionName] = []
        sectionOrder[sectionName] = gauge.display_order
      }

      sections[sectionName].push(gauge)

      // Track minimum display_order for section ordering
      sectionOrder[sectionName] = Math.min(
        sectionOrder[sectionName],
        gauge.display_order
      )
    })

    // Sort gauges within each section
    Object.keys(sections).forEach(section => {
      sections[section].sort((a, b) => a.display_order - b.display_order)
    })

    return { sections, sectionOrder }
  }, [gaugeConfigs])

  // Get ordered section names
  const orderedSections = useMemo(() => {
    const { sections, sectionOrder } = gaugesBySection
    if (!sections) return []

    return Object.keys(sections).sort(
      (a, b) => (sectionOrder[a] || 0) - (sectionOrder[b] || 0)
    )
  }, [gaugesBySection])

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // Map the old filter format to new format
    setFilters({
      startDate: newFilters.startDate,
      endDate: newFilters.endDate,
      customFilters: {
        tech_first_name: newFilters.techNames || [],
        rating: newFilters.ratings || []
      }
    })
  }

  // Convert context filters back to FilterControls format
  const filtersForControls = useMemo(() => ({
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    techNames: filters.customFilters?.tech_first_name || [],
    ratings: filters.customFilters?.rating || []
  }), [filters])

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-white p-8 rounded-lg shadow-widget">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-red/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-accent-red text-lg font-medium mb-2">Error loading dashboard</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // No dashboard selected or available
  if (!currentDashboard) {
    // Check if we're still loading dashboards
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-500">Loading dashboards...</span>
          </div>
        </div>
      )
    }

    // Dashboards loaded but none found
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-500 mb-2">No dashboards available</p>
          <p className="text-slate-400 text-sm">
            Run the Supabase migrations and seeds to create dashboard configurations.
          </p>
        </div>
      </div>
    )
  }

  // Loading data for selected dashboard
  if (isLoading && rawData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-500">Loading {currentDashboard.name} data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Filters */}
      {rawData.length > 0 && techNames.length > 0 && (
        <div className="mb-6 bg-white rounded shadow-widget p-4">
          <FilterControls
            techNames={techNames}
            filters={filtersForControls}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      {/* Dashboard Sections */}
      {orderedSections.length > 0 ? (
        orderedSections.map(sectionName => (
          <GaugeSection
            key={sectionName}
            title={sectionName}
            gauges={gaugesBySection.sections[sectionName]}
            defaultExpanded={true}
          />
        ))
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p>No gauges configured for this dashboard</p>
          <p className="text-sm mt-2">Add gauge configurations to see data</p>
        </div>
      )}
    </div>
  )
}
