-- Migration: Create subscriptions table
-- Description: Stores subscription records for users with their current plan and status

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,  -- 'pro' or 'premium'
  status TEXT NOT NULL,  -- 'active', 'canceled', 'expired', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient lookup by user_id
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Index for efficient filtering by subscription status
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
