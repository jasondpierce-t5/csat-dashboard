export default function KPICard({ title, value, subtitle, change, changeType, icon }) {
  return (
    <div className="widget-card">
      <div className="kpi-gauge">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="gauge-value">{value}</p>
            <p className="gauge-label">{title}</p>
            {change !== undefined && (
              <span className={`gauge-change ${changeType === 'up' ? 'gauge-change--up' : 'gauge-change--down'}`}>
                {changeType === 'up' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {change}
              </span>
            )}
            {subtitle && !change && (
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="text-slate-300 text-4xl ml-4">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
