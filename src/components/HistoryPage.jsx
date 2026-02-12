import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { useEvaluationStore } from '../stores/evaluationStore'
import { Calendar, TrendingUp, Trash2, Eye, BarChart3, Plus, Download } from 'lucide-react'
import PDFReport from './PDFReport'
import { generateRecommendations } from '../utils/scoreCalculator'

const HistoryPage = ({ onSelect, onCompare, onNewEvaluation }) => {
  const { evaluationHistory, deleteEvaluation } = useEvaluationStore()
  const [selectedEvaluations, setSelectedEvaluations] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const [generatingPDF, setGeneratingPDF] = useState({})

  const exportPDF = async (evaluationId) => {
    const evaluation = evaluationHistory.find(e => e.id === evaluationId)
    if (!evaluation) {
      alert('未找到评估数据')
      return
    }

    setGeneratingPDF(prev => ({ ...prev, [evaluationId]: true }))

    try {
      // 直接使用PDFReport组件生成PDF
      if (pdfReportRef.current) {
        // 临时设置评估数据
        pdfReportRef.current.generatePDFWithData(evaluation)
      } else {
        console.error('PDF组件未找到')
        alert('PDF组件未初始化')
      }
    } catch (error) {
      console.error('PDF导出失败:', error)
      alert(`PDF导出失败: ${error.message}`)
    } finally {
      setGeneratingPDF(prev => ({ ...prev, [evaluationId]: false }))
    }
  }

  const pdfReportRef = useRef(null)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleSelection = (id) => {
    setSelectedEvaluations(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('确定要删除这个评估吗？')
    if (confirmDelete) {
      setDeletingId(id)
      setTimeout(() => {
        deleteEvaluation(id)
        setDeletingId(null)
      }, 300)
    }
  }

  const getOverallScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-200'
    if (score >= 60) return 'bg-blue-100 text-blue-700 border-blue-200'
    if (score >= 40) return 'bg-amber-100 text-amber-700 border-amber-200'
    return 'bg-red-100 text-red-700 border-red-200'
  }

  // 按日期分组评估
  const groupedEvaluations = evaluationHistory.reduce((acc, evaluation) => {
    const date = formatDate(evaluation.date)
    if (!acc[date]) acc[date] = []
    acc[date].push(evaluation)
    return acc
  }, {})

  // 按日期排序
  const sortedDates = Object.keys(groupedEvaluations).sort((a, b) => new Date(b) - new Date(a))

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">评估历史记录</h1>
            <p className="text-slate-600">查看和管理你的所有创业项目评估</p>
          </div>
          <button
            onClick={onNewEvaluation}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            新评估
          </button>
        </div>

        {selectedEvaluations.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="!rounded p-4 mb-6 border border-amber-200 bg-amber-50"
          >
            <div className="flex items-center justify-between">
              <p className="text-amber-700 font-medium">
                已选择 {selectedEvaluations.length} 个评估项目
              </p>
              <button
                onClick={() => {
                  onCompare(selectedEvaluations)
                  setSelectedEvaluations([])
                }}
                className="btn btn-primary"
              >
                <BarChart3 size={16} className="mr-2" />
                对比项目
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {evaluationHistory.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2">还没有评估记录</h3>
          <p className="text-slate-600 mb-6">开始创建你的第一个创业项目评估吧！</p>
          <button
            onClick={onNewEvaluation}
            className="btn btn-primary px-6 py-3"
          >
            <Plus size={20} className="mr-2" />
            开始新评估
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card p-0 overflow-hidden"
            >
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-500" />
                  <h3 className="font-semibold text-slate-700">{date}</h3>
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                    {groupedEvaluations[date].length} 个评估
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                {groupedEvaluations[date].map((evaluation) => {
                  const categoryScores = evaluation.categoryScores.map(cs => cs.score)
                  const bestCategory = evaluation.categoryScores.reduce((max, cs) =>
                    cs.score > max.score ? cs : max, evaluation.categoryScores[0]
                  )
                  const worstCategory = evaluation.categoryScores.reduce((min, cs) =>
                    cs.score < min.score ? cs : min, evaluation.categoryScores[0]
                  )

                  return (
                    <motion.div
                      key={evaluation.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: deletingId === evaluation.id ? 0 : 1,
                        scale: deletingId === evaluation.id ? 0.8 : 1
                      }}
                      transition={{ duration: 0.3 }}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-list transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1 hover:text-primary-600 transition-colors cursor-pointer"
                              onClick={() => onSelect(evaluation)}>
                            {evaluation.projectName}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {new Date(evaluation.date).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={selectedEvaluations.includes(evaluation.id)}
                            onChange={() => toggleSelection(evaluation.id)}
                            className="mr-2 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                          />
                          <button
                            onClick={() => handleDelete(evaluation.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="删除记录"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-xl font-bold px-2 py-1 rounded border ${getOverallScoreColor(evaluation.overallScore)}`}>
                          {evaluation.overallScore}%
                        </div>
                        <div className="flex gap-1">
                          <span className="text-xs text-slate-400">评分</span>
                          <TrendingUp size={12} className="text-green-500" />
                        </div>
                      </div>

                      <motion.div
                        className="grid grid-cols-5 gap-1 h-2 mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {categoryScores.map((score, index) => {
                          const color = score >= 80 ? 'bg-green-500' :
                                       score >= 60 ? 'bg-blue-500' :
                                       score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          return (
                            <div key={index} className={`${color}`} />
                          )
                        })}
                      </motion.div>

                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <span>强项:</span>
                          <span className="font-medium text-green-700">{bestCategory.category.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>待提升:</span>
                          <span className="font-medium text-amber-700">{worstCategory.category.name}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => onSelect(evaluation)}
                          className="flex-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          <Eye size={12} />
                          查看
                        </button>
                        <button
                          onClick={() => exportPDF(evaluation.id)}
                          disabled={generatingPDF[evaluation.id]}
                          className="flex-1 text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          {generatingPDF[evaluation.id] ? (
                            <>
                              <div className="w-3 h-3 border-2 border-primary-700 border-t-transparent rounded-full animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <Download size={12} />
                              PDF
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500">
          共保存了 {evaluationHistory.length} 个评估项目
        </p>
      </div>

      {/* 隐藏的PDF报告组件，用于导出 */}
      <div style={{ display: 'none' }}>
        <PDFReport
          ref={pdfReportRef}
          evaluation={null}
          recommendations={[]}
        />
      </div>
    </div>
  )
}

export default HistoryPage
