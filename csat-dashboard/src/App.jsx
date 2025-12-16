import { DashboardProvider, useDashboard } from './context/DashboardContext'
import Header from './components/layout/Header'
import DashboardContainer from './dashboards/DashboardContainer'

// Feature flag to switch between config-driven and legacy mode
// Set to true to use the new config-driven system
// Set to false to use the legacy hardcoded approach
const USE_CONFIG_DRIVEN = true

function App() {
  if (USE_CONFIG_DRIVEN) {
    return (
      <DashboardProvider defaultDashboard="csat">
        <ConfigDrivenApp />
      </DashboardProvider>
    )
  }

  // Legacy mode - import and use LegacyApp
  return <LegacyApp />
}

/**
 * Config-driven dashboard application
 * Uses DashboardContext and renders gauges based on Supabase configuration
 */
function ConfigDrivenApp() {
  const { lastUpdated } = useDashboard()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with dashboard selector */}
      <Header />

      {/* Main Content */}
      <main className="p-6 max-w-[1600px] mx-auto">
        <DashboardContainer />
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-slate-400 border-t border-slate-200 bg-white">
        Auto-refreshes every 5 minutes
        {lastUpdated && (
          <span className="ml-2">
            | Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </footer>
    </div>
  )
}

/**
 * Legacy hardcoded dashboard application
 * Kept for backward compatibility during migration
 */
function LegacyApp() {
  // Import legacy dependencies only when needed
  const { useState, useMemo } = require('react')
  const {
    useCSATData,
    useFilteredData: useLegacyFilteredData,
    useTechNames,
    useKPIs,
    useRatingDistribution,
    useSatisfactionTrend,
    useTechPerformance
  } = require('./hooks/useSupabase')
  const KPICard = require('./components/KPICard').default
  const RatingPieChart = require('./components/RatingPieChart').default
  const SatisfactionTrend = require('./components/SatisfactionTrend').default
  const TechPerformance = require('./components/TechPerformance').default
  const DataTable = require('./components/DataTable').default
  const MetricLineChart = require('./components/MetricLineChart').default
  const DashboardSection = require('./components/DashboardSection').default
  const { FilterControls } = require('./components/FilterControls')

  const { data, loading, error, lastUpdated, refetch } = useCSATData()
  const [filters, setFilters] = useState({ startDate: '', endDate: '', techNames: [] })

  const techNames = useTechNames(data)
  const filteredData = useLegacyFilteredData(data, filters)
  const kpis = useKPIs(filteredData)
  const ratingDistribution = useRatingDistribution(filteredData)
  const satisfactionTrend = useSatisfactionTrend(filteredData)
  const techPerformance = useTechPerformance(filteredData)

  const timestamp = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now'

  const responseMetrics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    const monthlyData = {}
    filteredData.forEach(item => {
      const date = new Date(item.response_date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { total: 0, goldStar: 0, yellowLight: 0, redLight: 0 }
      }
      monthlyData[monthKey].total++
      if (item.rating === 'Gold Star') monthlyData[monthKey].goldStar++
      if (item.rating === 'Yellow Light') monthlyData[monthKey].yellowLight++
      if (item.rating === 'Red Light') monthlyData[monthKey].redLight++
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        'Gold Star': data.goldStar,
        'Yellow Light': data.yellowLight,
        'Red Light': data.redLight,
        'Total': data.total
      }))
      .slice(-12)
  }, [filteredData])

  const recentResponses = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    return filteredData
      .sort((a, b) => new Date(b.response_date) - new Date(a.response_date))
      .slice(0, 10)
      .map(item => ({
        company: item.company,
        technician: item.tech_first_name,
        rating: item.rating,
        date: item.response_date
      }))
  }, [filteredData])

  const tableColumns = [
    { key: 'company', header: 'Company', type: 'link' },
    { key: 'technician', header: 'Technician' },
    { key: 'rating', header: 'Rating' },
    { key: 'date', header: 'Response Date', type: 'date', highlight: true }
  ]

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-widget">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-red/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-accent-red text-lg font-medium mb-2">Error loading data</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="top-nav">
        <div className="nav-logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <span>CSAT Dashboard</span>
        </div>
        <div className="nav-links">
          <a href="#" className="nav-link nav-link--active">Dashboards</a>
          <a href="#" className="nav-link nav-link--badge">Goals</a>
          <a href="#" className="nav-link">Reports</a>
          <a href="#" className="nav-link">Gauges</a>
        </div>
        <div className="nav-actions">
          <div className="nav-avatar">JP</div>
        </div>
      </nav>

      <div className="dashboard-header">
        <div className="dashboard-title">
          <span>KPI - Customer Satisfaction (Legacy)</span>
        </div>
      </div>

      <main className="p-6 max-w-[1600px] mx-auto">
        {data.length > 0 && (
          <div className="mb-6 bg-white rounded shadow-widget p-4">
            <FilterControls
              techNames={techNames}
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>
        )}

        {loading && data.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-500">Loading dashboard...</span>
            </div>
          </div>
        ) : (
          <>
            <DashboardSection title="Business">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KPICard
                  title="Satisfaction Rate"
                  value={`${kpis.satisfactionPercent}%`}
                  change={kpis.satisfactionPercent >= 90 ? '+2.3%' : '-1.2%'}
                  changeType={kpis.satisfactionPercent >= 90 ? 'up' : 'down'}
                />
                <KPICard
                  title="Total Responses"
                  value={kpis.totalResponses.toLocaleString()}
                  subtitle="All time"
                />
                <KPICard
                  title="Unique Companies"
                  value={kpis.uniqueCompanies.toLocaleString()}
                  subtitle="Active customers"
                />
                <KPICard
                  title="Gold Star Rate"
                  value={`${ratingDistribution.find(r => r.name === 'Gold Star')?.value || 0}`}
                  subtitle="Excellent ratings"
                />
              </div>
            </DashboardSection>

            <DashboardSection title="Satisfaction Metrics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <DataTable
                  title="Recent Responses"
                  columns={tableColumns}
                  data={recentResponses}
                  timestamp={timestamp}
                />
                <MetricLineChart
                  title="Response Trends"
                  data={responseMetrics}
                  lines={[
                    { dataKey: 'Gold Star', name: 'Gold Star', color: 'green' },
                    { dataKey: 'Yellow Light', name: 'Yellow Light', color: 'yellow' },
                    { dataKey: 'Red Light', name: 'Red Light', color: 'red' },
                    { dataKey: 'Total', name: 'Total', color: 'blue', dashed: true }
                  ]}
                  xAxisKey="month"
                  timestamp={timestamp}
                />
              </div>
            </DashboardSection>

            <DashboardSection title="Analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <RatingPieChart data={ratingDistribution} timestamp={timestamp} />
                <SatisfactionTrend data={satisfactionTrend} timestamp={timestamp} />
              </div>
            </DashboardSection>

            <DashboardSection title="Team Performance">
              <TechPerformance data={techPerformance} timestamp={timestamp} />
            </DashboardSection>
          </>
        )}
      </main>

      <footer className="text-center py-4 text-sm text-slate-400 border-t border-slate-200 bg-white">
        Auto-refreshes every 5 minutes
        {lastUpdated && (
          <span className="ml-2">
            | Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </footer>
    </div>
  )
}

export default App
