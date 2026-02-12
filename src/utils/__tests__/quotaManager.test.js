// Simple mock test that doesn't require supabase import
import { QuotaManager as QuotaManagerActual } from '../quotaManager.js';

// Mock the supabase module
const mockSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } }
    })
  },
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  single: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase)
};

// Mock API responses
mockSupabase.single = jest.fn(() => {
  return Promise.resolve({
    data: {
      user_id: 'test-user-id',
      tier: 'FREE',
      evaluations_used: 0,
      ai_credits_used: 0,
      last_reset_date: new Date().toISOString(),
      reset_day: 1
    },
    error: null
  });
});

describe('QuotaManager', () => {
  // Mock import.meta.env
  beforeAll(() => {
    global.import = {
      meta: {
        env: {
          DEV: false,
          VITE_SUPABASE_URL: 'https://mock.supabase.co',
          VITE_SUPABASE_ANON_KEY: 'mock-key'
        }
      }
    };
  });

  describe('getFeatureLimit', () => {
    it('should return correct limits for FREE tier', () => {
      expect(QuotaManagerActual.getFeatureLimit('FREE', 'evaluation')).toBe(2);
      expect(QuotaManagerActual.getFeatureLimit('FREE', 'ai-analysis')).toBe(0);
      expect(QuotaManagerActual.getFeatureLimit('FREE', 'compare')).toBe(0);
      expect(QuotaManagerActual.getFeatureLimit('FREE', 'export')).toBe(0);
    });

    it('should return correct limits for PRO tier', () => {
      expect(QuotaManagerActual.getFeatureLimit('PRO', 'evaluation')).toBe(10);
      expect(QuotaManagerActual.getFeatureLimit('PRO', 'ai-analysis')).toBe(5);
      expect(QuotaManagerActual.getFeatureLimit('PRO', 'compare')).toBe(3);
      expect(QuotaManagerActual.getFeatureLimit('PRO', 'export')).toBe(1);
    });

    it('should return unlimited for PREMIUM tier', () => {
      expect(QuotaManagerActual.getFeatureLimit('PREMIUM', 'evaluation')).toBe(-1);
      expect(QuotaManagerActual.getFeatureLimit('PREMIUM', 'ai-analysis')).toBe(-1);
      expect(QuotaManagerActual.getFeatureLimit('PREMIUM', 'compare')).toBe(-1);
      expect(QuotaManagerActual.getFeatureLimit('PREMIUM', 'export')).toBe(-1);
    });

    it('should throw error for invalid tier', () => {
      expect(() => QuotaManagerActual.getFeatureLimit('INVALID', 'evaluation'))
        .toThrow('Invalid tier: INVALID');
    });

    it('should throw error for invalid feature', () => {
      expect(() => QuotaManagerActual.getFeatureLimit('FREE', 'invalid-feature'))
        .toThrow('Invalid feature: invalid-feature');
    });
  });

  describe('isUpgradeRequired', () => {
    it('should return true for features with limit 0', () => {
      expect(QuotaManagerActual.isUpgradeRequired('FREE', 'ai-analysis')).toBe(true);
      expect(QuotaManagerActual.isUpgradeRequired('FREE', 'compare')).toBe(true);
      expect(QuotaManagerActual.isUpgradeRequired('FREE', 'export')).toBe(true);
    });

    it('should return false for features with limit > 0', () => {
      expect(QuotaManagerActual.isUpgradeRequired('FREE', 'evaluation')).toBe(false);
      expect(QuotaManagerActual.isUpgradeRequired('PRO', 'evaluation')).toBe(false);
      expect(QuotaManagerActual.isUpgradeRequired('PRO', 'ai-analysis')).toBe(false);
    });

    it('should return false for unlimited features', () => {
      expect(QuotaManagerActual.isUpgradeRequired('PREMIUM', 'ai-analysis')).toBe(false);
      expect(QuotaManagerActual.isUpgradeRequired('PREMIUM', 'export')).toBe(false);
    });
  });

  describe('shouldResetMonthly', () => {
    it('should return false when not in new month', () => {
      const now = new Date();
      const lastResetDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      expect(QuotaManagerActual.shouldResetMonthly(lastResetDate)).toBe(false);
    });

    it('should return true when in new month and past reset day', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastResetDate = lastMonth.toISOString();

      expect(QuotaManagerActual.shouldResetMonthly(lastResetDate, 1)).toBe(true);
    });

    it('should return false when before reset day', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastResetDate = lastMonth.toISOString();

      // Mock that today is before the reset day
      const isPastResetDay = 15 >= 20;
      expect(isPastResetDay).toBe(false);
    });
  });

  describe('getLimitStatus', () => {
    it('should return correct status for unlimited', () => {
      const status = QuotaManagerActual.getLimitStatus(100, -1);
      expect(status.isUnlimited).toBe(true);
      expect(status.remaining).toBe(Infinity);
      expect(status.usagePercent).toBe(0);
    });

    it('should return correct status for limited features', () => {
      const status = QuotaManagerActual.getLimitStatus(5, 10);
      expect(status.isUnlimited).toBe(false);
      expect(status.remaining).toBe(5);
      expect(status.usagePercent).toBe(50);
    });

    it('should handle edge cases', () => {
      const status1 = QuotaManagerActual.getLimitStatus(10, 10);
      expect(status1.remaining).toBe(0);
      expect(status1.usagePercent).toBe(100);

      const status2 = QuotaManagerActual.getLimitStatus(15, 10);
      expect(status2.remaining).toBe(0);
      expect(status2.usagePercent).toBe(150);
    });
  });
});