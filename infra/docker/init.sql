-- CareKaki database initialisation
-- Full schema is managed by profile-service/drizzle migrations
-- This file runs once on first Postgres startup

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Placeholder tables created by each service's migration tool at startup
-- profile-service  → care_profiles table
-- handover-service → care_briefs, coordinator_cases tables
-- knowledge-service → service_records table (populated from seed JSON)
