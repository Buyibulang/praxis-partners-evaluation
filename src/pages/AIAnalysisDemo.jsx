import { useState } from 'react'
import { useEvaluationStore } from '../stores/evaluationStore'
import AIAnalysis from '../components/AIAnalysis'

// Mock evaluation data for testing
const mockEvaluation = {
  id: 'demo-evaluation',
  name: '智能餐饮管理系统',
  industry: '企业服务/SaaS',
  stage: '种子轮',
  scores: {
    market: 85,
    product: 78,
    team: 92,
    finance: 65,
    execution: 80,
    total: 80
  },
  sections: [
    {
      title: '市场定位与客户需求',
      content: '我们的产品是为中小型餐饮企业提供的智能化管理系统，解决传统餐厅在订单管理、库存控制、数据分析等方面的痛点。目标客户是年营收100-1000万的连锁餐厅。',
      score: 85
    },
    {
      title: '产品/服务与技术优势',
      content: '系统集成了AI预测算法，能够预测每日客流量和食材需求，减少30%的食材浪费。移动端支持让餐厅老板可以随时随地查看营业数据。',
      score: 78
    },
    {
      title: '商业模式与盈利能力',
      content: '采用SaaS订阅模式，基础版299元/月，专业版999元/月。目前已签约15家餐厅，月经常性收入达到1.2万元，毛利率85%。',
      score: 65
    },
    {
      title: '团队能力与执行力',
      content: '创始人有10年餐饮行业经验，技术团队来自知名互联网公司。团队结构完整，包括产品、技术、销售等关键岗位。',
      score: 92
    },
    {
      title: '竞争优势与市场地位',
      content: '相比传统餐饮软件，我们的AI预测是独特优势。相比竞品，我们更注重中小型餐厅的需求，价格更具竞争力。',
      score: 80
    }
  ],
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString()
}

const AIAnalysisDemo = () => {
  const { userTier, setUserTier } = useEvaluationStore()
  const [showProFeatures, setShowProFeatures] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            AI分析功能演示
          </h1>
          <p className="text-gray-600">
            体验Praxis Partners AI深度分析功能（Pro/Premium专属）
          </p>
        </div>

        {/* Demo controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">演示控制</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">当前用户层级</span>
              <select
                value={userTier}
                onChange={(e) => setUserTier(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="free">Free（免费版 - AI功能受限）</option>
                <option value="pro">Pro（专业版 - 5次/月）</option>
                <option value="premium">Premium（高级版 - 无限次）</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">模拟用户</span>
              <span className="text-sm text-gray-600">
                {userTier === 'free' && '未付费用户 - 所有AI功能显示升级提示'}
                {userTier === 'pro' && 'Pro用户 - 可使用AI分析（5次/月）'}
                {userTier === 'premium' && 'Premium用户 - 无限次AI分析'}
              </span>
            </div>
          </div>
        </div>

        {/* Project info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">项目信息（Demo）</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">项目名称：</span>
              <span className="font-medium">{mockEvaluation.name}</span>
            </div>
            <div>
              <span className="text-gray-600">行业领域：</span>
              <span className="font-medium">{mockEvaluation.industry}</span>
            </div>
            <div>
              <span className="text-gray-600">融资阶段：</span>
              <span className="font-medium">{mockEvaluation.stage}</span>
            </div>
            <div>
              <span className="text-gray-600">综合评分：</span>
              <span className="font-medium text-xl">{mockEvaluation.scores.total}/100</span>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">评分详情</h3>
            <div className="space-y-2">
              {Object.entries(mockEvaluation.scores).map(([key, score]) => (
                key !== 'total' && (
                  <div key={key} className="flex items-center">
                    <span className="text-sm text-gray-600 capitalize w-24">
                      {key === 'market' ? '市场吸引力' :
                       key === 'product' ? '产品实力' :
                       key === 'team' ? '团队能力' :
                       key === 'finance' ? '财务健康' : '执行能力'}
                    </span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{score}/100</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">AI深度分析</h2>
          <AIAnalysis evaluation={mockEvaluation} />
        </div>
      </div>
    </div>
  )
}

export default AIAnalysisDemo