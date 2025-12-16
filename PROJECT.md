# CSAT Dashboard Platform - Project Documentation

## Overview

A modular, configuration-driven dashboard platform built with React and Supabase. Originally designed for Customer Satisfaction (CSAT) metrics from Customer Thermometer, it now supports multiple dashboards with different data sources.

**Live Features:**
- Multiple dashboards selectable via dropdown
- 6 reusable gauge types (KPI cards, charts, tables)
- Drill-down capability (expand gauges to see detailed data)
- Filter controls (date range, technician)
- Auto-refresh every 5 minutes
- Configuration stored in Supabase (future admin UI ready)

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Vite | UI framework and build tool |
| Styling | Tailwind CSS | Utility-first CSS |
| Charts | Recharts | Data visualization |
| Database | Supabase (PostgreSQL) | Data storage + config storage |
| Data Pipeline | n8n | Webhook automation for Customer Thermometer |
| Data Source | Customer Thermometer | CSAT survey responses |

### External Services

**Supabase** (https://supabase.com)
- PostgreSQL database
- Auto-generated REST API
- Row Level Security (RLS)
- Environment: Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

**Customer Thermometer** (https://www.customerthermometer.com)
- Sends CSAT survey responses via webhook
- Rating values: `Gold Star`, `Yellow Light`, `Red Light`
- Webhook triggers on each survey response

**n8n** (self-hosted or cloud)
- Receives webhooks from Customer Thermometer
- Transforms and inserts data into Supabase
- Workflow: Webhook → Transform → Supabase Insert

---

## Project Structure

```
csat/
├── CLAUDE.md                    # Claude Code instructions
├── PROJECT.md                   # This file
└── csat-dashboard/              # React application
    ├── .env                     # Environment variables (not in git)
    ├── .env.example             # Template for env vars
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── dist/                    # Production build output
    ├── supabase/
    │   ├── migrations/
    │   │   └── 001_dashboard_configs.sql    # Config tables schema
    │   └── seeds/
    │       ├── 001_gauge_types.sql          # Gauge type definitions
    │       ├── 002_csat_dashboard.sql       # CSAT dashboard config
    │       └── 003_ticket_stats_dashboard.sql # Example 2nd dashboard
    └── src/
        ├── main.jsx             # React entry point
        ├── App.jsx              # Root component with feature flag
        ├── index.css            # Global styles + Tailwind
        ├── context/
        │   └── DashboardContext.jsx    # Central state management
        ├── config/
        │   └── gaugeRegistry.js        # Maps gauge types → components
        ├── hooks/
        │   ├── useSupabase.js          # Legacy hooks (kept for compat)
        │   ├── useGaugeData.js         # Data transformation
        │   ├── useDashboards.js        # Dashboard config fetching
        │   ├── useGaugeConfigs.js      # Gauge config fetching
        │   └── useDataSource.js        # Generic data fetcher
        ├── lib/
        │   ├── supabase.js             # Supabase client init
        │   └── dataTransformers.js     # Data transformation utils
        ├── components/
        │   ├── layout/
        │   │   ├── Header.jsx          # Top nav bar
        │   │   └── DashboardSelector.jsx # Dashboard dropdown
        │   ├── gauges/
        │   │   ├── GaugeWrapper.jsx    # Drill-down + error boundary
        │   │   ├── GaugeRenderer.jsx   # Dynamic component rendering
        │   │   └── DrillDownPanel.jsx  # Expandable detail panel
        │   ├── KPICard.jsx
        │   ├── RatingPieChart.jsx
        │   ├── SatisfactionTrend.jsx
        │   ├── TechPerformance.jsx
        │   ├── MetricLineChart.jsx
        │   ├── DataTable.jsx
        │   ├── DashboardSection.jsx
        │   └── FilterControls.jsx
        └── dashboards/
            └── DashboardContainer.jsx  # Main dashboard renderer
```

---

## Database Schema

### Data Tables

**csat** - Customer Thermometer responses
```sql
CREATE TABLE csat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_date TIMESTAMPTZ,
    company VARCHAR(200),
    tech_first_name VARCHAR(100),
    rating VARCHAR(50),          -- 'Gold Star', 'Yellow Light', 'Red Light'
    comment TEXT,
    ticket_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Configuration Tables

**dashboard_configs** - Dashboard definitions
```sql
CREATE TABLE dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,     -- 'csat', 'ticket-stats'
    name VARCHAR(100) NOT NULL,           -- 'Customer Satisfaction'
    description TEXT,
    data_source VARCHAR(100) NOT NULL,    -- Supabase table name
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**gauge_types** - Component registry
```sql
CREATE TABLE gauge_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_key VARCHAR(50) UNIQUE NOT NULL,  -- 'kpi_card', 'pie_chart'
    component_name VARCHAR(100) NOT NULL,
    supports_drill_down BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**gauge_configs** - Gauge instances
```sql
CREATE TABLE gauge_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID REFERENCES dashboard_configs(id) ON DELETE CASCADE,
    gauge_type_id UUID REFERENCES gauge_types(id),
    title VARCHAR(100) NOT NULL,
    section VARCHAR(100) DEFAULT 'Default',
    position JSONB NOT NULL,              -- {row, col, width, height}
    data_config JSONB NOT NULL,           -- Transformation settings
    display_config JSONB DEFAULT '{}',
    drill_down_config JSONB,              -- Optional drill-down settings
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Environment Variables

Create `.env` in `csat-dashboard/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repo-url>
cd csat/csat-dashboard
npm install
```

### 2. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Get your project URL and anon key from Settings → API
3. Create `.env` file with credentials

4. Run SQL migrations in Supabase SQL Editor (in order):
   ```
   supabase/migrations/001_dashboard_configs.sql
   supabase/seeds/001_gauge_types.sql
   supabase/seeds/002_csat_dashboard.sql
   ```

5. Create the `csat` data table:
   ```sql
   CREATE TABLE IF NOT EXISTS csat (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       response_date TIMESTAMPTZ,
       company VARCHAR(200),
       tech_first_name VARCHAR(100),
       rating VARCHAR(50),
       comment TEXT,
       ticket_number VARCHAR(50),
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   ALTER TABLE csat ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow public read" ON csat FOR SELECT USING (true);
   ```

6. (Optional) Disable RLS for development:
   ```sql
   ALTER TABLE dashboard_configs DISABLE ROW LEVEL SECURITY;
   ALTER TABLE gauge_types DISABLE ROW LEVEL SECURITY;
   ALTER TABLE gauge_configs DISABLE ROW LEVEL SECURITY;
   ALTER TABLE csat DISABLE ROW LEVEL SECURITY;
   ```

### 3. n8n Webhook Setup (for Customer Thermometer)

1. Create n8n workflow with Webhook trigger
2. Configure Customer Thermometer to send to webhook URL
3. Transform webhook data to match `csat` table schema
4. Insert into Supabase using HTTP Request or Supabase node

Example n8n transformation:
```javascript
return {
  response_date: $json.timestamp,
  company: $json.customer_name,
  tech_first_name: $json.custom_field_1,  // Adjust based on your CT setup
  rating: $json.rating_text,              // 'Gold Star', etc.
  comment: $json.comment,
  ticket_number: $json.custom_field_2
};
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 5. Production Build

```bash
npm run build
npm run preview  # Test production build locally
```

---

## Implementation Status

### Completed (Phase 1-7)

- [x] Supabase schema for config tables
- [x] DashboardContext for state management
- [x] Gauge registry and dynamic rendering
- [x] Header with dashboard selector dropdown
- [x] 6 gauge types: KPI Card, Pie Chart, Line Chart, Bar Chart, Multi-Line Chart, Data Table
- [x] Data transformation layer
- [x] Drill-down capability (expand-in-place)
- [x] Error boundaries (prevent white screen crashes)
- [x] Filter controls (date range, technician)
- [x] Auto-refresh (5 minute interval)
- [x] Light theme (BrightGauge-inspired)
- [x] CSAT dashboard configuration
- [x] Feature flag for legacy/config-driven mode

### Partially Complete

- [ ] Ticket Statistics dashboard (seed file created, needs `tickets` table)
- [ ] Drill-down click filtering (clicking pie slice to filter drill-down)

### Not Started (Future Features)

- [ ] Admin UI for managing dashboards/gauges
- [ ] User authentication
- [ ] Per-user dashboard preferences
- [ ] Drag-and-drop gauge reordering
- [ ] Real-time updates (Supabase Realtime)
- [ ] Dashboard sharing/export
- [ ] PDF report generation
- [ ] Email scheduled reports
- [ ] Custom date presets (This Week, Last 30 Days)
- [ ] Gauge comparison mode (compare two time periods)
- [ ] Mobile responsive improvements
- [ ] Dark mode toggle

---

## Adding New Dashboards

### Via SQL (Current Method)

1. Create data table in Supabase (if new data source)
2. Insert dashboard config:
   ```sql
   INSERT INTO dashboard_configs (slug, name, description, data_source, display_order)
   VALUES ('my-dashboard', 'My Dashboard', 'Description', 'my_table', 2);
   ```
3. Insert gauge configs (see `002_csat_dashboard.sql` for examples)

### Via Future Admin UI

1. Navigate to admin panel
2. Click "Add Dashboard"
3. Configure data source and gauges via form
4. Save and view immediately

---

## Adding New Gauge Types

1. **Create React component** in `src/components/`:
   ```jsx
   export default function MyGauge({ title, data, timestamp }) {
     // Render your gauge
   }
   ```

2. **Register in gaugeRegistry.js**:
   ```javascript
   import MyGauge from '../components/MyGauge'

   const gaugeRegistry = {
     // ... existing types
     my_gauge: {
       component: MyGauge,
       displayName: 'My Gauge',
       supportsDrillDown: true,
       defaultConfig: {}
     }
   }
   ```

3. **Add transformer** in `dataTransformers.js` (if needed)

4. **Handle props** in `GaugeRenderer.jsx`:
   ```javascript
   case 'my_gauge':
     return {
       ...baseProps,
       data: transformedData,
       // custom props
     }
   ```

5. **Insert gauge type** in Supabase:
   ```sql
   INSERT INTO gauge_types (type_key, component_name, supports_drill_down)
   VALUES ('my_gauge', 'MyGauge', true);
   ```

---

## Troubleshooting

### "Loading dashboard..." stuck
- Check browser console for errors
- Verify Supabase tables exist and have data
- Check RLS policies or disable RLS for testing
- Verify `.env` credentials are correct

### White screen after loading
- Error boundary should catch this - check for "Failed to render gauge" cards
- Check browser console for specific error
- May be data format mismatch in transformer

### Gauges show wrong data
- Check `data_config` JSON in gauge_configs table
- Verify field names match your data table columns
- Test transformer functions in isolation

### n8n webhook not inserting
- Check n8n execution logs
- Verify Supabase API key has insert permissions
- Check data format matches table schema

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `App.jsx` | Entry point, feature flag for legacy/config mode |
| `DashboardContext.jsx` | All state management, data fetching |
| `gaugeRegistry.js` | Maps type_key to React components |
| `GaugeRenderer.jsx` | Renders correct component with formatted props |
| `GaugeWrapper.jsx` | Adds drill-down and error boundary |
| `dataTransformers.js` | All data transformation functions |
| `002_csat_dashboard.sql` | Reference for gauge config JSON structure |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify

1. Push to GitHub
2. Import in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Self-Hosted

1. Build: `npm run build`
2. Serve `dist/` folder with any static host (nginx, Apache, etc.)
3. Ensure environment variables are set at build time

---

## Contributing

1. Create feature branch from `main`
2. Make changes
3. Test with `npm run build`
4. Submit PR with description of changes

---

## License

Private/Internal Use

---

## Contact

Project maintained by Jason Pierce
