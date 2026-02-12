export const INDUSTRY_BENCHMARKS = {
  'saas': {
    name: 'SaaS/软件服务',
    averageScore: 68,
    categoryAverages: {
      market: 65,
      product: 72,
      team: 70,
      finance: 66,
      execution: 67
    },
    description: 'SaaS行业通常有较高的产品得分，但市场竞争激烈'
  },
  'ecommerce': {
    name: '电商/零售',
    averageScore: 62,
    categoryAverages: {
      market: 70,
      product: 60,
      team: 65,
      finance: 58,
      execution: 55
    },
    description: '电商项目市场规模大，但盈利能力和执行挑战较大'
  },
  'fintech': {
    name: '金融科技',
    averageScore: 71,
    categoryAverages: {
      market: 68,
      product: 75,
      team: 73,
      finance: 72,
      execution: 68
    },
    description: '金融科技项目整体评分较高，但监管风险需要关注'
  },
  'healthcare': {
    name: '医疗健康',
    averageScore: 64,
    categoryAverages: {
      market: 62,
      product: 66,
      team: 68,
      finance: 60,
      execution: 65
    },
    description: '医疗健康项目门槛高，团队专业性要求强'
  },
  'education': {
    name: '教育科技',
    averageScore: 61,
    categoryAverages: {
      market: 58,
      product: 63,
      team: 62,
      finance: 58,
      execution: 64
    },
    description: '教育科技市场分散，需要创新的商业模式'
  },
  'ai': {
    name: '人工智能',
    averageScore: 74,
    categoryAverages: {
      market: 72,
      product: 78,
      team: 76,
      finance: 68,
      execution: 75
    },
    description: 'AI项目技术门槛高，产品创新能力是关键'
  },
  'hardware': {
    name: '硬件/物联网',
    averageScore: 58,
    categoryAverages: {
      market: 55,
      product: 62,
      team: 60,
      finance: 54,
      execution: 59
    },
    description: '硬件项目研发周期长，资金需求大'
  },
  'media': {
    name: '媒体/内容',
    averageScore: 59,
    categoryAverages: {
      market: 61,
      product: 57,
      team: 58,
      finance: 56,
      execution: 63
    },
    description: '内容项目获客成本高，用户留存是关键'
  },
  'other': {
    name: '其他行业',
    averageScore: 60,
    categoryAverages: {
      market: 60,
      product: 60,
      team: 60,
      finance: 60,
      execution: 60
    },
    description: '综合性行业基准线'
  }
}

export function getIndustryBenchmark(industryKey) {
  return INDUSTRY_BENCHMARKS[industryKey] || INDUSTRY_BENCHMARKS['other']
}

export function getIndustryList() {
  return Object.entries(INDUSTRY_BENCHMARKS).map(([key, value]) => ({
    key,
    name: value.name,
    averageScore: value.averageScore
  }))
}

export function compareWithBenchmark(projectScore, industryKey) {
  const benchmark = getIndustryBenchmark(industryKey)
  const difference = projectScore - benchmark.averageScore
  const percentage = ((difference / benchmark.averageScore) * 100).toFixed(1)

  return {
    benchmark: benchmark,
    difference: difference,
    percentage: percentage,
    isAboveAverage: difference > 0
  }
}

export function compareCategoriesWithBenchmark(projectCategories, industryKey) {
  const benchmark = getIndustryBenchmark(industryKey)
  return projectCategories.map(category => {
    const categoryKey = category.category.id
    const categoryName = category.category.name
    const projectScore = category.score
    const benchmarkScore = benchmark.categoryAverages[categoryKey] || 60
    const difference = projectScore - benchmarkScore
    const percentage = ((difference / benchmarkScore) * 100).toFixed(1)

    return {
      category: category,
      benchmarkScore,
      difference,
      percentage,
      isAboveAverage: difference > 0
    }
  })
}