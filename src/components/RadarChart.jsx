import { motion } from 'framer-motion'
import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const RadarChart = ({ data }) => {
  const chartData = data.map(({ category, score }) => ({
    category: category.name,
    score: parseFloat(score.toFixed(1))
  }))

  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'
    if (score >= 60) return '#3B82F6'
    if (score >= 40) return '#F59E0B'
    return '#EF4444'
  }

  const averageScore = chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length
  const fillColor = getScoreColor(averageScore) + '20'
  const strokeColor = getScoreColor(averageScore)

  return (
    <motion.div
      className="card p-6 hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg font-semibold mb-4">维度评估雷达图</h3>

      <div className="h-64 md:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ReRadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: '#4B5563', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tickCount={6}
              tick={{ fill: '#6B7280', fontSize: 10 }}
            />
            <Radar
              name="评估分数"
              dataKey="score"
              stroke={strokeColor}
              fill={fillColor}
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [`${value}%`, '评分']}
            />
          </ReRadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-center text-sm text-gray-600">
        <span className="mr-4">低分 (0-40): 需要改进</span>
        <span className="mr-4">中分 (40-60): 一般</span>
        <span className="mr-4">良好 (60-80): 良好</span>
        <span>优秀 (80-100): 优秀</span>
      </div>
    </motion.div>
  )
}

export default RadarChart
