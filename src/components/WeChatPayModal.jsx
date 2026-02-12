import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Clock } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '../supabaseClient'

const WeChatPayModal = ({ isOpen, onClose, orderId, codeUrl, amount, onSuccess }) => {
  const [status, setStatus] = useState('pending') // pending, scanning, paid, expired
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes in seconds

  // Format amount from cents to yuan
  const formatAmount = (amount) => {
    return (amount / 100).toFixed(2)
  }

  // Poll payment status
  useEffect(() => {
    if (!isOpen || status !== 'pending') return

    const interval = setInterval(async () => {
      try {
        // In production, check payment status from backend
        // For now, simulate polling
        console.log('Checking payment status for order:', orderId)

        // Simulate random payment success after some time (for testing)
        if (Math.random() < 0.1) { // 10% chance per poll
          setStatus('paid')
          if (onSuccess) {
            onSuccess()
          }
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Error checking payment status:', err)
      }
    }, 3000) // Check every 3 seconds

    return () => clearInterval(interval)
  }, [isOpen, orderId, status, onSuccess])

  // Countdown timer
  useEffect(() => {
    if (!isOpen || status !== 'pending') return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus('expired')
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, status])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-green-500 text-white p-6 text-center">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold flex items-center">
                <Smartphone className="w-6 h-6 mr-2" />
                微信支付
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-green-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-green-100">请使用微信扫一扫完成支付</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Amount Display */}
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">支付金额</p>
              <p className="text-3xl font-bold text-gray-900">
                ¥{formatAmount(amount)}
              </p>
            </div>

            {/* QR Code or Status */}
            {status === 'pending' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                  <QRCodeSVG
                    value={codeUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>

                {/* Instructions */}
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-gray-700">
                    请使用微信扫一扫
                  </p>
                  <p className="text-xs text-gray-500">
                    二维码有效时间：
                    <span className="text-orange-500 font-medium">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                </div>
              </motion.div>
            )}

            {status === 'scanning' && (
              <div className="text-center py-8">
                <div className="animate-pulse w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-green-500" />
                </div>
                <p className="text-lg font-medium text-gray-700">正在确认支付...</p>
              </div>
            )}

            {status === 'paid' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">支付成功！</h3>
                <p className="text-gray-600">感谢您的购买，功能已解锁</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  确定
                </button>
              </motion.div>
            )}

            {status === 'expired' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">二维码已过期</h3>
                <p className="text-gray-600">请重新发起支付</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  关闭
                </button>
              </div>
            )}

            {/* Help Text */}
            {status === 'pending' && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">提示：</span>
                  打开微信，点击右上角"+"，选择"扫一扫"，对准上方二维码完成支付
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default WeChatPayModal
