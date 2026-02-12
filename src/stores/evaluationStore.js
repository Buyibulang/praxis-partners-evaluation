import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useEvaluationStore = create(
  persist(
    (set, get) => ({
      evaluations: [],
      currentEvaluation: null,
      evaluationHistory: [],

      // 用户层级和用户数据
      userTier: 'free', // 'free', 'pro', 'premium'
      monthlyEvaluations: 0, // 本月评估次数
      monthlyAICredits: 0, // 本月AI分析次数
      lastResetDate: null, // 上次重置日期

      // 支付相关
      subscriptionId: null,
      subscriptionStatus: null, // 'active', 'canceled', 'expired'

      // 设置当前用户层级
      setUserTier: (tier) => set({ userTier: tier }),

      // 检查并更新月度限制
      checkAndUpdateMonthlyLimits: () => {
        const now = new Date()
        const state = get()

        // 如果是新月份，重置计数
        if (!state.lastResetDate || now.getMonth() !== new Date(state.lastResetDate).getMonth()) {
          set({
            monthlyEvaluations: 0,
            monthlyAICredits: state.userTier === 'premium' ? 999 : state.userTier === 'pro' ? 5 : 0,
            lastResetDate: now.toISOString()
          })
          return true
        }
        return false
      },

      // 检查是否可以评估
      canEvaluate: () => {
        const state = get()
        state.checkAndUpdateMonthlyLimits()

        // Pro和Premium用户可以无限评估
        if (state.userTier === 'pro' || state.userTier === 'premium') {
          return { can: true, limit: Infinity, used: state.monthlyEvaluations }
        }

        // 免费用户：每月2次
        const limit = 2
        const used = state.monthlyEvaluations
        const can = used < limit

        return { can, limit, used }
      },

      // 记录一次评估
      recordEvaluation: () => {
        const state = get()
        state.checkAndUpdateMonthlyLimits()

        // 只有免费用户需要计数
        if (state.userTier === 'free') {
          set({ monthlyEvaluations: state.monthlyEvaluations + 1 })
        }
      },

      // 检查AI分析额度
      canUseAI: () => {
        const state = get()

        if (state.userTier === 'premium') {
          return { can: true, limit: Infinity, used: 0 }
        }

        if (state.userTier === 'pro') {
          const used = state.monthlyAICredits
          const limit = 5
          return { can: used < limit, limit, used }
        }

        // 免费用户不能使用AI
        return { can: false, limit: 0, used: 0 }
      },

      // 使用一次AI分析
      useAICredit: () => {
        const state = get()

        if (state.userTier === 'pro') {
          state.checkAndUpdateMonthlyLimits()
          set({ monthlyAICredits: state.monthlyAICredits + 1 })
        }
      },

      setCurrentEvaluation: (evaluation) =>
        set({ currentEvaluation: evaluation }),

      saveEvaluation: (evaluation) =>
        set((state) => {
          // 记录评估
          state.recordEvaluation()

          return {
            currentEvaluation: evaluation,
            evaluationHistory: [evaluation, ...state.evaluationHistory],
          }
        }),

      clearCurrentEvaluation: () => set({ currentEvaluation: null }),

      deleteEvaluation: (evaluationId) =>
        set((state) => ({
          evaluationHistory: state.evaluationHistory.filter(
            (e) => e.id !== evaluationId
          ),
        })),

      updateEvaluation: (evaluationId, updates) =>
        set((state) => ({
          evaluationHistory: state.evaluationHistory.map((e) =>
            e.id === evaluationId ? { ...e, ...updates } : e
          ),
        })),

      loadEvaluationFromHistory: (evaluationId) => {
        const state = get()
        const evaluation = state.evaluationHistory.find(
          (e) => e.id === evaluationId
        )
        if (evaluation) {
          set({ currentEvaluation: evaluation })
        }
      },
    }),
    {
      name: 'venture-evaluation-storage-v2',
      partialize: (state) => ({
        evaluationHistory: state.evaluationHistory,
        userTier: state.userTier,
        monthlyEvaluations: state.monthlyEvaluations,
        monthlyAICredits: state.monthlyAICredits,
        lastResetDate: state.lastResetDate,
        subscriptionId: state.subscriptionId,
        subscriptionStatus: state.subscriptionStatus,
      }),
    }
  )
)

export { useEvaluationStore }
