# Quick Start Guide: Quota Management System

## Setup in 3 Easy Steps

### 1. Import the Quota Manager

```javascript
import { QuotaManager } from '../utils/quotaManager';
```

### 2. Check Quota Before Performing Actions

```javascript
// Simple example for evaluations
try {
  await QuotaManager.validateUsage('evaluation');
  // Safe to proceed
} catch (error) {
  if (error.name === 'QuotaError') {
    alert('You need to upgrade your plan!');
    return;
  }
}
```

### 3. Record Usage After Completing Actions

```javascript
// After successful evaluation
try {
  await QuotaManager.recordUsage('evaluation');
  console.log('Usage recorded successfully');
} catch (error) {
  console.error('Error recording usage:', error);
}
```

## Common Usage Patterns

### Pattern 1: Button with Quota Check

```javascript
async function createEvaluation() {
  try {
    // Check and record in one step
    await QuotaManager.recordUsage('evaluation');

    // Perform the actual evaluation
    const result = await createYourEvaluation();

    return result;

  } catch (error) {
    if (error.name === 'QuotaError') {
      showUpgradeModal();
    } else {
      showError(error.message);
    }
  }
}
```

### Pattern 2: Show Quota Status

```javascript
async function showUserQuotaStatus() {
  const status = await QuotaManager.getQuotaStatus();

  return `
    📊 Your Usage Status:
    • Evaluations: ${status.evaluation.used}/${status.evaluation.limit}
    • AI Credits: ${status.aiCredits.used}/${status.aiCredits.limit}
    • Tier: ${status.tier}
  `;
}
```

### Pattern 3: Disable Features Based on Quota

```javascript
async function isAIFeatureAvailable() {
  const needsUpgrade = QuotaManager.isUpgradeRequired('ai-analysis');
  return !needsUpgrade;
}

// In your UI
<button disabled={!isAIFeatureAvailable()}>
  AI Analysis
</button>
```

## Tier Features Reference

| Feature | FREE | PRO | PREMIUM |
|---------|------|-----|---------|
| Evaluations/month | 2 | 10 | ∞ |
| AI Credits/month | 0 | 5 | ∞ |
| Compare Projects | ❌ | ✅ (3) | ✅ (∞) |
| Export Data | ❌ | ✅ | ✅ |
| Cost | $0 | $49/mo | $199/mo |

## Development Tips

### Testing Different Scenarios

```javascript
// Test FREE tier limits
await QuotaManager.setMockData({ tier: 'FREE' });

// Test PRO tier with partial usage
await QuotaManager.setMockData({
  tier: 'PRO',
  evaluations_used: 8, // 2 remaining
  ai_credits_used: 4   // 1 remaining
});

// Test PREMIUM tier
await QuotaManager.setMockData({ tier: 'PREMIUM' });

// Clean up after testing
await QuotaManager.clearMockData();
```

### Common Errors to Handle

```javascript
try {
  await QuotaManager.recordUsage('evaluation');
} catch (error) {
  if (error.name === 'QuotaError') {
    // User exceeded their limit
    console.log(`Feature: ${error.feature}`);
    console.log(`Used: ${error.used}/${error.limit}`);
  } else {
    // Other error (network, permissions, etc.)
    console.error('Unexpected error:', error);
  }
}
```

## Need More Help?

See the full documentation in `QUOTA_MANAGEMENT.md` for:
- Complete API reference
- Database schema setup
- Security considerations
- Integration examples
- Troubleshooting guide