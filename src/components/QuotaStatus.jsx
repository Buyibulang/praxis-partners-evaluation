import { useState } from 'react'
import { motion } from 'framer-motion'
import { useEvaluationStore } from '../stores/evaluationStore'
import UpgradeModal from './UpgradeModal'

const QuotaStatus = ({ onManageSubscription }) => {

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const { userTier, monthlyEvaluations, monthlyAICredits, canEvaluate, canUseAI } = useEvaluationStore()

  // Get quota info by calling the functions directly
  const evalQuota = useEvaluationStore.getState().canEvaluate()
  const aiQuota = useEvaluationStore.getState().canUseAI()

  // MOCK_MODE flag - in development/production this would be set via environment
  const MOCK_MODE = import.meta.env.DEV && window.location.search.includes('mock=true')

  const tierStyles = {
    free: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200'
    },
    pro: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200'
    },
    premium: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200'
    }
  }

  const tierNames = {
    free: '免费版',
    pro: '专业版 Pro',
    premium: '高级版 Premium'
  }

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true)
  }

  const handleCloseModal = () => {
    setShowUpgradeModal(false)
  }

  const styles = tierStyles[userTier] || tierStyles.free

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 p-3 rounded-lg border ${styles.bg} ${styles.border} max-w-xs w-full`}
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${styles.text}`}>
            {tierNames[userTier]}
          </span>
          {MOCK_MODE && (
            <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
              模拟模式
            </span>
          )}
        </div>

        {/* 评估次数状态 */}
        {userTier === 'free' && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>本月评估</span>
              <span>
                {monthlyEvaluations}/{evalQuota.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(monthlyEvaluations / evalQuota.limit) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* AI分析额度状态 */}
        {(userTier === 'free' || userTier === 'pro') && (
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{userTier === 'pro' ? 'AI分析' : 'AI额度'}</span>
              <span>
                {userTier === 'pro' ? `${monthlyAICredits}/${aiQuota.limit}` : aiQuota.limit === 0 ? '--' : `${monthlyAICredits}/${aiQuota.limit}`}
              </span>
            </div>

            {userTier === 'free' && aiQuota.limit === 0 ? (
              <div className="text-xs text-gray-500">升级到Pro以使用AI分析</div>
            ) : userTier === 'pro' && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(monthlyAICredits / aiQuota.limit) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* 升级提示 */}
        {userTier === 'free' && !MOCK_MODE && (
          <>
            <button
              onClick={handleUpgradeClick}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors w-full text-left mt-1"
            >
              升级到Pro →
            </button>
            {onManageSubscription && (
              <button
                onClick={onManageSubscription}
                className="text-xs font-medium text-gray-600 hover:text-gray-700 transition-colors w-full text-left mt-1"
              >
                管理订阅 →
              </button>
            )}
          </>
        )}

        {userTier === 'pro' && !MOCK_MODE && (
          <>
            <button
              onClick={handleUpgradeClick}
              className="text-xs font-medium text-purple-600 hover:text-purple-700 transition-colors w-full text-left mt-1"
            >
              升级到Premium →
            </button>
            {onManageSubscription && (
              <button
                onClick={onManageSubscription}
                className="text-xs font-medium text-gray-600 hover:text-gray-700 transition-colors w-full text-left mt-1"
              >
                管理订阅 →
              </button>
            )}
          </>
        )}

        {userTier === 'premium' && onManageSubscription && !MOCK_MODE && (
          <button
            onClick={onManageSubscription}
            className="text-xs font-medium text-gray-600 hover:text-gray-700 transition-colors w-full text-left mt-1"
          >
            管理订阅 →
          </button>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={handleCloseModal}
      />
    </motion.div>
  )
}

export default QuotaStatus
