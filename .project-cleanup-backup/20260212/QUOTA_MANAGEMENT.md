# Quota Management System

A comprehensive quota management utility for tracking and enforcing usage limits across different subscription tiers in the venture evaluation platform.

## Overview

The `QuotaManager` class provides a complete solution for managing user quotas across different subscription tiers, with support for both development (mock mode) and production (Supabase) environments.

## Features

- **Tier-based quota management**: FREE, PRO, and PREMIUM tiers with different limits
- **Feature tracking**: Evaluations, AI analysis, project comparisons, and exports
- **Automated monthly reset**: Automatically resets usage counters on the configured day
- **Development mode**: Uses localStorage for testing without Supabase
- **Production mode**: Full Supabase integration for real user data
- **Comprehensive error handling**: Custom QuotaError class for quota violations
- **Usage validation**: Prevents users from exceeding their limits

## Installation

The quota manager is already included in the project. To use it in your components:

```javascript
import { QuotaManager } from '../utils/quotaManager';
```

## Usage

### Getting Quota Status

```javascript
// Get current user's quota status
const quotaStatus = await QuotaManager.getQuotaStatus();

// Or specify tier and usage for testing
const status = await QuotaManager.getQuotaStatus('PRO', 5, 3);
```

The returned status object includes:

```javascript
{
  tier: 'FREE', // or 'PRO', 'PREMIUM'
  evaluation: {
    used: 2,
    limit: 10,
    isUnlimited: false,
    remaining: 8,
    usagePercent: 20,
    isUpgradeRequired: false
  },
  aiCredits: { /* similar structure */ },
  compare: { /* similar structure */ },
  export: { /* similar structure */ },
  lastResetDate: '2024-01-15T10:30:00Z',
  resetDay: 1
}
```

### Checking Feature Availability

```javascript
// Check if a feature requires an upgrade
const needsUpgrade = QuotaManager.isUpgradeRequired('FREE', 'ai-analysis');
// Returns: true

// Get specific feature limit
const limit = QuotaManager.getFeatureLimit('PRO', 'evaluation');
// Returns: 10
```

### Recording Usage

```javascript
try {
  // Validate before recording
  await QuotaManager.validateUsage('evaluation');

  // Perform the action
  const result = await performEvaluation();

  // Record the usage (increments by 1 by default)
  await QuotaManager.recordUsage('evaluation');

} catch (error) {
  if (error.name === 'QuotaError') {
    console.log(`Quota exceeded: ${error.message}`);
    // Show upgrade prompt
  }
}
```

### Monthly Reset

```javascript
// Manual reset (usually handled automatically)
await QuotaManager.resetMonthlyLimits();
```

## Tiers and Limits

### FREE Tier
- Evaluations: 2 per month
- AI Credits: 0 (upgrade required)
- Compare: Not available (upgrade required)
- Export: Not available (upgrade required)

### PRO Tier
- Evaluations: 10 per month
- AI Credits: 5 per month
- Compare: Up to 3 projects
- Export: Available

### PREMIUM Tier
- Evaluations: Unlimited
- AI Credits: Unlimited
- Compare: Unlimited
- Export: Unlimited

## Configuration

### Environment Variables

Set these in your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Database Schema

Ensure your Supabase database has a `user_quotas` table:

```sql
CREATE TABLE user_quotas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  tier VARCHAR(20) DEFAULT 'FREE',
  evaluations_used INTEGER DEFAULT 0,
  ai_credits_used INTEGER DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reset_day INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_quotas_user_id ON user_quotas(user_id);

-- Set up RLS policies
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;

-- Allow users to read and update their own quota data
CREATE POLICY "Users can manage own quotas"
  ON user_quotas
  FOR ALL
  USING (auth.uid() = user_id);
```

## Development Mode

In development (when `import.meta.env.DEV` is true), the quota manager uses localStorage:

```javascript
// Set mock data for testing
await QuotaManager.setMockData({
  tier: 'PRO',
  evaluations_used: 5,
  ai_credits_used: 3
});

// Clear mock data
await QuotaManager.clearMockData();
```

### Auto-Reset Logic

The monthly reset checks if:
1. The current month/year is different from the last reset
2. The current day is equal to or greater than the reset day (default: 1st of month)

This ensures that users who haven't accessed the app in a while will still get their quotas reset when they return.

## Error Handling

The quota manager includes custom error types:

```javascript
class QuotaError extends Error {
  constructor(message, feature, limit, used) {
    super(message);
    this.name = 'QuotaError';
    this.feature = feature;
    this.limit = limit;
    this.used = used;
  }
}
```

Handle quota errors in your application:

```javascript
try {
  await QuotaManager.recordUsage('evaluation');
} catch (error) {
  if (error.name === 'QuotaError') {
    showUpgradePrompt(error.feature);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

## Testing

Run the comprehensive test suite:

```bash
npm test src/utils/__tests__/quotaManager.test.js
```

Or run the interactive demo:

```bash
node testQuotaManager.js
```

## Best Practices

1. **Always validate before performing actions**: Use `validateUsage()` before making substantial changes.

2. **Handle quota errors gracefully**: Provide clear upgrade paths when limits are reached.

3. **Use the monthly reset**: Let the automated system handle resets rather than manual resets.

4. **Log usage**: Consider adding analytics to track which features are most used.

5. **Cache quota status**: Cache the status in your component state to avoid unnecessary API calls.

## API Reference

### Static Methods

#### `getQuotaStatus(tier, evaluationsUsed, aiCreditsUsed)`
Returns the complete quota status for a user.
- **Parameters**: All optional for testing purposes
- **Returns**: Promise resolving to quota status object

#### `isUpgradeRequired(tier, feature)`
Checks if a feature requires upgrading the tier.
- **Parameters**: tier (string), feature (string)
- **Returns**: boolean

#### `getFeatureLimit(tier, feature)`
Gets the specific limit for a feature in a tier.
- **Parameters**: tier (string), feature (string)
- **Returns**: number (-1 for unlimited, 0 for not available)

#### `resetMonthlyLimits()`
Manually triggers a monthly reset of all counters.
- **Returns**: Promise resolving to updated quota data

#### `validateUsage(feature, additionalUsage)`
Validates if a user can use a feature.
- **Parameters**: feature (string), additionalUsage (number, default: 1)
- **Returns**: Promise resolving to true or throwing QuotaError

#### `recordUsage(feature, increment)`
Records usage of a feature and validates limits.
- **Parameters**: feature (string), increment (number, default: 1)
- **Returns**: Promise resolving to updated quota data

#### `setMockData(mockData)`
Sets mock data in development mode.
- **Parameters**: mockData (object)
- **Returns**: Promise resolving to updated mock data

#### `clearMockData()`
Clears mock data in development mode.
- **Returns**: Promise resolving to boolean

## Integration Examples

### React Component Example

```javascript
import React, { useEffect, useState } from 'react';
import { QuotaManager } from '../utils/quotaManager';

function EvaluationComponent() {
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    loadQuotaStatus();
  }, []);

  async function loadQuotaStatus() {
    try {
      const status = await QuotaManager.getQuotaStatus();
      setQuota(status);
    } catch (error) {
      console.error('Failed to load quota:', error);
    }
  }

  async function handleEvaluation() {
    try {
      await QuotaManager.recordUsage('evaluation');
      // Perform evaluation
      alert('Evaluation created successfully!');
      loadQuotaStatus();
    } catch (error) {
      if (error.name === 'QuotaError') {
        alert(`You've reached your limit. ${error.message}`);
      }
    }
  }

  if (!quota) return <div>Loading...</div>;

  return (
    <div>
      <p>You've used {quota.evaluation.used} of {quota.evaluation.isUnlimited ? '∞' : quota.evaluation.limit} evaluations</p>
      <button onClick={handleEvaluation} disabled={quota.evaluation.remaining === 0}>
        Create Evaluation
      </button>
    </div>
  );
}
```

## Security Considerations

1. **RLS Policies**: Ensure Row Level Security is enabled on the user_quotas table
2. **Server-side validation**: Always validate quotas on the server for critical operations
3. **Rate limiting**: Consider implementing rate limiting on API endpoints
4. **Audit logging**: Log quota exceed events for monitoring

## Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure supabaseClient.js is properly configured
2. **Quota not resetting**: Check the last_reset_date and reset_day values
3. **Upgrade required errors**: Verify feature limits configuration
4. **localStorage not working**: Check browser privacy settings

### Debug Mode

Enable debug logging:

```javascript
// Add to your component
QuotaManager.debug = true; // if implemented
```

## Contributing

When adding new features:
1. Update the FEATURES constant
2. Add limits to FEATURE_LIMITS for each tier
3. Update FEATURE_DESCRIPTIONS
4. Add tests for new functionality
5. Update this documentation
