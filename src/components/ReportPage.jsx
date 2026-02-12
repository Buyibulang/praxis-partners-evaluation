import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useEvaluationStore } from '../stores/evaluationStore'
import ScoreCard from './ScoreCard'
import RadarChart from './RadarChart'
import PDFReport from './PDFReport'
import ShareTool from './ShareTool'
import AIAnalysis from './AIAnalysis'
import { getScoreInterpretation, generateRecommendations } from '../utils/scoreCalculator'
import { compareWithBenchmark, compareCategoriesWithBenchmark, getIndustryBenchmark } from '../utils/industryBenchmarks'
import { CheckCircle, AlertCircle, TrendingUp, Users, Target, DollarSign, TrendingDown, Brain } from 'lucide-react'

const ReportPage = ({ evaluation }) => {
  const { evaluationHistory, loadEvaluationFromHistory } = useEvaluationStore()
  const [selectedEvaluation, setSelectedEvaluation] = useState(evaluation)

  const interpretation = getScoreInterpretation(selectedEvaluation.overallScore)
  const recommendations = generateRecommendations(selectedEvaluation)
  const benchmark = getIndustryBenchmark(selectedEvaluation.industry)
  const industryComparison = compareWithBenchmark(selectedEvaluation.overallScore, selectedEvaluation.industry)

  const loadEvaluation = (id) => {
    const evalData = evaluationHistory.find(e => e.id === id)
    if (evalData) {
      setSelectedEvaluation(evalData)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {selectedEvaluation.projectName}
            </h2>
            <p className="text-gray-600">
              {new Date(selectedEvaluation.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="flex gap-2">
            <PDFReport evaluation={selectedEvaluation} recommendations={recommendations} />
            <ShareTool evaluation={selectedEvaluation} />
          </div>
        </div>

        <div className={`p-6 rounded-lg ${interpretation.bgColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <TrendingUp className={`mr-2 ${interpretation.color}`} size={24} />
                <h3 className={`text-2xl font-bold ${interpretation.color}`}>
                  综合评分: {selectedEvaluation.overallScore}%
                </h3>
              </div>
              <p className={`${interpretation.color} text-lg`}>
                {interpretation.level}
              </p>
            </div>
            <div className="text-6xl">
              {selectedEvaluation.overallScore >= 80 ? '🏆' :
               selectedEvaluation.overallScore >= 60 ? '✨' :
               selectedEvaluation.overallScore >= 40 ? '💡' : '🛠️'}
            </div>
          </div>
          <p className={`mt-3 ${interpretation.color} opacity-80`}>
            {interpretation.description}
          </p>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedEvaluation.categoryScores.map((data, index) => (
            <ScoreCard
              key={data.category.id}
              title={data.category.name}
              score={data.score}
              weight={data.category.weight}
            />
          ))}
        </div>

        <RadarChart
          data={selectedEvaluation.categoryScores}
        />
      </div>

      <motion.div
        className="card p-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h3 className="text-xl font-semibold mb-4">改进建议</h3>
        {recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <AlertCircle
                  className={
                    rec.priority === 'high' ? 'text-red-500' :
                    rec.priority === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }
                  size={20}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{rec.category}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.suggestion}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    优先级: {rec.priority === 'high' ? '高' : rec.priority === 'medium' ? '中' : '低'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="font-medium text-green-800">整体表现优秀</p>
              <p className="text-sm text-green-600">项目的各个维度都表现良好，继续保持并寻找机会进一步优化。</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* AI Analysis Section */}
      <motion.div
        className="card p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-purple-600" />
          AI深度分析
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          基于Praxis Partners AI模型的专业分析（Pro/Premium专属功能）
        </p>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            点击下方的"开始分析"按钮，AI将为您的项目提供7个维度的深度分析，包括风险评估、融资建议、市场策略等。
          </p>
          <p className="text-xs text-gray-500 mt-2">
            💡 Pro用户每月可使用5次，Premium用户无限次使用
          </p>
        </div>
        <AIAnalysis evaluation={selectedEvaluation} />
      </motion.div>

      <motion.div
        className="card p-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h3 className="text-xl font-semibold mb-4">评分详情</h3>
        <div className="space-y-4">
          {selectedEvaluation.categoryScores.map(({ category, score, rawScore, maxPossible, answeredQuestions, totalQuestions }) => (
            <div key={category.id} className="border-b border-gray-200 pb-3 last:border-b-0">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{category.name}</span>
                <span className="text-lg font-bold">
                  {Math.round(score)}%
                </span>
              </div>
              <div className="text-sm text-gray-600">
                得分: {rawScore}/{maxPossible} ({answeredQuestions}/{totalQuestions} 题已答)
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={[
                    'h-2 rounded-full transition-all duration-500',
                    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  ].join(' ')}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {evaluationHistory.length > 1 && (
          <motion.div
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h3 className="text-xl font-semibold mb-4">历史评估记录</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {evaluationHistory.slice(0, 5).map((evalItem) => (
                <button
                  key={evalItem.id}
                  onClick={() => loadEvaluation(evalItem.id)}
                  className={[
                    'w-full flex justify-between items-center p-3 rounded-lg text-left transition-colors',
                    evalItem.id === selectedEvaluation.id ?
                      'bg-primary-100 text-primary-900' :
                      'hover:bg-gray-50'
                  ].join(' ')}
                >
                  <div>
                    <p className="font-medium">{evalItem.projectName}</p>
                    <p className="text-sm opacity-75">
                      {new Date(evalItem.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-lg font-bold">
                    {evalItem.overallScore}%
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ReportPage