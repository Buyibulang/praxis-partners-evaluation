import { QuotaManager } from './src/utils/quotaManager.js';
import { jest } from '@jest/globals';

// Mock localStorage for Node.js environment
if (typeof global !== 'undefined' && !global.localStorage) {
  global.localStorage = {
    storage: {},
    getItem(key) {
      return this.storage[key] || null;
    },
    setItem(key, value) {
      this.storage[key] = value.toString();
    },
    removeItem(key) {
      delete this.storage[key];
    }
  };
}

async function testQuotaManager() {
  console.log('=== Quota Manager Tests ===\n');

  try {
    // Test 1: Get initial quota status
    console.log('Test 1: Get initial quota status');
    const freeTierStatus = await QuotaManager.getQuotaStatus();
    console.log(JSON.stringify(freeTierStatus, null, 2));
    console.log('\n');

    // Test 2: Check upgrade requirements
    console.log('Test 2: Check upgrade requirements for FREE tier');
    console.log('AI Analysis upgrade required:', QuotaManager.isUpgradeRequired('FREE', 'ai-analysis'));
    console.log('Export upgrade required:', QuotaManager.isUpgradeRequired('FREE', 'export'));
    console.log('Evaluations upgrade required:', QuotaManager.isUpgradeRequired('FREE', 'evaluation'));
    console.log('\n');

    // Test 3: Get feature limits
    console.log('Test 3: Get feature limits');
    console.log('FREE tier evaluation limit:', QuotaManager.getFeatureLimit('FREE', 'evaluation'));
    console.log('PRO tier AI credits limit:', QuotaManager.getFeatureLimit('PRO', 'ai-analysis'));
    console.log('PREMIUM tier comparison limit:', QuotaManager.getFeatureLimit('PREMIUM', 'compare'));
    console.log('\n');

    // Test 4: Validate usage
    console.log('Test 4: Validate usage');
    try {
      await QuotaManager.validateUsage('evaluation', 1);
      console.log('✓ Can perform evaluation');
    } catch (error) {
      console.log('✗ Validation failed:', error.message);
    }

    try {
      await QuotaManager.validateUsage('ai-analysis', 1);
      console.log('✗ Should have failed for AI analysis on FREE tier');
    } catch (error) {
      console.log('✓ Correctly prevented AI analysis:', error.message);
    }
    console.log('\n');

    // Test 5: Record usage
    console.log('Test 5: Record usage');
    await QuotaManager.recordUsage('evaluation');
    const afterOneEvaluation = await QuotaManager.getQuotaStatus();
    console.log('Evaluations used after one evaluation:', afterOneEvaluation.evaluation.used);
    console.log('Remaining evaluations:', afterOneEvaluation.evaluation.remaining);
    console.log('\n');

    await QuotaManager.recordUsage('evaluation');
    const afterTwoEvaluation = await QuotaManager.getQuotaStatus();
    console.log('Evaluations used after two evaluations:', afterTwoEvaluation.evaluation.used);
    console.log('Remaining evaluations:', afterTwoEvaluation.evaluation.remaining);
    console.log('\n');

    // Test 6: Test quota limit enforcement
    console.log('Test 6: Test quota limit enforcement');
    try {
      await QuotaManager.recordUsage('evaluation');
      console.log('✗ Should have failed - over the limit');
    } catch (error) {
      console.log('✓ Correctly enforced limit:', error.message);
    }
    console.log('\n');

    // Test 7: Test PRO tier
    console.log('Test 7: Test PRO tier');
    await QuotaManager.setMockData({ tier: 'PRO', evaluations_used: 5, ai_credits_used: 2 });
    const proStatus = await QuotaManager.getQuotaStatus();
    console.log('PRO tier status:', JSON.stringify(proStatus, null, 2));
    console.log('\n');

    // Test 8: Test PREMIUM tier
    console.log('Test 8: Test PREMIUM tier');
    await QuotaManager.setMockData({ tier: 'PREMIUM' });
    const premiumStatus = await QuotaManager.getQuotaStatus();
    console.log('PREMIUM tier status:', JSON.stringify(premiumStatus, null, 2));
    console.log('\n');

    // Test 9: Test monthly reset
    console.log('Test 9: Test monthly reset');
    await QuotaManager.setMockData({ tier: 'FREE', evaluations_used: 2 });
    const statusBeforeReset = await QuotaManager.getQuotaStatus();
    console.log('Status before reset:', JSON.stringify(statusBeforeReset.evaluation, null, 2));

    await QuotaManager.resetMonthlyLimits();
    const statusAfterReset = await QuotaManager.getQuotaStatus();
    console.log('Status after reset:', JSON.stringify(statusAfterReset.evaluation, null, 2));
    console.log('\n');

    // Test 10: Test with all possible tier configurations
    console.log('Test 10: Test all tier configurations');
    const tiers = ['FREE', 'PRO', 'PREMIUM'];

    for (const tier of tiers) {
      await QuotaManager.setMockData({ tier });
      const status = await QuotaManager.getQuotaStatus();
      console.log(`${tier} tier summary:`);
      console.log(`  Evaluations: ${status.evaluation.used}/${status.evaluation.limit === -1 ? '∞' : status.evaluation.limit}`);
      console.log(`  AI Credits: ${status.aiCredits.used}/${status.aiCredits.limit === -1 ? '∞' : status.aiCredits.limit}`);
      console.log(`  Compare Features: ${status.compare.limit === 0 ? 'Not available' : status.compare.limit === -1 ? 'Unlimited' : `Limit: ${status.compare.limit}`}`);
      console.log(`  Export Features: ${status.export.limit === 0 ? 'Not available' : status.export.limit === -1 ? 'Unlimited' : `Limit: ${status.export.limit}`}`);
      console.log('');
    }

    console.log('All tests completed successfully!');

    // Cleanup
    await QuotaManager.clearMockData();

  } catch (error) {
    console.error('Test failed:', error);
    console.error(error.stack);
  }
}

// Run tests
testQuotaManager();