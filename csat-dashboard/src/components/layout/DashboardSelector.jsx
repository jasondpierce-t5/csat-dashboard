import { useState, useRef, useEffect } from 'react'
import { useDashboard } from '../../context/DashboardContext'

/**
 * DashboardSelector - Dropdown to switch between dashboards
 */
export default function DashboardSelector() {
  const {
    currentDashboard,
    availableDashboards,
    selectDashboard,
    isLoading
  } = useDashboard()

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (slug) => {
    // Only switch if selecting a different dashboard
    if (slug !== currentDashboard?.slug) {
      selectDashboard(slug)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="dashboard-title cursor-pointer hover:bg-slate-50 px-3 py-2 rounded transition-colors disabled:opacity-50"
      >
        <span>{currentDashboard?.name || 'Select Dashboard'}</span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && availableDashboards.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="py-1">
            {availableDashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                onClick={() => handleSelect(dashboard.slug)}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${
                  dashboard.slug === currentDashboard?.slug
                    ? 'bg-accent-blue/5 border-l-2 border-accent-blue'
                    : ''
                }`}
              >
                <div className="font-medium text-slate-700">
                  {dashboard.name}
                </div>
                {dashboard.description && (
                  <div className="text-xs text-slate-400 mt-0.5">
                    {dashboard.description}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
            <span className="text-xs text-slate-400">
              {availableDashboards.length} dashboard{availableDashboards.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
