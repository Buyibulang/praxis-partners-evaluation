import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Star, Crown } from 'lucide-react'
import PaymentButton from './PaymentButton'
import { useEvaluationStore } from '../stores/evaluationStore'

const UpgradeModal = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const { setUserTier } = useEvaluationStore()

  const plans = [
    {
      id: 'pro',
      name: '专业版 Pro',
      price: 29900, // 单位为分，¥299
      period: '年',
      description: '适合个人创业者深度使用',
      features: [
        '每月10次完整评估',
        '完整PDF报告下载',
        'AI深度分析（5次/月）',
        '查看50个历史记录',
        '基础项目对比',
        '行业基准数据',
        '邮件客服支持'
      ],
      cta: '立即升级 Pro',
      highlight: false,
      icon: Zap
    },
    {
      id: 'premium',
      name: '高级版 Premium',
      price: 99900, // ¥999
      period: '年',
      description: '适合投资人及重度用户',
      features: [
        '无限次完整评估',
        '完整AI分析（无限次）',
        '无限历史记录',
        '高级项目对比',
        '完整行业基准',
        '数据导出功能',
        '优先客服支持'
      ],
      cta: '升级 Premium',
      highlight: true,
      icon: Crown
    }
  ]

  const handleSuccess = (planId) => {
    // 更新用户层级
    setUserTier(planId)

    // 关闭弹窗
    onClose()

    // 显示成功消息
    alert(`升级成功！您现在可以使用${planId === 'pro' ? '专业版' : '高级版'}功能了`)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-screen overflow-y-auto"
        >
          {/* 头部 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Star className="w-6 h-6 text-yellow-500 mr-2" />
                升级您的账户
              </h2>
              <p className="text-gray-600 mt-1">解锁更多专业功能</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 内容 */}
          <div className="p-6">
            {/* 当前限制提示 */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-center">
                🎁 您目前使用的是免费版，功能受限
              </p>
            </div>

            {/* 套餐对比 */}
            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: plan.id === 'pro' ? 0.1 : 0.2 }}
                    className={`border rounded-xl p-6 transition-all ${
                      plan.highlight
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200'
                    }`}
                  >
                    {/* 推荐标签 */}
                    {plan.highlight && (
                      <div className="inline-block px-3 py-1 bg-blue-500 text-white text-xs rounded-full mb-3">
                        推荐
                      </div>
                    )}

                    {/* 标题 */}
                    <div className="flex items-center mb-3">
                      <Icon className={`w-6 h-6 mr-3 ${
                        plan.highlight ? 'text-blue-500' : 'text-purple-500'
                      }`} />
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>

                    {/* 价格 */}
                    <div className="mb-3">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                          ¥{plan.price / 100}
                        </span>
                        <span className="text-gray-600 ml-2">/{plan.period}</span>
                      </div>
                      <p className="text-gray-500 text-sm">约¥{(plan.price / 100 / 12).toFixed(1)}/月</p>
                    </div>

                    {/* 描述 */}
                    <p className="text-gray-600 mb-4">{plan.description}</p>

                    {/* 功能列表 */}
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* 选择按钮 */}
                    <button
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                        selectedPlan === plan.id
                          ? plan.highlight
                            ? 'bg-blue-600 text-white'
                            : 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedPlan === plan.id ? '已选择' : plan.cta}
                    </button>

                    {/* 支付按钮（选中后显示） */}
                    {selectedPlan === plan.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <PaymentButton
                          amount={plan.price}
                          description={`Praxis Partners ${plan.name}`}
                          onSuccess={() => handleSuccess(plan.id)}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* 为什么选择升级？ */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold mb-3">为什么值得升级？</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  获得专业的项目评估报告，节省咨询费用
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  AI深度分析提供可执行的建议
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  无限次使用，随时评估新想法
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                  7天无理由退款保证
                </li>
              </ul>
            </div>

            {/* 常见问题 */}
            <div className="mt-6">
              <h4 className="font-bold mb-3">常见问题</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <details className="p-2 bg-gray-50 rounded">
                  <summary className="cursor-pointer">
                    付费后是否可以退款？
                  </summary>
                  <p className="mt-1">
                    是的，我们提供7天无理由退款保证。如果您对产品不满意，可以随时申请退款。
                  </p>
                </details>
                <details className="p-2 bg-gray-50 rounded">
                  <summary className="cursor-pointer">
                    专业版和高级版有什么区别？
                  </summary>
                  <p className="mt-1">
                    主要区别在于AI分析次数、历史记录容量和高级功能。如果您是个人创业者，专业版足够使用；如果是投资人或需要频繁评估项目，建议选择高级版。
                  </p>
                </details>
                <details className="p-2 bg-gray-50 rounded">
                  <summary className="cursor-pointer">
                    支持哪些支付方式？
                  </summary>
                  <p className="mt-1">
                    支持微信支付、支付宝和信用卡支付。所有支付都经过加密处理，安全可靠。
                  </p>
                </details>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default UpgradeModal