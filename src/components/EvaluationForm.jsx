import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useEvaluationStore } from '../stores/evaluationStore'
import { calculateScores, EVALUATION_CATEGORIES } from '../utils/scoreCalculator'
import { getIndustryList } from '../utils/industryBenchmarks'
import ScoreCard from './ScoreCard'

const EvaluationForm = ({ onComplete }) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const { register, handleSubmit, formState: { errors } } = useForm()
  const { saveEvaluation } = useEvaluationStore()

  const currentCategory = EVALUATION_CATEGORIES[currentCategoryIndex]

  const onSubmit = (data) => {
    if (currentCategoryIndex < EVALUATION_CATEGORIES.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1)
    } else {
      const scores = calculateScores(data)
      const evaluation = {
        id: Date.now().toString(),
        projectName: data.projectName || '未命名项目',
        date: new Date().toISOString(),
        formData: data,
        ...scores
      }
      saveEvaluation(evaluation)
      onComplete(evaluation)  // 传递 evaluation 给父组件
    }
  }

  const industries = getIndustryList()

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1)
    }
  }

  const isLastCategory = currentCategoryIndex === EVALUATION_CATEGORIES.length - 1

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">{currentCategory.name}</h2>
          <span className="text-sm text-gray-500">
            {currentCategoryIndex + 1} / {EVALUATION_CATEGORIES.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-primary-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentCategoryIndex + 1) / EVALUATION_CATEGORIES.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {currentCategoryIndex === 0 && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目名称
                </label>
                <input
                  {...register('projectName', { required: '请填写项目名称' })}
                  className="input"
                  placeholder="请输入项目名称"
                />
                {errors.projectName && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectName.message}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  行业类别
                </label>
                <select
                  {...register('industry', { required: '请选择行业' })}
                  className="input"
                >
                  <option value="">选择项目所属行业</option>
                  {industries.map(industry => (
                    <option key={industry.key} value={industry.key}>
                      {industry.name}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-600">请选择行业</p>
                )}
              </div>
            </>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentCategory.description}
            </h3>
          </div>

          {currentCategory.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="pb-6 border-b border-gray-200 last:border-b-0"
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {question.question} <span className="text-red-500">*</span>
              </label>

              {question.type === 'single' ? (
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <label
                      key={option.label}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        {...register(question.id, { required: '此问题为必填' })}
                        type="radio"
                        value={option.value}
                        className="mr-3 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  {...register(question.id, { required: '此问题为必填' })}
                  type="number"
                  min="0"
                  max="5"
                  placeholder="0-5"
                  className="input w-full"
                />
              )}

              {errors[question.id] && (
                <p className="mt-1 text-sm text-red-600">此问题为必填</p>
              )}
            </motion.div>
          ))}

          <div className="flex justify-between pt-6">
            {currentCategoryIndex > 0 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="btn btn-secondary"
              >
                上一步
              </button>
            ) : (
              <div />
            )}

            <motion.button
              type="submit"
              className="btn btn-primary px-8"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLastCategory ? '生成评估报告' : '下一步'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EvaluationForm