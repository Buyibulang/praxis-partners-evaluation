import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  Legend
} from 'recharts'
import { X } from 'lucide-react'
import { useEvaluationStore } from '../stores/evaluationStore'

const CompareTool = ({ evaluationIds, onClose }) => {
  const [evaluations, setEvaluations] = useState([])
  const { evaluationHistory } = useEvaluationStore()

  useEffect(() => {
    const selectedEvaluations = evaluationIds
      .map(id => evaluationHistory.find(e => e.id === id))
      .filter(Boolean)
      .slice(0, 4) // 限制最多4个
    setEvaluations(selectedEvaluations)
  }, [evaluationIds, evaluationHistory])

  // 准备雷达图数据
  const chartData = evaluations.length > 0
    ? evaluations[0].categoryScores.map((category) => {
        const data = { category: category.category.name }
        evaluations.forEach((evaluation, index) => {
          const categoryScore = evaluation.categoryScores.find(
            cs => cs.category.name === category.category.name
          )
          data[`project${index}`] = categoryScore ? Math.round(categoryScore.score) : 0
        })
        return data
      })
    : []

  // 生成随机颜色
  const COLORS = [
    { stroke: '#0ea5e9', fill: '#0ea5e920' },
    { stroke: '#f97316', fill: '#f9731620' },
    { stroke: '#10b981', fill: '#10b98120' },
    { stroke: '#8b5cf6', fill: '#8b5cf620' }
  ]

  if (evaluations.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">项目对比分析</h2>
            <p className="text-slate-600 mt-1">
              对比 {evaluations.length} 个项目的评估结果
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 雷达图对比 */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold mb-4">维度对比雷达图</h3>
            {evaluations.length === 1 ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                请至少选择2个项目进行对比
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ReRadarChart data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    {evaluations.map((_, index) => (
                      <Radar
                        key={index}
                        name={evaluations[index].projectName}
                        dataKey={`project${index}`}
                        stroke={COLORS[index].stroke}
                        fill={COLORS[index].fill}
                        fillOpacity={0.6}
                        strokeWidth={2}
                      />
                    ))}
                    <Tooltip
                      formatter={(value) => [`${value}%`, '评分']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </ReRadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 项目概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map((evaluation, index) => {
              const bestCategory = evaluation.categoryScores.reduce((max, cs) =>
                cs.score > max.score ? cs : max, evaluation.categoryScores[0]
              )
              const worstCategory = evaluation.categoryScores.reduce((min, cs) =>
                cs.score < min.score ? cs : min, evaluation.categoryScores[0]
              )

              return (
                <motion.div
                  key={evaluation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-4"
                  style={{ borderLeft: `4px solid ${COLORS[index].stroke}` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-slate-900 truncate flex-1">
                      {evaluation.projectName}
                    </h4>
                    <div
                      className="text-white px-2 py-1 rounded text-sm font-bold"
                      style={{ backgroundColor: COLORS[index].stroke }}
                    >
                      {evaluation.overallScore}%
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-1 mb-3">
                    {evaluation.categoryScores.map((category, i) => (
                      <div
                        key={i}
                        className="h-2 bg-slate-200"
                        title={`${category.category.name}: ${Math.round(category.score)}%`}
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.round(category.score)}%`,
                            backgroundColor: COLORS[index].stroke
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>强项:</span>
                      <span className="font-medium text-green-700">
                        {bestCategory.category.name} ({Math.round(bestCategory.score)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>待提升:</span>
                      <span className="font-medium text-amber-700">
                        {worstCategory.category.name} ({Math.round(worstCategory.score)}%)
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* 详细对比表 */}
          <div className="card p-4 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-4">详细数据对比</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 text-slate-600">评估维度</th>
                  {evaluations.map((evaluation, index) => (
                    <th key={index} className="text-center py-2" style={{ color: COLORS[index].stroke }}>
                      {evaluation.projectName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evaluations[0].categoryScores.map((category) => (
                  <tr key={category.category.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-slate-900">
                      {category.category.name}
                    </td>
                    {evaluations.map((evaluation, index) => {
                      const score = evaluation.categoryScores.find(
                        cs => cs.category.id === category.category.id
                      ) || { score: 0 }
                      return (
                        <td key={index} className="text-center py-2">
                          <span
                            className="font-bold"
                            style={{ color: COLORS[index].stroke }}
                          >
                            {Math.round(score.score)}%
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr className="font-bold bg-slate-50">
                  <td className="py-3 pr-4">综合评分</td>
                  {evaluations.map((evaluation, index) => (
                    <td key={index} className="text-center py-3">
                      <span style={{ color: COLORS[index].stroke }}>
                        {evaluation.overallScore}%
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* 总结 */}
          <div className="card p-4 bg-gradient-to-r from-blue-50 to-amber-50 border-0">
            <h3 className="text-lg font-semibold mb-3 text-slate-900">对比总结</h3>
            <div className="space-y-2 text-sm text-slate-700">
              {evaluations.map((evaluation, index) => {
                const bestCategory = evaluation.categoryScores.reduce((max, cs) =>
                  cs.score > max.score ? cs : max, evaluation.categoryScores[0]
                )
                const avgScore = evaluation.categoryScores.reduce((sum, cs) =>
                  sum + cs.score, 0) / evaluation.categoryScores.length

                return (
                  <p key={index}>
                    <span className="font-semibold" style={{ color: COLORS[index].stroke }}>
                      {evaluation.projectName}
                    </span>
                    {' '}综合评分{evaluation.overallScore}% (平均{Math.round(avgScore)}%),{' '}
                    最佳表现是{bestCategory.category.name}({Math.round(bestCategory.score)}分)
                  </p>
                )
              })}

              {evaluations.length > 1 && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <p className="font-semibold text-slate-900">
                    推荐关注:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {evaluations.sort((a, b) => b.overallScore - a.overallScore)[0] && (
                      <li>
                        <span className="font-medium">
                          {evaluations.sort((a, b) => b.overallScore - a.overallScore)[0].projectName}
                        </span>
                        {' '}综合表现最佳，可作为优先投资/发展对象
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default CompareTool
