import { supabase } from '../supabaseClient';

const TIERS = {
  FREE: 'FREE',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM'
};

const FEATURES = {
  EVALUATION: 'evaluation',
  AI_ANALYSIS: 'ai-analysis',
  COMPARE: 'compare',
  EXPORT: 'export'
};

const FEATURE_LIMITS = {
  [TIERS.FREE]: {
    [FEATURES.EVALUATION]: 2,
    [FEATURES.AI_ANALYSIS]: 0,
    [FEATURES.COMPARE]: 0,
    [FEATURES.EXPORT]: 0
  },
  [TIERS.PRO]: {
    [FEATURES.EVALUATION]: 10,
    [FEATURES.AI_ANALYSIS]: 5,
    [FEATURES.COMPARE]: 3,
    [FEATURES.EXPORT]: 1
  },
  [TIERS.PREMIUM]: {
    [FEATURES.EVALUATION]: -1, // -1 indicates unlimited
    [FEATURES.AI_ANALYSIS]: -1,
    [FEATURES.COMPARE]: -1,
    [FEATURES.EXPORT]: -1
  }
};

const FEATURE_DESCRIPTIONS = {
  [FEATURES.EVALUATION]: 'Venture evaluations',
  [FEATURES.AI_ANALYSIS]: 'AI analysis credits',
  [FEATURES.COMPARE]: 'Project comparisons',
  [FEATURES.EXPORT]: 'Export functionality'
};

class QuotaError extends Error {
  constructor(message, feature, limit, used) {
    super(message);
    this.name = 'QuotaError';
    this.feature = feature;
    this.limit = limit;
    this.used = used;
  }
}

export class QuotaManager {
  static isDevelopment = import.meta.env.DEV;

  static getStorageKey(key) {
    return `quota_${key}`;
  }

  static async getUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    } catch (error) {
      console.warn('Failed to get user ID, using mock mode:', error.message);
      return 'mock-user-id';
    }
  }

  static getMockData() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    return {
      tier: TIERS.FREE,
      evaluations_used: 1,
      ai_credits_used: 0,
      last_reset_date: lastMonth,
      reset_day: 1
    };
  }

  static async getQuotaDataFromSupabase() {
    try {
      const userId = await this.getUserId();
      if (!userId || userId === 'mock-user-id') {
        throw new Error('No valid user ID');
      }

      const { data, error } = await supabase
        .from('user_quotas')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create initial quota record
        const initialData = {
          user_id: userId,
          tier: TIERS.FREE,
          evaluations_used: 0,
          ai_credits_used: 0,
          last_reset_date: new Date().toISOString(),
          reset_day: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_quotas')
          .insert([initialData])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return newData;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to fetch quota data from Supabase: ${error.message}`);
    }
  }

  static async getQuotaData() {
    if (this.isDevelopment) {
      const mockData = localStorage.getItem(this.getStorageKey('data'));
      if (mockData) {
        return JSON.parse(mockData);
      }

      const initialData = this.getMockData();
      localStorage.setItem(this.getStorageKey('data'), JSON.stringify(initialData));
      return initialData;
    }

    return await this.getQuotaDataFromSupabase();
  }

  static async updateQuotaData(updates) {
    if (this.isDevelopment) {
      const currentData = await this.getQuotaData();
      const updatedData = {
        ...currentData,
        ...updates,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(this.getStorageKey('data'), JSON.stringify(updatedData));
      return updatedData;
    }

    try {
      const userId = await this.getUserId();
      const { data, error } = await supabase
        .from('user_quotas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to update quota data: ${error.message}`);
    }
  }

  static shouldResetMonthly(lastResetDate, resetDay = 1) {
    const now = new Date();
    const last = new Date(lastResetDate);

    // Check if we're in a new month
    const isNewMonth = now.getFullYear() !== last.getFullYear() ||
                       now.getMonth() !== last.getMonth();

    // Check if we're past the reset day in the current month
    const isPastResetDay = now.getDate() >= resetDay;

    return isNewMonth && isPastResetDay;
  }

  static async checkAndResetIfNeeded() {
    const quotaData = await this.getQuotaData();

    if (this.shouldResetMonthly(quotaData.last_reset_date, quotaData.reset_day)) {
      console.log('Monthly quota reset triggered');

      const updates = {
        evaluations_used: 0,
        ai_credits_used: 0,
        last_reset_date: new Date().toISOString()
      };

      return await this.updateQuotaData(updates);
    }

    return quotaData;
  }

  static getFeatureLimit(tier, feature) {
    const tierLimits = FEATURE_LIMITS[tier];
    if (!tierLimits) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    if (!(feature in tierLimits)) {
      throw new Error(`Invalid feature: ${feature}`);
    }

    return tierLimits[feature];
  }

  static isUpgradeRequired(tier, feature) {
    try {
      const limit = this.getFeatureLimit(tier, feature);
      return limit === 0;
    } catch (error) {
      console.error('Error checking upgrade requirement:', error.message);
      return true;
    }
  }

  static getLimitStatus(used, limit) {
    if (limit === -1) {
      return {
        isUnlimited: true,
        remaining: Infinity,
        usagePercent: 0
      };
    }

    return {
      isUnlimited: false,
      remaining: Math.max(0, limit - used),
      usagePercent: limit > 0 ? (used / limit) * 100 : 0
    };
  }

  static async getQuotaStatus(tier, evaluationsUsed, aiCreditsUsed) {
    try {
      // Allow overriding with provided values for testing
      const quotaData = await this.getQuotaData();
      const currentTier = tier || quotaData.tier;
      const currentEvaluationsUsed = evaluationsUsed !== undefined ? evaluationsUsed : quotaData.evaluations_used;
      const currentAiCreditsUsed = aiCreditsUsed !== undefined ? aiCreditsUsed : quotaData.ai_credits_used;

      const evaluationLimit = this.getFeatureLimit(currentTier, FEATURES.EVALUATION);
      const aiCreditsLimit = this.getFeatureLimit(currentTier, FEATURES.AI_ANALYSIS);
      const compareLimit = this.getFeatureLimit(currentTier, FEATURES.COMPARE);
      const exportLimit = this.getFeatureLimit(currentTier, FEATURES.EXPORT);

      return {
        tier: currentTier,
        evaluation: {
          used: currentEvaluationsUsed,
          limit: evaluationLimit,
          ...this.getLimitStatus(currentEvaluationsUsed, evaluationLimit),
          isUpgradeRequired: this.isUpgradeRequired(currentTier, FEATURES.EVALUATION)
        },
        aiCredits: {
          used: currentAiCreditsUsed,
          limit: aiCreditsLimit,
          ...this.getLimitStatus(currentAiCreditsUsed, aiCreditsLimit),
          isUpgradeRequired: this.isUpgradeRequired(currentTier, FEATURES.AI_ANALYSIS)
        },
        compare: {
          used: 0, // This would need to be tracked separately if implemented
          limit: compareLimit,
          ...this.getLimitStatus(0, compareLimit),
          isUpgradeRequired: this.isUpgradeRequired(currentTier, FEATURES.COMPARE)
        },
        export: {
          used: 0, // This would need to be tracked separately if implemented
          limit: exportLimit,
          ...this.getLimitStatus(0, exportLimit),
          isUpgradeRequired: this.isUpgradeRequired(currentTier, FEATURES.EXPORT)
        },
        lastResetDate: quotaData.last_reset_date,
        resetDay: quotaData.reset_day || 1
      };
    } catch (error) {
      console.error('Error getting quota status:', error.message);
      throw new Error(`Failed to get quota status: ${error.message}`);
    }
  }

  static async validateUsage(feature, additionalUsage = 1) {
    try {
      const quotaData = await this.getQuotaData();
      const { tier } = quotaData;
      const limit = this.getFeatureLimit(tier, feature);

      if (limit === -1) {
        return true; // Unlimited tier
      }

      // For checks after potential update
      let currentUsed = 0;
      switch (feature) {
        case FEATURES.EVALUATION:
          currentUsed = quotaData.evaluations_used;
          break;
        case FEATURES.AI_ANALYSIS:
          currentUsed = quotaData.ai_credits_used;
          break;
        default:
          // Other features would need separate tracking
          currentUsed = 0;
      }

      if (currentUsed + additionalUsage > limit) {
        throw new QuotaError(
          `Quota exceeded for ${FEATURE_DESCRIPTIONS[feature]}. You've used ${currentUsed} of ${limit} available.`,
          feature,
          limit,
          currentUsed
        );
      }

      return true;
    } catch (error) {
      if (error instanceof QuotaError) {
        throw error;
      }

      console.error('Error validating usage:', error.message);
      throw new Error(`Failed to validate usage: ${error.message}`);
    }
  }

  static async recordUsage(feature, increment = 1) {
    try {
      await this.validateUsage(feature, increment);

      const updates = {};
      const quotaData = await this.getQuotaData();

      switch (feature) {
        case FEATURES.EVALUATION:
          updates.evaluations_used = (quotaData.evaluations_used || 0) + increment;
          break;
        case FEATURES.AI_ANALYSIS:
          updates.ai_credits_used = (quotaData.ai_credits_used || 0) + increment;
          break;
        default:
          console.warn(`Usage tracking not implemented for feature: ${feature}`);
          return;
      }

      return await this.updateQuotaData(updates);
    } catch (error) {
      console.error('Error recording usage:', error.message);
      throw error;
    }
  }

  static async resetMonthlyLimits() {
    try {
      const userId = await this.getUserId();

      if (this.isDevelopment) {
        const currentData = await this.getQuotaData();
        const resetData = {
          ...currentData,
          evaluations_used: 0,
          ai_credits_used: 0,
          last_reset_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        localStorage.setItem(this.getStorageKey('data'), JSON.stringify(resetData));
        return resetData;
      }

      const { data, error } = await supabase
        .from('user_quotas')
        .update({
          evaluations_used: 0,
          ai_credits_used: 0,
          last_reset_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Monthly limits reset successfully');
      return data;
    } catch (error) {
      console.error('Error resetting monthly limits:', error.message);
      throw new Error(`Failed to reset monthly limits: ${error.message}`);
    }
  }

  static async setMockData(mockData) {
    if (this.isDevelopment) {
      const currentData = await this.getQuotaData();
      const mergedData = {
        ...currentData,
        ...mockData,
        updated_at: new Date().toISOString()
      };

      localStorage.setItem(this.getStorageKey('data'), JSON.stringify(mergedData));
      return mergedData;
    }

    console.warn('setMockData only works in development mode');
  }

  static async clearMockData() {
    if (this.isDevelopment) {
      localStorage.removeItem(this.getStorageKey('data'));
      return true;
    }

    console.warn('clearMockData only works in development mode');
    return false;
  }
}

// Auto-reset check on module load
if (typeof window !== 'undefined') {
  QuotaManager.checkAndResetIfNeeded().catch(console.error);
}
