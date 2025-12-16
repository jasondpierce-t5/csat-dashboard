-- Migration: Create dashboard configuration tables
-- Description: Schema for modular dashboard platform with configurable gauges

-- Dashboard definitions
CREATE TABLE IF NOT EXISTS dashboard_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    data_source VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gauge type registry (maps to React components)
CREATE TABLE IF NOT EXISTS gauge_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_key VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    component_name VARCHAR(100) NOT NULL,
    supports_drill_down BOOLEAN DEFAULT false,
    default_config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gauge instances configured on dashboards
CREATE TABLE IF NOT EXISTS gauge_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES dashboard_configs(id) ON DELETE CASCADE,
    gauge_type_id UUID NOT NULL REFERENCES gauge_types(id),
    title VARCHAR(100) NOT NULL,
    section VARCHAR(100) DEFAULT 'Default',
    position JSONB NOT NULL DEFAULT '{"row": 0, "col": 0, "width": 1, "height": 1}'::jsonb,
    data_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_config JSONB DEFAULT '{}'::jsonb,
    drill_down_config JSONB,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_slug ON dashboard_configs(slug);
CREATE INDEX IF NOT EXISTS idx_dashboard_configs_active ON dashboard_configs(is_active);
CREATE INDEX IF NOT EXISTS idx_gauge_configs_dashboard ON gauge_configs(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_gauge_configs_active ON gauge_configs(is_active);

-- Enable Row Level Security (optional, for future admin UI)
ALTER TABLE dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gauge_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE gauge_configs ENABLE ROW LEVEL SECURITY;

-- Public read access policies (adjust as needed for your auth setup)
CREATE POLICY "Allow public read access to dashboard_configs"
    ON dashboard_configs FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to gauge_types"
    ON gauge_types FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to gauge_configs"
    ON gauge_configs FOR SELECT
    USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_dashboard_configs_updated_at ON dashboard_configs;
CREATE TRIGGER update_dashboard_configs_updated_at
    BEFORE UPDATE ON dashboard_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gauge_configs_updated_at ON gauge_configs;
CREATE TRIGGER update_gauge_configs_updated_at
    BEFORE UPDATE ON gauge_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
