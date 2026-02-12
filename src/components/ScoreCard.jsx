import { motion } from 'framer-motion'

const ScoreCard = ({ title, score, weight }) => {
  const percentage = Math.round(score)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getScoreColor = (score) => {
    if (score >= 80) return { stroke: '#10B981', bg: '#10B98120' }
    if (score >= 60) return { stroke: '#3B82F6', bg: '#3B82F620' }
    if (score >= 40) return { stroke: '#F59E0B', bg: '#F59E0B20' }
    return { stroke: '#EF4444', bg: '#EF444420' }
  }

  const color = getScoreColor(percentage)

  return (
    <motion.div
      className="card p-6 text-center hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="#E5E7EB"
            strokeWidth="10"
            fill="none"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            stroke={color.stroke}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className={["text-2xl font-bold", score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'].join(' ')}>
            {percentage}%
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        权重: {Math.round(weight * 100)}%
      </div>
    </motion.div>
  )
}

export default ScoreCard