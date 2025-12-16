import { useDashboard } from '../../context/DashboardContext'
import DashboardSelector from './DashboardSelector'

/**
 * Header - Top navigation bar with logo, nav links, and dashboard selector
 */
export default function Header() {
  const { refreshData, isLoading } = useDashboard()

  return (
    <>
      {/* Top Navigation */}
      <nav className="top-nav">
        <div className="nav-logo">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span>Dashboard Platform</span>
        </div>

        <div className="nav-links">
          <a href="#" className="nav-link nav-link--active">Dashboards</a>
        </div>

        <div className="nav-actions">
          <button className="nav-btn nav-btn--primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button className="nav-btn">
            <span>Data</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="nav-btn">
            <span>Help</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="nav-avatar">JP</div>
        </div>
      </nav>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <DashboardSelector />

        <div className="dashboard-actions">
          <button
            className="action-btn"
            onClick={refreshData}
            disabled={isLoading}
          >
            <svg
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
    </>
  )
}
