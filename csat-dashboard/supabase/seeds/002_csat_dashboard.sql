-- Seed: CSAT Dashboard configuration
-- Description: Configures the Customer Satisfaction dashboard with all its gauges

-- Insert CSAT Dashboard
INSERT INTO dashboard_configs (slug, name, description, data_source, is_active, display_order)
VALUES (
    'csat',
    'Customer Satisfaction',
    'Real-time CSAT metrics from Customer Thermometer',
    'csat',
    true,
    1
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    data_source = EXCLUDED.data_source;

-- Get references for foreign keys
DO $$
DECLARE
    v_dashboard_id UUID;
    v_kpi_card_id UUID;
    v_pie_chart_id UUID;
    v_line_chart_id UUID;
    v_bar_chart_id UUID;
    v_multi_line_id UUID;
    v_data_table_id UUID;
BEGIN
    -- Get dashboard ID
    SELECT id INTO v_dashboard_id FROM dashboard_configs WHERE slug = 'csat';

    -- Get gauge type IDs
    SELECT id INTO v_kpi_card_id FROM gauge_types WHERE type_key = 'kpi_card';
    SELECT id INTO v_pie_chart_id FROM gauge_types WHERE type_key = 'pie_chart';
    SELECT id INTO v_line_chart_id FROM gauge_types WHERE type_key = 'line_chart';
    SELECT id INTO v_bar_chart_id FROM gauge_types WHERE type_key = 'bar_chart';
    SELECT id INTO v_multi_line_id FROM gauge_types WHERE type_key = 'multi_line_chart';
    SELECT id INTO v_data_table_id FROM gauge_types WHERE type_key = 'data_table';

    -- Clear existing gauge configs for this dashboard
    DELETE FROM gauge_configs WHERE dashboard_id = v_dashboard_id;

    -- Business Section - KPI Cards
    INSERT INTO gauge_configs (dashboard_id, gauge_type_id, title, section, position, data_config, display_config, drill_down_config, display_order)
    VALUES
    (
        v_dashboard_id,
        v_kpi_card_id,
        'Satisfaction Rate',
        'Business',
        '{"row": 0, "col": 0, "width": 1, "height": 1}'::jsonb,
        '{"metric": "satisfaction_rate", "aggregation": "percentage", "numerator_field": "rating", "numerator_value": "Gold Star", "format": "percent", "comparison": {"enabled": true, "period": "previous_month"}}'::jsonb,
        '{"showChange": true}'::jsonb,
        '{"type": "table", "title": "Gold Star Responses", "columns": ["company", "technician", "rating", "response_date"], "filterField": "rating", "filterValue": "Gold Star", "maxRows": 50}'::jsonb,
        1
    ),
    (
        v_dashboard_id,
        v_kpi_card_id,
        'Total Responses',
        'Business',
        '{"row": 0, "col": 1, "width": 1, "height": 1}'::jsonb,
        '{"metric": "total_count", "aggregation": "count", "format": "number"}'::jsonb,
        '{"subtitle": "All time"}'::jsonb,
        '{"type": "table", "title": "All Responses", "columns": ["company", "technician", "rating", "response_date"], "maxRows": 50}'::jsonb,
        2
    ),
    (
        v_dashboard_id,
        v_kpi_card_id,
        'Unique Companies',
        'Business',
        '{"row": 0, "col": 2, "width": 1, "height": 1}'::jsonb,
        '{"metric": "unique_count", "aggregation": "distinct", "field": "company", "format": "number"}'::jsonb,
        '{"subtitle": "Active customers"}'::jsonb,
        '{"type": "table", "title": "Companies", "columns": ["company"], "distinct": true, "maxRows": 50}'::jsonb,
        3
    ),
    (
        v_dashboard_id,
        v_kpi_card_id,
        'Gold Star Count',
        'Business',
        '{"row": 0, "col": 3, "width": 1, "height": 1}'::jsonb,
        '{"metric": "filtered_count", "aggregation": "count", "filterField": "rating", "filterValue": "Gold Star", "format": "number"}'::jsonb,
        '{"subtitle": "Excellent ratings"}'::jsonb,
        '{"type": "table", "title": "Gold Star Responses", "columns": ["company", "technician", "response_date"], "filterField": "rating", "filterValue": "Gold Star", "maxRows": 50}'::jsonb,
        4
    ),

    -- Satisfaction Metrics Section
    (
        v_dashboard_id,
        v_data_table_id,
        'Recent Responses',
        'Satisfaction Metrics',
        '{"row": 1, "col": 0, "width": 2, "height": 1}'::jsonb,
        '{"columns": [{"key": "company", "header": "Company", "type": "link"}, {"key": "tech_first_name", "header": "Technician"}, {"key": "rating", "header": "Rating"}, {"key": "response_date", "header": "Response Date", "type": "date", "highlight": true}], "orderBy": "response_date", "orderDirection": "desc", "limit": 10}'::jsonb,
        '{}'::jsonb,
        NULL,
        5
    ),
    (
        v_dashboard_id,
        v_multi_line_id,
        'Response Trends',
        'Satisfaction Metrics',
        '{"row": 1, "col": 2, "width": 2, "height": 1}'::jsonb,
        '{"groupBy": "month", "dateField": "response_date", "metrics": [{"field": "rating", "value": "Gold Star", "name": "Gold Star", "color": "green"}, {"field": "rating", "value": "Yellow Light", "name": "Yellow Light", "color": "yellow"}, {"field": "rating", "value": "Red Light", "name": "Red Light", "color": "red"}], "includeTotalLine": true, "limit": 12}'::jsonb,
        '{}'::jsonb,
        NULL,
        6
    ),

    -- Analytics Section
    (
        v_dashboard_id,
        v_pie_chart_id,
        'Rating Distribution',
        'Analytics',
        '{"row": 2, "col": 0, "width": 2, "height": 1}'::jsonb,
        '{"groupBy": "rating", "colors": {"Gold Star": "#22c55e", "Yellow Light": "#eab308", "Red Light": "#ef4444"}}'::jsonb,
        '{}'::jsonb,
        '{"type": "table", "title": "Responses by Rating", "columns": ["company", "technician", "rating", "response_date"], "maxRows": 50}'::jsonb,
        7
    ),
    (
        v_dashboard_id,
        v_line_chart_id,
        'Satisfaction Trend',
        'Analytics',
        '{"row": 2, "col": 2, "width": 2, "height": 1}'::jsonb,
        '{"groupBy": "month", "dateField": "response_date", "metric": "satisfaction_percentage", "numeratorField": "rating", "numeratorValue": "Gold Star", "targetLine": 90, "limit": 12}'::jsonb,
        '{"showTarget": true}'::jsonb,
        '{"type": "table", "title": "Monthly Details", "columns": ["month", "satisfaction", "responses"], "maxRows": 12}'::jsonb,
        8
    ),

    -- Team Performance Section
    (
        v_dashboard_id,
        v_bar_chart_id,
        'Technician Performance',
        'Team Performance',
        '{"row": 3, "col": 0, "width": 4, "height": 1}'::jsonb,
        '{"groupBy": "tech_first_name", "metric": "satisfaction_percentage", "numeratorField": "rating", "numeratorValue": "Gold Star", "minCount": 5, "orderBy": "satisfaction", "orderDirection": "desc"}'::jsonb,
        '{"minResponses": 5}'::jsonb,
        '{"type": "table", "title": "Technician Details", "columns": ["tech_first_name", "company", "rating", "response_date"], "maxRows": 50}'::jsonb,
        9
    );

END $$;
