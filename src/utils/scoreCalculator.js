export const EVALUATION_CATEGORIES = [
  {
    id: 'market',
    name: '市场潜力',
    weight: 0.25,
    description: '评估市场规模、增长趋势和竞争环境',
    questions: [
      {
        id: 'marketSize',
        question: '目标市场规模有多大？',
        type: 'single',
        options: [
          { value: 1, label: '细分市场（<1000万）' },
          { value: 2, label: '中等市场（1000万-1亿）' },
          { value: 3, label: '大型市场（1亿-10亿）' },
          { value: 5, label: '巨大市场（>10亿）' }
        ]
      },
      {
        id: 'marketGrowth',
        question: '市场增长率如何？',
        type: 'single',
        options: [
          { value: 1, label: '负增长' },
          { value: 2, label: '缓慢增长（<5%）' },
          { value: 3, label: '稳定增长（5-15%）' },
          { value: 5, label: '快速增长（>15%）' }
        ]
      },
      {
        id: 'competition',
        question: '竞争环境如何？',
        type: 'single',
        options: [
          { value: 1, label: '红海市场，竞争激烈' },
          { value: 2, label: '部分竞争' },
          { value: 3, label: '轻度竞争' },
          { value: 5, label: '蓝海市场，竞争很少' }
        ]
      },
      {
        id: 'customerNeed',
        question: '客户需求的明确性和紧迫性',
        type: 'single',
        options: [
          { value: 1, label: '需求不明确或不急迫' },
          { value: 2, label: '需求有一定明确性' },
          { value: 3, label: '需求明确且有一定紧迫性' },
          { value: 5, label: '需求明确、紧迫且强烈' }
        ]
      }
    ]
  },
  {
    id: 'product',
    name: '产品/服务',
    weight: 0.25,
    description: '评估产品创新性、可行性和竞争优势',
    questions: [
      {
        id: 'innovation',
        question: '产品/服务的创新程度',
        type: 'single',
        options: [
          { value: 1, label: '现有产品的简单改进' },
          { value: 2, label: '渐进式创新' },
          { value: 3, label: '显著创新' },
          { value: 5, label: '颠覆性创新' }
        ]
      },
      {
        id: 'mvpStatus',
        question: '最小可行产品（MVP）的完成度',
        type: 'single',
        options: [
          { value: 1, label: '只有概念，无原型' },
          { value: 2, label: '有简单原型或演示' },
          { value: 3, label: '基本功能MVP可用' },
          { value: 5, label: '完整MVP且有早期用户' }
        ]
      },
      {
        id: 'scalability',
        question: '产品/服务的可扩展性',
        type: 'single',
        options: [
          { value: 1, label: '难以扩展' },
          { value: 2, label: '扩展有一定难度' },
          { value: 3, label: '扩展性一般' },
          { value: 5, label: '易于大规模扩展' }
        ]
      },
      {
        id: 'technicalRisk',
        question: '技术实现风险',
        type: 'single',
        options: [
          { value: 5, label: '低风险，技术成熟' },
          { value: 3, label: '中等风险' },
          { value: 2, label: '较高风险' },
          { value: 1, label: '高风险，技术未验证' }
        ]
      }
    ]
  },
  {
    id: 'team',
    name: '团队实力',
    weight: 0.2,
    description: '评估团队经验、技能和执行力',
    questions: [
      {
        id: 'teamExperience',
        question: '团队在相关行业的经验',
        type: 'single',
        options: [
          { value: 1, label: '无相关经验' },
          { value: 2, label: '部分成员有少量经验' },
          { value: 3, label: '核心团队有相关经验' },
          { value: 5, label: '团队拥有丰富且成功的经验' }
        ]
      },
      {
        id: 'technicalSkills',
        question: '团队技术能力',
        type: 'single',
        options: [
          { value: 1, label: '缺乏必要的技术能力' },
          { value: 2, label: '技术能力有限' },
          { value: 3, label: '技术能力基本满足需求' },
          { value: 5, label: '技术能力强且全面' }
        ]
      },
      {
        id: 'businessSkills',
        question: '团队商业和运营能力',
        type: 'single',
        options: [
          { value: 1, label: '缺乏商业经验' },
          { value: 2, label: '有基本的商业知识' },
          { value: 3, label: '有丰富的商业经验' },
          { value: 5, label: '有很强的商业和运营能力' }
        ]
      },
      {
        id: 'teamCompleteness',
        question: '团队完整性和互补性',
        type: 'single',
        options: [
          { value: 1, label: '团队很不完整' },
          { value: 2, label: '缺少关键角色' },
          { value: 3, label: '基本完整，部分需要补强' },
          { value: 5, label: '团队完整且高度互补' }
        ]
      }
    ]
  },
  {
    id: 'finance',
    name: '财务健康度',
    weight: 0.2,
    description: '评估财务状况、盈利模式和资金需求',
    questions: [
      {
        id: 'revenueModel',
        question: '收入模式的清晰度',
        type: 'single',
        options: [
          { value: 1, label: '收入模式不清晰' },
          { value: 2, label: '有基本的收入想法' },
          { value: 3, label: '有相对清晰的收入模式' },
          { value: 5, label: '有明确且验证的收入模式' }
        ]
      },
      {
        id: 'unitEconomics',
        question: '单位经济效益（Unit Economics）',
        type: 'single',
        options: [
          { value: 1, label: 'LTV < CAC' },
          { value: 2, label: '刚刚盈利或需要优化' },
          { value: 3, label: 'LTV 明显 > CAC' },
          { value: 5, label: 'LTV 远大于 CAC，利润丰厚' }
        ]
      },
      {
        id: 'fundingNeeded',
        question: '资金需求和用途清晰度',
        type: 'single',
        options: [
          { value: 5, label: '资金需求合理，用途清晰' },
          { value: 3, label: '资金需求基本合理' },
          { value: 2, label: '资金需求可能过高' },
          { value: 1, label: '资金需求巨大或用途不清' }
        ]
      },
      {
        id: 'cashFlow',
        question: '现金流状况（如有）',
        type: 'single',
        options: [
          { value: 1, label: '现金流紧张或负数' },
          { value: 2, label: '现金流基本平衡' },
          { value: 3, label: '现金流为正且稳定' },
          { value: 5, label: '现金流健康且快速增长' }
        ]
      }
    ]
  },
  {
    id: 'execution',
    name: '执行能力',
    weight: 0.1,
    description: '评估项目进度、里程碑和执行力',
    questions: [
      {
        id: 'milestoneProgress',
        question: '里程碑完成情况',
        type: 'single',
        options: [
          { value: 1, label: '严重落后于计划' },
          { value: 2, label: '部分落后于计划' },
          { value: 3, label: '基本按计划进行' },
          { value: 5, label: '提前完成关键里程碑' }
        ]
      },
      {
        id: 'traction',
        question: '市场牵引力（用户/收入增长）',
        type: 'single',
        options: [
          { value: 1, label: '尚未有任何牵引力' },
          { value: 2, label: '有早期用户或试点客户' },
          { value: 3, label: '有稳定增长的用户/收入' },
          { value: 5, label: '有爆发式的牵引力' }
        ]
      },
      {
        id: 'partnerships',
        question: '战略合作伙伴关系',
        type: 'single',
        options: [
          { value: 1, label: '无重要合作伙伴' },
          { value: 2, label: '有一些本地合作伙伴' },
          { value: 3, label: '有行业相关的合作伙伴' },
          { value: 5, label: '有顶级战略伙伴' }
        ]
      },
      {
        id: 'adaptability',
        question: '团队的适应性和学习能力',
        type: 'single',
        options: [
          { value: 1, label: '适应性差，难以及时调整' },
          { value: 2, label: '适应性一般' },
          { value: 3, label: '适应性较好' },
          { value: 5, label: '团队学习能力强，调整迅速' }
        ]
      }
    ]
  }
]

function calculateCategoryScore(category, formData) {
  const questions = category.questions
  let totalScore = 0
  let answeredQuestions = 0

  questions.forEach((question) => {
    const answer = formData[question.id]
    if (answer !== undefined && answer !== null && answer !== '') {
      let score
      if (question.type === 'single') {
        const option = question.options.find(opt => opt.value === answer || opt.label === answer)
        score = option ? option.value : Number(answer)
      } else {
        score = Number(answer)
      }
      totalScore += score
      answeredQuestions++
    }
  })

  if (answeredQuestions === 0) return { score: 0, maxPossible: questions.length * 5 }

  const averageScore = totalScore / answeredQuestions
  const normalizedScore = (averageScore / 5) * 100
  const maxPossible = questions.length * 5

  return {
    score: normalizedScore,
    rawScore: totalScore,
    maxPossible: maxPossible,
    answeredQuestions,
    totalQuestions: questions.length
  }
}

export function calculateScores(formData) {
  const categoryScores = []
  let weightedTotal = 0
  let totalWeight = 0

  EVALUATION_CATEGORIES.forEach((category) => {
    const categoryScore = calculateCategoryScore(category, formData)
    categoryScore.category = category
    categoryScores.push(categoryScore)

    if (categoryScore.score > 0) {
      weightedTotal += categoryScore.score * category.weight
      totalWeight += category.weight
    }
  })

  const overallScore = totalWeight > 0 ? Math.round(weightedTotal / totalWeight) : 0

  return {
    overallScore,
    categoryScores,
    industry: formData.industry || 'other',
    timestamp: new Date().toISOString()
  }
}

export function getScoreInterpretation(score) {
  if (score >= 80) return {
    level: '优秀',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: '这个项目展现出非常强的潜力，各个维度都表现优秀。'
  }
  if (score >= 60) return {
    level: '良好',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: '项目有可观的潜力，建议继续推进并关注薄弱环节。'
  }
  if (score >= 40) return {
    level: '一般',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: '项目有一定机会，但需要在多个方面进行改进。'
  }
  return {
    level: '需要大幅改进',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: '项目面临较大挑战，建议在关键领域进行深入分析和改进。'
  }
}

export function generateRecommendations(scores) {
  const recommendations = []

  scores.categoryScores.forEach(({ score, category }) => {
    if (score < 60) {
      if (category.id === 'market') {
        recommendations.push({
          category: category.name,
          priority: 'high',
          suggestion: '深入进行市场调研，验证市场规模和增长潜力'
        })
      } else if (category.id === 'product') {
        recommendations.push({
          category: category.name,
          priority: 'high',
          suggestion: '加强与目标用户的交流，优化产品价值和功能'
        })
      } else if (category.id === 'team') {
        recommendations.push({
          category: category.name,
          priority: 'medium',
          suggestion: '考虑补充关键技能或寻求有经验的顾问支持'
        })
      } else if (category.id === 'finance') {
        recommendations.push({
          category: category.name,
          priority: 'medium',
          suggestion: '重新审视收入模式和成本结构，提高财务可行性'
        })
      } else if (category.id === 'execution') {
        recommendations.push({
          category: category.name,
          priority: 'low',
          suggestion: '制定更清晰的项目计划和时间表，加强执行力'
        })
      }
    }
  })

  return recommendations
}
