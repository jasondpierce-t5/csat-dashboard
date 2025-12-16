import { useState } from 'react'

export default function DashboardSection({ title, children, defaultExpanded = true }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <section className="mb-6">
      <div
        className="section-header cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>{title}</span>
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 transition-all"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {children}
      </div>
    </section>
  )
}
