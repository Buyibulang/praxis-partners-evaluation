-- Migration: Create usage_limits table
-- Description: Tracks resource usage against plan limits for each user

CREATE TABLE IF NOT EXISTS usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL,
  evaluations_used INTEGER DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  last_reset_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient lookup by user_id
CREATE INDEX idx_usage_limits_user_id ON usage_limits(user_id);

-- Index for efficient filtering and grouping by plan_id
CREATE INDEX idx_usage_limits_plan_id ON usage_limits(plan_id);
