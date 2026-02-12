import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, AlertCircle, Check, Lock, TrendingUp, Target, Lightbulb, DollarSign, Flag, Rocket, Star } from 'lucide-react'
import { useEvaluationStore } from '../stores/evaluationStore'
import { supabase } from '../supabaseClient'

// AI analysis modules configuration
const ANALYSIS_MODULES = [
  {
    id: 'positioning',
    title: '项目定位分析',
    description: '评估项目在市场中的位置和竞争优势',
    icon: Target
  },
  {
    id: 'risk',
    title: '风险评估',
    description: '识别项目潜在风险和挑战',
    icon: AlertCircle
  },
  {
    id: 'highlights',
    title: '投资亮点',
    description: '总结项目的核心价值和投资吸引力',
    icon: Star
  },
  {
    id: 'improvement',
    title: '改进建议',
    description: '提供具体的优化方向和行动计划',
    icon: Lightbulb
  },
  {
    id: 'funding',
    title: '融资建议',
    description: '给出融资策略和建议估值',
    icon: DollarSign
  },
  {
    id: 'milestones',
    title: '里程碑规划',
    description: '制定关键发展节点和时间表',
    icon: Flag
  },
  {
    id: 'market',
    title: '市场策略',
    description: '提供市场进入和推广策略',
    icon: Rocket
  }
]

const AIAnalysis = ({ evaluation }) => {
  const [analyses, setAnalyses] = useState({})
  const [loading, setLoading] = useState({})
  const [errors, setErrors] = useState({})
  const { userTier, monthlyAICredits, useAICredit } = useEvaluationStore()

  // Check if user can use AI analysis
  const canUseAI = () => {
    if (userTier === 'premium') {
      return { can: true, reason: 'Premium用户可以无限次使用AI分析' }
    }

    if (userTier === 'pro') {
      if (monthlyAICredits >= 5) {
        return {
          can: false,
          reason: '本月AI分析额度已用完（5次/月）',
          used: monthlyAICredits,
          limit: 5
        }
      }
      return {
        can: true,
        used: monthlyAICredits,
        limit: 5
      }
    }

    return {
      can: false,
      reason: 'AI分析功能需要Pro或Premium订阅',
      upgradeRequired: true
    }
  }

  // Load cached analyses
  useEffect(() => {
    const cached = localStorage.getItem(`ai_analyses_${evaluation.id}`)
    if (cached) {
      setAnalyses(JSON.parse(cached))
    }
  }, [evaluation.id])

  // Cache analyses when they change
  useEffect(() => {
    if (Object.keys(analyses).length > 0) {
      localStorage.setItem(`ai_analyses_${evaluation.id}`, JSON.stringify(analyses))
    }
  }, [analyses, evaluation.id])

  const callAIAPI = async (moduleId, evaluationData) => {
    // Prepare evaluation data for AI analysis
    const prompt = generatePrompt(moduleId, evaluationData)

    try {
      // Call Kimi (Moonshot AI) API - Changed from Claude to Kimi
      const response = await supabase.functions.invoke('kimi-analysis', {
        body: { prompt }
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      return response.data
    } catch (error) {
      console.error('AI analysis error:', error)
      throw error
    }
  }

  const generatePrompt = (moduleId, data) => {
    const basePrompt = `You are a professional venture capital analyst with 15+ years of experience.
    Please analyze the following startup project based on the provided data.

    Project Overview:
    - Project Name: ${data.name}
    - Industry: ${data.industry}
    - Stage: ${data.stage}

    Evaluation Scores (out of 100):
    - Market Attractiveness: ${data.scores.market}
    - Product Strength: ${data.scores.product}
    - Team Capability: ${data.scores.team}
    - Financial Health: ${data.scores.finance}
    - Execution Ability: ${data.scores.execution}
    - Overall Score: ${data.scores.total}

    Evaluation Details:
    ${data.sections.map(section => `- ${section.title}: ${section.content.substring(0, 200)}...`).join('\n')}

    Please provide a comprehensive analysis focusing on: ${ANALYSIS_MODULES.find(m => m.id === moduleId).title}.`

    switch (moduleId) {
      case 'positioning':
        return basePrompt + `

        Focus on:
        1. Market positioning and competitive advantage
        2. Unique value proposition
        3. Target customer segmentation
        4. Differentiation strategy

        Provide specific, actionable insights.`

      case 'risk':
        return basePrompt + `

        Focus on:
        1. Key risks in market, product, team, and financial aspects
        2. Risk severity assessment (High/Medium/Low)
        3. Risk mitigation recommendations
        4. External factors that could impact success

        Be thorough and realistic.`

      case 'highlights':
        return basePrompt + `

        Focus on:
        1. Strong investment merits and competitive advantages
        2. Market opportunities and growth potential
        3. Team strengths and execution capability
        4. Why investors should consider this project

        Highlight genuine strengths that appeal to investors.`

      case 'improvement':
        return basePrompt + `

        Focus on:
        1. Specific areas that need improvement
        2. Actionable recommendations for each aspect
        3. Priority areas (what to fix first)
        4. Resource allocation suggestions

        Provide a clear roadmap for improvement.`

      case 'funding':
        return basePrompt + `

        Focus on:
        1. Suitable funding amount and stage
        2. Recommended valuation range
        3. Investor types to target
        4. Timing and funding strategy
        5. Use of funds recommendations

        Be specific about funding recommendations.`

      case 'milestones':
        return basePrompt + `

        Focus on:
        1. Key milestones for the next 6-12 months
        2. Success metrics for each milestone
        3. Dependencies and critical path
        4. Timeline and resource requirements

        Create a realistic, achievable timeline.`

      case 'market':
        return basePrompt + `

        Focus on:
        1. Ideal go-to-market strategy
        2. Customer acquisition channels
        3. Marketing and growth tactics
        4. Partnership and collaboration opportunities

        Provide practical market strategy recommendations.`

      default:
        return basePrompt
    }
  }

  const handleAnalyze = async (moduleId) => {
    const aiCheck = canUseAI()
    if (!aiCheck.can) {
      setErrors({ [moduleId]: aiCheck.reason })
      return
    }

    // Premium users don't need to check credits
    if (userTier === 'pro') {
      useAICredit()
    }

    setLoading({ [moduleId]: true })
    setErrors({})

    try {
      const analysis = await callAIAPI(moduleId, evaluation)
      setAnalyses(prev => ({
        ...prev,
        [moduleId]: analysis
      }))
    } catch (error) {
      setErrors({ [moduleId]: 'AI分析失败，请重试' })
    } finally {
      setLoading({ [moduleId]: false })
    }
  }

  const aiCheck = canUseAI()

  if (aiCheck.upgradeRequired) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
        <div className="text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI分析功能</h3>
          <p className="text-gray-600 mb-4">{aiCheck.reason}</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            升级到Pro
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage info */}
      {userTier === 'pro' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-900">
                本月已使用 {monthlyAICredits}/5 次AI分析
              </span>
            </div>
            <div className="w-24 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(monthlyAICredits / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Analysis modules */}
      <div className="grid gap-4">
        {ANALYSIS_MODULES.map((module) => {
          const Icon = module.icon
          const hasAnalysis = analyses[module.id]
          const isLoading = loading[module.id]
          const error = errors[module.id]

          return (
            <div
              key={module.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAnalyze(module.id)}
                  disabled={isLoading}
                  className="ml-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasAnalysis ? '重新分析' : '开始分析'}
                </button>
              </div>

              {/* Analysis content */}
              <AnimatePresence>
                {hasAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-100"
                  >
                    <div className="prose max-w-none text-sm text-gray-700">
                      {analyses[module.id]}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading state */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 flex items-center justify-center py-4"
                  >
                    <div className="animate-pulse flex items-center">
                      <Brain className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">
                        AI正在分析中
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error state */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AIAnalysis
