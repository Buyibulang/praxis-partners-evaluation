import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Link, Download, Mail, MessageCircle, X, Check, QrCode } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'

const ShareTool = ({ evaluation }) => {
  const [showModal, setShowModal] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('link') // link, qr, email

  const generateShareLink = () => {
    try {
      // 将评估数据编码到URL
      const data = {
        id: evaluation.id,
        projectName: evaluation.projectName,
        overallScore: evaluation.overallScore,
        categoryScores: evaluation.categoryScores,
        industry: evaluation.industry,
        date: evaluation.date
      }
      const encoded = btoa(JSON.stringify(data))
      const link = `${window.location.origin}/share/${encoded}`
      setShareLink(link)
      return link
    } catch (error) {
      console.error('链接生成失败:', error)
      return ''
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = shareLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const sendEmail = () => {
    const subject = encodeURIComponent(`${evaluation.projectName} - 创业评估报告`)
    const body = encodeURIComponent(
      `项目评估已完成，综合评分：${evaluation.overallScore}%\n\n` +
      `查看完整报告：${shareLink}\n\n` +
      `由Praxis Partners创业评估工具生成`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const shareToWeChat = () => {
    alert('请复制链接后在微信中分享')
    copyToClipboard()
  }

  const openModal = () => {
    generateShareLink()
    setShowModal(true)
  }

  return (
    <>
      <button
        onClick={openModal}
        className="btn btn-secondary flex items-center gap-2"
      >
        <Share2 size={16} />
        分享报告
      </button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-screen overflow-hidden"
            >
              <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">分享评估报告</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {/* 预览信息 */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">项目：{evaluation.projectName}</p>
                  <p className="text-sm text-gray-600 mt-1">评分：{evaluation.overallScore}%</p>
                </div>

                {/* Tab切换 */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab('link')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'link'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    链接分享
                  </button>
                  <button
                    onClick={() => setActiveTab('qr')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'qr'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    二维码
                  </button>
                  <button
                    onClick={() => setActiveTab('email')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'email'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    邮件分享
                  </button>
                </div>

                {/* Tab内容 */}
                {activeTab === 'link' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        分享链接
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={shareLink}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                          placeholder="生成链接中..."
                        />
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                          {copied ? (
                            <>
                              <Check size={16} />
                              已复制
                            </>
                          ) : (
                            <>
                              <Link size={16} />
                              复制
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium">分享方式：</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>点击"复制"按钮获取链接</li>
                        <li>通过邮件或即时通讯工具发送</li>
                        <li>任何拥有链接的人都可以查看报告</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'qr' && (
                  <div className="text-center space-y-4">
                    <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                      {shareLink ? (
                        <QRCodeCanvas
                          value={shareLink}
                          size={200}
                          level="H"
                          includeMargin={true}
                        />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                          生成中...
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      使用微信或其他扫码工具扫描二维码查看报告
                    </p>
                  </div>
                )}

                {activeTab === 'email' && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p className="font-medium mb-2">通过邮件分享：</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>点击发送邮件按钮</li>
                        <li>填写收件人邮箱</li>
                        <li>可自定义邮件内容</li>
                      </ul>
                    </div>
                    <button
                      onClick={sendEmail}
                      className="w-full btn btn-primary flex items-center justify-center gap-2"
                    >
                      <Mail size={16} />
                      打开邮件应用
                    </button>
                  </div>
                )}

                {/* 快捷分享 */}
                {activeTab === 'link' && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">快速分享到：</p>
                    <div className="flex gap-2">
                      <button
                        onClick={shareToWeChat}
                        className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        <MessageCircle size={16} className="mx-auto" />
                        <span className="mt-1 block">微信</span>
                      </button>
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `${evaluation.projectName} - 创业评估报告`,
                              text: `项目评分：${evaluation.overallScore}%`,
                              url: shareLink
                            })
                          } else {
                            alert('您的浏览器不支持原生分享功能，请手动复制链接')
                            copyToClipboard()
                          }
                        }}
                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Share2 size={16} className="mx-auto" />
                        <span className="mt-1 block">更多</span>
                      </button>
                      <button
                        onClick={() => {
                          window.location.href = `sms:?body=项目评估完成：${evaluation.projectName} 评分${evaluation.overallScore}%。查看详情：${shareLink}`
                        }}
                        className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                      >
                        <MessageCircle size={16} className="mx-auto" />
                        <span className="mt-1 block">短信</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ShareTool
