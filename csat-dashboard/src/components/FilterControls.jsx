import { useState, useRef, useEffect } from 'react'

const RATING_OPTIONS = ['Gold Star', 'Yellow Light', 'Red Light']

export function FilterControls({ techNames, filters, onFilterChange }) {
  const [techDropdownOpen, setTechDropdownOpen] = useState(false)
  const [ratingDropdownOpen, setRatingDropdownOpen] = useState(false)
  const techDropdownRef = useRef(null)
  const ratingDropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (techDropdownRef.current && !techDropdownRef.current.contains(event.target)) {
        setTechDropdownOpen(false)
      }
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target)) {
        setRatingDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDateChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const handleTechToggle = (techName) => {
    const currentTechs = filters.techNames || []
    const newTechs = currentTechs.includes(techName)
      ? currentTechs.filter((t) => t !== techName)
      : [...currentTechs, techName]
    onFilterChange({ ...filters, techNames: newTechs })
  }

  const handleRatingToggle = (rating) => {
    const currentRatings = filters.ratings || []
    const newRatings = currentRatings.includes(rating)
      ? currentRatings.filter((r) => r !== rating)
      : [...currentRatings, rating]
    onFilterChange({ ...filters, ratings: newRatings })
  }

  const handleSelectAllTechs = () => {
    onFilterChange({ ...filters, techNames: [...techNames] })
  }

  const handleClearTechs = () => {
    onFilterChange({ ...filters, techNames: [] })
  }

  const handleSelectAllRatings = () => {
    onFilterChange({ ...filters, ratings: [...RATING_OPTIONS] })
  }

  const handleClearRatings = () => {
    onFilterChange({ ...filters, ratings: [] })
  }

  const handleClearAll = () => {
    onFilterChange({ startDate: '', endDate: '', techNames: [], ratings: [] })
  }

  const hasActiveFilters = filters.startDate || filters.endDate || filters.techNames?.length > 0 || filters.ratings?.length > 0
  const selectedTechCount = filters.techNames?.length || 0
  const selectedRatingCount = filters.ratings?.length || 0

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date Range */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-500">From:</label>
        <input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => handleDateChange('startDate', e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded bg-white text-slate-700 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-500">To:</label>
        <input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => handleDateChange('endDate', e.target.value)}
          className="px-3 py-1.5 text-sm border border-slate-200 rounded bg-white text-slate-700 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/20"
        />
      </div>

      {/* Tech Name Multi-Select */}
      <div className="relative" ref={techDropdownRef}>
        <button
          onClick={() => setTechDropdownOpen(!techDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded bg-white text-slate-700 hover:border-slate-300 transition-colors min-w-[160px]"
        >
          <span>
            {selectedTechCount === 0
              ? 'All Technicians'
              : `${selectedTechCount} selected`}
          </span>
          <svg
            className={`w-4 h-4 ml-auto text-slate-400 transition-transform ${techDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {techDropdownOpen && (
          <div className="absolute z-50 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            <div className="flex gap-2 p-2 border-b border-slate-100">
              <button
                onClick={handleSelectAllTechs}
                className="text-xs text-accent-blue hover:text-accent-blue/80"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleClearTechs}
                className="text-xs text-accent-blue hover:text-accent-blue/80"
              >
                Clear
              </button>
            </div>

            <div className="p-2">
              {techNames.map((tech) => (
                <label
                  key={tech}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.techNames?.includes(tech) || false}
                    onChange={() => handleTechToggle(tech)}
                    className="w-4 h-4 rounded border-slate-300 text-accent-blue focus:ring-accent-blue/20"
                  />
                  <span className="text-sm text-slate-700">{tech}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Multi-Select */}
      <div className="relative" ref={ratingDropdownRef}>
        <button
          onClick={() => setRatingDropdownOpen(!ratingDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded bg-white text-slate-700 hover:border-slate-300 transition-colors min-w-[140px]"
        >
          <span>
            {selectedRatingCount === 0
              ? 'All Ratings'
              : `${selectedRatingCount} selected`}
          </span>
          <svg
            className={`w-4 h-4 ml-auto text-slate-400 transition-transform ${ratingDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {ratingDropdownOpen && (
          <div className="absolute z-50 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg">
            <div className="flex gap-2 p-2 border-b border-slate-100">
              <button
                onClick={handleSelectAllRatings}
                className="text-xs text-accent-blue hover:text-accent-blue/80"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                onClick={handleClearRatings}
                className="text-xs text-accent-blue hover:text-accent-blue/80"
              >
                Clear
              </button>
            </div>

            <div className="p-2">
              {RATING_OPTIONS.map((rating) => (
                <label
                  key={rating}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.ratings?.includes(rating) || false}
                    onChange={() => handleRatingToggle(rating)}
                    className="w-4 h-4 rounded border-slate-300 text-accent-blue focus:ring-accent-blue/20"
                  />
                  <span className={`text-sm ${
                    rating === 'Gold Star' ? 'text-green-600' :
                    rating === 'Yellow Light' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>{rating}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 px-2 py-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear Filters
        </button>
      )}
    </div>
  )
}
