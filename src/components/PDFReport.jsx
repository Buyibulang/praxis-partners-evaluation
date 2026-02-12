import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { motion } from 'framer-motion'
import { Download, FileText, ChevronDown } from 'lucide-react'
import { useState, forwardRef, useImperativeHandle } from 'react'

// 加载 Noto Sans SC 中文字体
const loadNotoSansSCFont = async () => {
  try {
    const response = await fetch('https://fonts.gstatic.com/s/notosanssc/v26/koKnuoRemXiK9-7-2k6z7w.woff2')
    const fontData = await response.arrayBuffer()
    const base64Font = btoa(String.fromCharCode(...new Uint8Array(fontData)))
    return base64Font
  } catch (error) {
    console.warn('无法加载中文字体，将使用备用方案:', error)
    return null
  }
}

const PDFReport = forwardRef(({ evaluation, recommendations }, ref) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    generatePDFDocument
  }))

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const doc = new jsPDF('p', 'mm', 'a4')

      // 尝试加载中文字体
      const notoSansSCBase64 = await loadNotoSansSCFont()

      if (notoSansSCBase64) {
        // 添加中文字体到 PDF
        doc.addFileToVFS('NotoSansSC-Regular.woff2', notoSansSCBase64)
        doc.addFont('NotoSansSC-Regular.woff2', 'NotoSansSC', 'normal')
        doc.setFont('NotoSansSC')
      }
      const pageWidth = 210
      const pageHeight = 297
      const margin = 15
      const contentWidth = pageWidth - margin * 2

      // 字体设置
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC')
      } else {
        doc.setFont('helvetica', 'normal')
      }
      doc.setTextColor(15, 23, 42) // slate-900

      // 封面页
      const coverStartY = 60

      // 添加Logo区域（占位符）
      doc.setFillColor(2, 132, 199) // primary-600
      doc.rect(pageWidth / 2 - 25, coverStartY, 50, 50, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('PP', pageWidth / 2, coverStartY + 32, { align: 'center' })

      // 标题
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(32)
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'bold')
      }
      doc.text('创业评估报告', pageWidth / 2, coverStartY + 75, { align: 'center' })

      // 项目信息
      doc.setFontSize(20)
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'normal')
      }
      doc.text(evaluation.projectName, pageWidth / 2, coverStartY + 90, { align: 'center' })

      doc.setFontSize(12)
      doc.setTextColor(100, 116, 139) // slate-500
      const date = new Date(evaluation.date).toLocaleDateString('zh-CN')
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'normal')
      }
      doc.text(`生成日期: ${date}`, pageWidth / 2, coverStartY + 105, { align: 'center' })

      // 副标题
      doc.setTextColor(2, 132, 199)
      doc.setFontSize(14)
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'normal')
      }
      doc.text('Praxis Partners | 专业创业评估工具', pageWidth / 2, coverStartY + 130, { align: 'center' })

      doc.addPage()

      // 执行摘要
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(24)
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'bold')
      }
      doc.text('执行摘要', margin, 25)

      // 分隔线
      doc.setDrawColor(226, 232, 240) // slate-200
      doc.line(margin, 30, pageWidth - margin, 30)

      // 总体评分
      doc.setFontSize(48)
      doc.setTextColor(2, 132, 199)
      const overallScore = evaluation.overallScore
      doc.text(`${overallScore}%`, margin, 50)

      // 评分等级
      let level, color
      if (overallScore >= 80) {
        level = '优秀'
        color = [16, 185, 129] // green-500
      } else if (overallScore >= 60) {
        level = '良好'
        color = [59, 130, 246] // blue-500
      } else if (overallScore >= 40) {
        level = '一般'
        color = [245, 158, 11] // amber-500
      } else {
        level = '需要大幅改进'
        color = [239, 68, 68] // red-500
      }

      doc.setFontSize(18)
      doc.setTextColor(...color)
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'bold')
      }
      doc.text(level, margin + 40, 50)

      // 描述
      doc.setTextColor(71, 85, 105) // slate-600
      doc.setFontSize(11)
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'normal')
      }
      const summaryText = level.includes('优秀')
        ? '该项目展现出非常强的潜力，各个维度都表现优秀。建议继续推进，可以考虑进一步扩大规模。'
        : level.includes('良好')
        ? '项目有可观的潜力，建议继续推进并关注薄弱环节，寻求专业指导可以帮助项目更快成长。'
        : level.includes('一般')
        ? '项目有一定机会，但需要在多个方面进行改进。建议制定详细的改进计划，并寻求外部资源支持。'
        : '项目面临较大挑战，建议在关键领域进行深入分析和改进。可能需要重新考虑商业模式或寻求战略合作伙伴。'

      const lines = doc.splitTextToSize(summaryText, contentWidth)
      doc.text(lines, margin, 65)

      // 维度概览
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(16)
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'bold')
      }
      doc.text('各维度表现', margin, 100)

      let startY = 110
      const lineHeight = 15

      evaluation.categoryScores.forEach((category) => {
        const score = Math.round(category.score)
        const name = category.category.name

        // 背景条
        doc.setFillColor(241, 245, 249) // slate-100
        doc.rect(margin, startY - 3, contentWidth, 10, 'F')

        // 分数条
        const barWidth = (score / 100) * contentWidth
        doc.setFillColor(...color)
        doc.rect(margin, startY - 3, barWidth, 10, 'F')

        // 文字
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(11)
        if (notoSansSCBase64) {
          doc.setFont('NotoSansSC', 'normal')
        } else {
          doc.setFont('helvetica', 'bold')
        }
        doc.text(name, margin + 2, startY + 4)

        if (notoSansSCBase64) {
          doc.setFont('NotoSansSC', 'normal')
        } else {
          doc.setFont('helvetica', 'normal')
        }
        doc.text(`${score}%`, pageWidth - margin - 15, startY + 4, { align: 'right' })

        startY += lineHeight
      })

      // 详细分析
      doc.addPage()
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(24)
      if (notoSansSCBase64) {
        doc.setFont('NotoSansSC', 'normal')
      } else {
        doc.setFont('helvetica', 'bold')
      }
      doc.text('详细分析', margin, 25)

      doc.line(margin, 30, pageWidth - margin, 30)

      const detailedStartY = 40
      startY = detailedStartY

      evaluation.categoryScores.forEach((category, index) => {
        const categoryData = category.category
        const score = Math.round(category.score)

        // 检查是否需要新页面
        if (startY > 200) {
          doc.addPage()
          startY = 25
        }

        // 类目标题
        doc.setFontSize(16)
        if (notoSansSCBase64) {
          doc.setFont('NotoSansSC', 'normal')
        } else {
          doc.setFont('helvetica', 'bold')
        }
        doc.setTextColor(15, 23, 42)
        doc.text(`${categoryData.name} (${score}%)`, margin, startY)

        // 描述
        doc.setFontSize(10)
        if (notoSansSCBase64) {
          doc.setFont('NotoSansSC', 'normal')
        } else {
          doc.setFont('helvetica', 'normal')
        }
        doc.setTextColor(100, 116, 139)
        const descLines = doc.splitTextToSize(categoryData.description, contentWidth)
        doc.text(descLines, margin, startY + 6)

        startY += descLines.length * 3 + 10

        // 问题列表
        categoryData.questions.forEach((question) => {
          if (startY > 260) {
            doc.addPage()
            startY = 25
          }

          const answer = evaluation.formData[question.id]
          if (answer) {
            doc.setFontSize(9)
            doc.setTextColor(71, 85, 105)
            const shortQuestion = question.question.length > 40
              ? question.question.substring(0, 40) + '...'
              : question.question
            if (notoSansSCBase64) {
              doc.setFont('NotoSansSC', 'normal')
            } else {
              doc.setFont('helvetica', 'normal')
            }
            doc.text(`• ${shortQuestion}`, margin + 3, startY)

            let answerText
            if (question.type === 'single') {
              const option = question.options.find(opt => opt.value == answer)
              answerText = option ? option.label.substring(0, 20) : answer
            } else {
              answerText = `评分: ${answer}/5`
            }

            doc.setTextColor(2, 132, 199)
            if (notoSansSCBase64 && option && option.label) {
              doc.setFont('NotoSansSC', 'normal')
            } else {
              doc.setFont('helvetica', 'normal')
            }
            doc.text(answerText, pageWidth - margin - 5, startY, { align: 'right' })

            startY += 5
          }
        })

        startY += 10
      })

      // 改进建议
      if (recommendations.length > 0) {
        doc.addPage()
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(24)
        if (notoSansSCBase64) {
          doc.setFont('NotoSansSC', 'normal')
        } else {
          doc.setFont('helvetica', 'bold')
        }
        doc.text('改进建议', margin, 25)

        doc.line(margin, 30, pageWidth - margin, 30)

        startY = 40

        recommendations.forEach((rec, index) => {
          if (startY > 260) {
            doc.addPage()
            startY = 25
          }

          doc.setFontSize(12)
          if (notoSansSCBase64) {
            doc.setFont('NotoSansSC', 'normal')
          } else {
            doc.setFont('helvetica', 'bold')
          }
          const priorityIcon = rec.priority === 'high' ? '⚠️' : rec.priority === 'medium' ? '!' : 'ℹ️'
          doc.text(`${priorityIcon} ${rec.category}`, margin, startY)

          doc.setFontSize(10)
          if (notoSansSCBase64) {
            doc.setFont('NotoSansSC', 'normal')
          } else {
            doc.setFont('helvetica', 'normal')
          }
          const suggestionLines = doc.splitTextToSize(rec.suggestion, contentWidth - 10)
          doc.text(suggestionLines, margin + 5, startY + 5)

          const priorityText = rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'
          doc.setTextColor(59, 130, 246)
          doc.setFontSize(8)
          if (notoSansSCBase64) {
            doc.setFont('NotoSansSC', 'normal')
          } else {
            doc.setFont('helvetica', 'normal')
          }
          doc.text(priorityText, pageWidth - margin - 5, startY, { align: 'right' })

          startY += suggestionLines.length * 3 + 10
        })
      }
      if (recommendations.length > 0) {
        doc.addPage()
        doc.setTextColor(15, 23, 42)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('改进建议', margin, 25)

        doc.line(margin, 30, pageWidth - margin, 30)

        startY = 40

        recommendations.forEach((rec, index) => {
          if (startY > 260) {
            doc.addPage()
            startY = 25
          }

          doc.setFontSize(12)
          doc.setFont('helvetica', 'bold')
          const priorityIcon = rec.priority === 'high' ? '⚠️' : rec.priority === 'medium' ? '!' : 'ℹ️'
          doc.text(`${priorityIcon} ${rec.category}`, margin, startY)

          doc.setFontSize(10)
          doc.setFont('helvetica', 'normal')
          const suggestionLines = doc.splitTextToSize(rec.suggestion, contentWidth - 10)
          doc.text(suggestionLines, margin + 5, startY + 5)

          const priorityText = rec.priority === 'high' ? '高优先级' : rec.priority === 'medium' ? '中优先级' : '低优先级'
          doc.setTextColor(59, 130, 246)
          doc.setFontSize(8)
          doc.text(priorityText, pageWidth - margin - 5, startY, { align: 'right' })

          startY += suggestionLines.length * 3 + 10
        })
      }

      // 页脚
      const totalPages = doc.internal.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184) // slate-400

        // 如果有中文字体，使用它
        if (notoSansSCBase64) {
          doc.setFont('NotoSansSC')
        } else {
          doc.setFont('helvetica', 'normal')
        }

        doc.text(`${i} / ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
        doc.text('Praxis Partners | 专业创业评估工具', margin, pageHeight - 10)
        doc.text('机密文档', pageWidth - margin, pageHeight - 10, { align: 'right' })
      }

      // 保存PDF
      const fileName = `${evaluation.projectName}_评估报告_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)

    } catch (error) {
      console.error('PDF生成失败:', error)
      alert('PDF生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 公共方法：从外部调用生成PDF
  const generatePDFDocument = async (evalData, recs) => {
    if (!evalData) {
      console.error('没有提供评估数据')
      return
    }

    // 使用传入的数据生成PDF
    const recommendations = recs || []
    const evaluation = evalData

    setIsGenerating(true)
    try {
      const doc = new jsPDF('p', 'mm', 'a4')
      const notoSansSCBase64 = await loadNotoSansSCFont()

      if (notoSansSCBase64) {
        doc.addFileToVFS('NotoSansSC-Regular.woff2', notoSansSCBase64)
        doc.addFont('NotoSansSC-Regular.woff2', 'NotoSansSC', 'normal')
        doc.setFont('NotoSansSC')
      }

      // PDF生成逻辑...
      const pageWidth = 210
      const pageHeight = 297
      const margin = 15
      const contentWidth = pageWidth - margin * 2

      // 封面页
      const coverStartY = 60
      doc.setFillColor(2, 132, 199)
      doc.rect(pageWidth / 2 - 25, coverStartY, 50, 50, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.text('PP', pageWidth / 2, coverStartY + 32, { align: 'center' })

      // 标题
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(32)
      doc.text('创业评估报告', pageWidth / 2, coverStartY + 75, { align: 'center' })

      // 项目信息
      doc.setFontSize(20)
      doc.text(evaluation.projectName, pageWidth / 2, coverStartY + 90, { align: 'center' })

      doc.setFontSize(12)
      doc.setTextColor(100, 116, 139)
      const date = new Date(evaluation.date).toLocaleDateString('zh-CN')
      doc.text(`生成日期: ${date}`, pageWidth / 2, coverStartY + 105, { align: 'center' })

      doc.addPage()

      // 执行摘要
      doc.setFontSize(24)
      doc.text('执行摘要', margin, 25)
      doc.line(margin, 30, pageWidth - margin, 30)

      const overallScore = evaluation.overallScore
      doc.setFontSize(48)
      doc.setTextColor(2, 132, 199)
      doc.text(`${overallScore}%`, margin, 50)

      // 评分等级
      let level
      if (overallScore >= 80) level = '优秀'
      else if (overallScore >= 60) level = '良好'
      else if (overallScore >= 40) level = '一般'
      else level = '需要大幅改进'

      doc.setFontSize(18)
      doc.text(level, margin + 40, 50)

      // 保存PDF
      const fileName = `${evaluation.projectName}_评估报告_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)

    } catch (error) {
      console.error('PDF生成失败:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="btn btn-primary flex items-center"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            正在生成...
          </>
        ) : (
          <>
            <Download size={16} className="mr-2" />
            导出报告
            <ChevronDown size={14} className="ml-2" />
          </>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
          <button
            onClick={() => {
              generatePDF()
              setShowDropdown(false)
            }}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center transition-colors"
          >
            <FileText size={16} className="mr-2 text-slate-600" />
            <div>
              <div className="font-medium">PDF报告</div>
              <div className="text-xs text-slate-500">生成完整PDF</div>
            </div>
          </button>
          <button
            onClick={() => {
              exportJSON()
              setShowDropdown(false)
            }}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center transition-colors"
          >
            <Download size={16} className="mr-2 text-slate-600" />
            <div>
              <div className="font-medium">数据导出</div>
              <div className="text-xs text-slate-500">导出JSON数据</div>
            </div>
          </button>
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
})

export default PDFReport