-- Migration: Create payments table
-- Description: Stores payment transaction records with provider information and metadata

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'CNY',
  provider TEXT NOT NULL,  -- 'wechat' or 'stripe'
  status TEXT NOT NULL,  -- 'pending', 'succeeded', 'failed', 'refunded'
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient lookup by subscription_id
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);

-- Index for efficient lookup by transaction_id (for payment provider callbacks)
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
