# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
cd csat-dashboard && npm run dev     # Start dev server (Vite)
cd csat-dashboard && npm run build   # Production build
cd csat-dashboard && npm run lint    # ESLint
cd csat-dashboard && npm run preview # Preview production build
```

## Architecture

This is a modular, config-driven dashboard platform that displays metrics from various data sources stored in Supabase. The primary use case is CSAT (Customer Satisfaction) data from Customer Thermometer.

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Supabase Database                        │
├─────────────────┬─────────────────┬─────────────────────────────┤
│ dashboard_configs│   gauge_types   │       gauge_configs         │
│ (dashboards)    │ (component map) │ (gauge instances)           │
├─────────────────┴─────────────────┴─────────────────────────────┤
│                     Data Tables (csat, tickets, etc.)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DashboardContext                            │
│  - Fetches dashboard configs, gauge configs, raw data           │
│  - Manages filters, expanded gauge state                        │
│  - Auto-refresh every 5 minutes                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DashboardContainer                           │
│  - Groups gauges by section                                     │
│  - Renders GaugeSection components                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GaugeWrapper                               │
│  - Transforms data via useGaugeData hook                        │
│  - Manages drill-down expand/collapse                           │
│  - Error boundary for crash protection                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GaugeRenderer                              │
│  - Maps gauge_type to React component via gaugeRegistry         │
│  - Formats props based on gauge type                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Gauge Components (KPICard, Charts, etc.)           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Directories

```
src/
├── context/
│   └── DashboardContext.jsx    # Central state management
├── config/
│   └── gaugeRegistry.js        # Maps gauge types to components
├── hooks/
│   ├── useSupabase.js          # Legacy data hooks (kept for compatibility)
│   ├── useGaugeData.js         # Data transformation for gauges
│   ├── useDashboards.js        # Dashboard config fetching
│   └── useGaugeConfigs.js      # Gauge config fetching
├── lib/
│   ├── supabase.js             # Supabase client
│   └── dataTransformers.js     # Data transformation utilities
├── components/
│   ├── layout/
│   │   ├── Header.jsx          # Top nav with dashboard selector
│   │   └── DashboardSelector.jsx
│   ├── gauges/
│   │   ├── GaugeWrapper.jsx    # Wrapper with drill-down & error boundary
│   │   ├── GaugeRenderer.jsx   # Dynamic component rendering
│   │   └── DrillDownPanel.jsx  # Expandable detail panel
│   ├── FilterControls.jsx     # Date, technician, rating filters
│   ├── KPICard.jsx
│   ├── RatingPieChart.jsx
│   ├── SatisfactionTrend.jsx
│   ├── TechPerformance.jsx
│   ├── MetricLineChart.jsx
│   └── DataTable.jsx           # Clickable rows with drill-down
└── dashboards/
    └── DashboardContainer.jsx  # Main dashboard renderer with filters

supabase/
├── migrations/
│   └── 001_dashboard_configs.sql  # Schema for config tables
└── seeds/
    ├── 001_gauge_types.sql        # Gauge type definitions
    ├── 002_csat_dashboard.sql     # CSAT dashboard config
    └── 003_ticket_stats_dashboard.sql  # Example second dashboard
```

### Supabase Schema

**dashboard_configs** - Dashboard definitions
- `slug` (unique): URL-friendly identifier (e.g., 'csat', 'ticket-stats')
- `name`: Display name
- `data_source`: Supabase table name for raw data
- `is_active`, `display_order`

**gauge_types** - Component registry
- `type_key` (unique): Component identifier (e.g., 'kpi_card', 'pie_chart')
- `component_name`: React component name
- `supports_drill_down`: Boolean

**gauge_configs** - Gauge instances on dashboards
- `dashboard_id`: FK to dashboard_configs
- `gauge_type_id`: FK to gauge_types
- `title`, `section`: Display info
- `position`: JSON `{row, col, width, height}`
- `data_config`: JSON with transformation settings
- `display_config`: JSON with display options
- `drill_down_config`: JSON with drill-down settings (optional)

### Adding a New Dashboard

1. Create a new data table in Supabase (if needed)
2. Add a row to `dashboard_configs` with the table name as `data_source`
3. Add rows to `gauge_configs` referencing existing `gauge_types`
4. The dashboard will appear in the dropdown automatically

### Adding a New Gauge Type

1. Create the React component in `src/components/`
2. Register it in `src/config/gaugeRegistry.js`
3. Add a row to `gauge_types` table in Supabase
4. Add transformation logic in `src/lib/dataTransformers.js` if needed
5. Handle props mapping in `GaugeRenderer.jsx`

### Feature Flag

In `src/App.jsx`:
```javascript
const USE_CONFIG_DRIVEN = true  // Config-driven mode (new)
const USE_CONFIG_DRIVEN = false // Legacy hardcoded mode
```

### Rating Values

Customer Thermometer uses: `Gold Star`, `Yellow Light`, `Red Light` (not Excellent/Good/Poor).

### Styling

Light theme (BrightGauge-inspired) using Tailwind CSS. Common patterns:
- Backgrounds: `bg-slate-50` (page), `bg-white` (cards)
- Text: `text-slate-700`, `text-slate-400/500`
- Cards: `widget-card` class with `shadow-widget`
- Sections: `section-header` class

### Environment Variables

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Setup

Run these SQL files in order in the Supabase SQL Editor:

1. `supabase/migrations/001_dashboard_configs.sql` - Creates tables
2. `supabase/seeds/001_gauge_types.sql` - Seeds gauge types
3. `supabase/seeds/002_csat_dashboard.sql` - Seeds CSAT dashboard

RLS policies are included that allow public read access. For development, you may need to disable RLS:
```sql
ALTER TABLE dashboard_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE gauge_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE gauge_configs DISABLE ROW LEVEL SECURITY;
```

## Filtering System

Filters are managed in `DashboardContext` and rendered by `FilterControls`:

```javascript
// Filter state shape
filters: {
  startDate: '',      // YYYY-MM-DD
  endDate: '',        // YYYY-MM-DD
  customFilters: {
    tech_first_name: [],  // Selected technician names
    rating: []            // Selected ratings: 'Gold Star', 'Yellow Light', 'Red Light'
  }
}
```

The `useFilteredData` hook in `DashboardContext` applies these filters to `rawData`.

### Filter Components

- **FilterControls.jsx** - Renders date pickers and multi-select dropdowns
- **DashboardContainer.jsx** - Converts between context filter format and FilterControls format

### Adding Custom Filters

1. Add the field to `customFilters` in the filter state
2. Update `FilterControls` to render a new dropdown
3. Update `handleFilterChange` in `DashboardContainer` to map the new filter
4. The `useFilteredData` hook will automatically filter by array membership

## Data Table Drill-Down

`DataTable.jsx` supports expandable rows for viewing full record details:

- Click any row to expand/collapse the detail panel
- Detail panel shows all fields from the record in a grid layout
- Rating fields display with color-coded badges
- Date fields are formatted with time
- Field names are converted from snake_case to Title Case

### Column Types

```javascript
columns={[
  { key: 'company', header: 'Company', type: 'link' },    // Clickable link
  { key: 'rating', header: 'Rating', type: 'rating' },    // Color-coded badge
  { key: 'date', header: 'Date', type: 'date' },          // Formatted date
  { key: 'amount', header: 'Amount', type: 'currency' },  // $X,XXX format
  { key: 'rate', header: 'Rate', type: 'percent' }        // X% format
]}
```

## Dashboard Switching

Dashboard switching is handled by `DashboardSelector` and `DashboardContext`:

1. User selects dashboard from dropdown
2. `selectDashboard(slug)` dispatches `SET_CURRENT_DASHBOARD`
3. Reducer clears `rawData`, `gaugeConfigs`, `error` and sets `isLoading: true`
4. useEffect detects `currentDashboardSlug` change and fetches new data
5. No page refresh required

## Error Handling

- **GaugeErrorBoundary** - Class component that catches render errors in individual gauges
- **Error state in context** - Displays retry button when data fetch fails
- **Error cleared on dashboard switch** - Prevents stale errors from persisting
