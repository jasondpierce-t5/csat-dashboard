-- Seed: Gauge type registry
-- Description: Maps gauge type keys to React component names

INSERT INTO gauge_types (type_key, display_name, component_name, supports_drill_down, default_config) VALUES
    ('kpi_card', 'KPI Card', 'KPICard', true, '{"showChange": true}'::jsonb),
    ('pie_chart', 'Pie Chart', 'RatingPieChart', true, '{}'::jsonb),
    ('line_chart', 'Line Chart', 'SatisfactionTrend', true, '{"showTarget": true, "targetValue": 90}'::jsonb),
    ('bar_chart', 'Bar Chart', 'TechPerformance', true, '{"minResponses": 5}'::jsonb),
    ('multi_line_chart', 'Multi-Line Chart', 'MetricLineChart', false, '{}'::jsonb),
    ('data_table', 'Data Table', 'DataTable', false, '{"pageSize": 10}'::jsonb)
ON CONFLICT (type_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    component_name = EXCLUDED.component_name,
    supports_drill_down = EXCLUDED.supports_drill_down,
    default_config = EXCLUDED.default_config;
