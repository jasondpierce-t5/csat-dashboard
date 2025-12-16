-- Seed: Ticket Statistics Dashboard configuration
-- Description: Example second dashboard for ticket data
-- NOTE: This requires a 'tickets' table in Supabase with appropriate columns

-- Insert Ticket Statistics Dashboard
INSERT INTO dashboard_configs (slug, name, description, data_source, is_active, display_order)
VALUES (
    'ticket-stats',
    'Ticket Statistics',
    'Service ticket metrics and performance tracking',
    'tickets',
    true,
    2
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    data_source = EXCLUDED.data_source;

-- Example gauge configurations for Ticket Statistics
-- These will need to be adjusted based on your actual tickets table schema
DO $$
DECLARE
    v_dashboard_id UUID;
    v_kpi_card_id UUID;
    v_line_chart_id UUID;
    v_bar_chart_id UUID;
    v_data_table_id UUID;
BEGIN
    -- Get dashboard ID
    SELECT id INTO v_dashboard_id FROM dashboard_configs WHERE slug = 'ticket-stats';

    -- Get gauge type IDs
    SELECT id INTO v_kpi_card_id FROM gauge_types WHERE type_key = 'kpi_card';
    SELECT id INTO v_line_chart_id FROM gauge_types WHERE type_key = 'line_chart';
    SELECT id INTO v_bar_chart_id FROM gauge_types WHERE type_key = 'bar_chart';
    SELECT id INTO v_data_table_id FROM gauge_types WHERE type_key = 'data_table';

    -- Clear existing gauge configs for this dashboard
    DELETE FROM gauge_configs WHERE dashboard_id = v_dashboard_id;

    -- Overview Section - KPI Cards
    -- NOTE: Adjust field names to match your tickets table schema
    INSERT INTO gauge_configs (dashboard_id, gauge_type_id, title, section, position, data_config, display_config, drill_down_config, display_order)
    VALUES
    (
        v_dashboard_id,
        v_kpi_card_id,
        'Open Tickets',
        'Overview',
        '{"row": 0, "col": 0, "width": 1, "height": 1}'::jsonb,
        '{"metric": "filtered_count", "aggregation": "count", "filterField": "status", "filterValue": "Open", "format": "number"}'::jsonb,
        '{"subtitle": "Currently open"}'::jsonb,
        '{"type": "table", "title": "Open Tickets", "columns": ["ticket_number", "company", "summary", "created_date"], "filterField": "status", "filterValue": "Open", "maxRows": 50}'::jsonb,
        1
    ),
    (
        v_dashboard_id,
        v_kpi_card_id,
        'Closed This Month',
        'Overview',
        '{"row": 0, "col": 1, "width": 1, "height": 1}'::jsonb,
        '{"metric": "filtered_count", "aggregation": "count", "filterField": "status", "filterValue": "Closed", "format": "number"}'::jsonb,
        '{"subtitle": "Resolved tickets"}'::jsonb,
        NULL,
        2
    ),
    (
        v_dashboard_id,
        v_kpi_card_id,
        'Avg Resolution Time',
        'Overview',
        '{"row": 0, "col": 2, "width": 1, "height": 1}'::jsonb,
        '{"metric": "average", "field": "resolution_hours", "format": "hours"}'::jsonb,
        '{"subtitle": "Hours to close"}'::jsonb,
        NULL,
        3
    ),
    (
        v_dashboard_id,
        v_kpi_card_id,
        'Total Tickets',
        'Overview',
        '{"row": 0, "col": 3, "width": 1, "height": 1}'::jsonb,
        '{"metric": "total_count", "aggregation": "count", "format": "number"}'::jsonb,
        '{"subtitle": "All time"}'::jsonb,
        NULL,
        4
    ),

    -- Trends Section
    (
        v_dashboard_id,
        v_data_table_id,
        'Recent Tickets',
        'Activity',
        '{"row": 1, "col": 0, "width": 2, "height": 1}'::jsonb,
        '{"columns": [{"key": "ticket_number", "header": "Ticket #", "type": "link"}, {"key": "company", "header": "Company"}, {"key": "summary", "header": "Summary"}, {"key": "status", "header": "Status"}, {"key": "created_date", "header": "Created", "type": "date"}], "orderBy": "created_date", "orderDirection": "desc", "limit": 10}'::jsonb,
        '{}'::jsonb,
        NULL,
        5
    ),
    (
        v_dashboard_id,
        v_bar_chart_id,
        'Tickets by Technician',
        'Activity',
        '{"row": 1, "col": 2, "width": 2, "height": 1}'::jsonb,
        '{"groupBy": "assigned_to", "metric": "count", "orderBy": "count", "orderDirection": "desc"}'::jsonb,
        '{}'::jsonb,
        '{"type": "table", "title": "Technician Tickets", "columns": ["ticket_number", "company", "summary", "status"], "maxRows": 50}'::jsonb,
        6
    );

END $$;

-- IMPORTANT: You'll need to create a 'tickets' table in Supabase
-- Example schema:
/*
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    company VARCHAR(200),
    summary TEXT,
    status VARCHAR(50) DEFAULT 'Open',
    priority VARCHAR(50),
    assigned_to VARCHAR(100),
    created_date TIMESTAMPTZ DEFAULT NOW(),
    closed_date TIMESTAMPTZ,
    resolution_hours DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tickets"
    ON tickets FOR SELECT
    USING (true);
*/
