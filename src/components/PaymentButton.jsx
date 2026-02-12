import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Check, CreditCard, Smartphone } from 'lucide-react'
import WeChatPayModal from './WeChatPayModal'

const PaymentButton = ({ amount, onSuccess, description = 'Praxis Partners 创业评估工具' }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('wechat')
  const [showWeChatModal, setShowWeChatModal] = useState(false)
  const [weChatOrder, setWeChatOrder] = useState(null)

  const handlePayment = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Check if mock mode is enabled
      const isMockMode = import.meta.env.VITE_PAYMENT_MOCK_MODE === 'true'

      // Real or mock payment flow
      if (selectedPayment === 'wechat') {
        if (isMockMode) {
          // In mock mode, simulate WeChat payment with QR code
          await handleWeChatPaymentMock()
        } else {
          await handleWeChatPayment()
        }
      } else if (selectedPayment === 'stripe') {
        if (isMockMode) {
          // In mock mode, simulate Stripe payment success after 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000))
          setSuccess(true)
          if (onSuccess) onSuccess()
        } else {
          await handleStripePayment()
        }
      }
    } catch (err) {
      setError(err.message || '支付失败，请重试')
      console.error('Payment error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleWeChatPaymentMock = async () => {
    try {
      console.log('[MOCK] Creating WeChat payment in mock mode...')

      // Generate mock payment data
      const mockOrderId = `wx_mock_${Date.now()}`
      const mockQrCodeUrl = `weixin://wxpay/mock?order=${mockOrderId}`

      // Store order data and show QR code modal
      setWeChatOrder({
        orderId: mockOrderId,
        codeUrl: mockQrCodeUrl,
        amount
      })
      setShowWeChatModal(true)

      console.log('[MOCK] Mock payment created:', {
        orderId: mockOrderId,
        codeUrl: mockQrCodeUrl
      })
    } catch (error) {
      console.error('[MOCK] Mock payment creation failed:', error)
      throw new Error('创建模拟支付失败')
    }
  }

  const handleWeChatPayment = async () => {
    try {
      // Get user ID (in production, this would come from auth)
      const userId = `user_${Date.now()}` // Generate temporary user ID

      // Get current URL for success redirect
      const successUrl = `${window.location.origin}${window.location.pathname}`

      // Call the Supabase Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wechat-pay-create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            amount,
            description,
            planId: 'pro', // Default to pro plan, can be made dynamic
            userId,
            successUrl,
            cancelUrl: successUrl
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const paymentData = await response.json()

      // Check for error in response
      if (paymentData.error) {
        throw new Error(paymentData.error)
      }

      console.log('WeChat payment created:', paymentData)

      // Store order data and show QR code modal
      setWeChatOrder({
        orderId: paymentData.order_id,
        codeUrl: paymentData.code_url,
        amount: paymentData.amount
      })
      setShowWeChatModal(true)
    } catch (err) {
      console.error('WeChat payment creation failed:', err)
      throw err
    }
  }

  const handleStripePayment = async () => {
    try {
      // Check if Stripe is enabled
      if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        throw new Error('Stripe 支付暂未开放，请选择微信支付')
      }

      // Get user ID
      const userId = `user_${Date.now()}`
      const successUrl = `${window.location.origin}${window.location.pathname}?payment=success`
      const cancelUrl = `${window.location.origin}${window.location.pathname}?payment=cancel`

      // Call the Supabase Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout-create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            amount,
            description,
            planId: 'pro',
            userId,
            successUrl,
            cancelUrl
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const sessionData = await response.json()

      // Check for error in response
      if (sessionData.error) {
        throw new Error(sessionData.error)
      }

      console.log('Stripe session created:', sessionData)

      // Redirect to Stripe Checkout
      if (sessionData.url) {
        window.location.href = sessionData.url
      } else {
        throw new Error('Invalid session URL')
      }
    } catch (err) {
      console.error('Stripe payment creation failed:', err)

      // Fallback to mock success in development
      if (import.meta.env.DEV) {
        setTimeout(() => {
          setSuccess(true)
          onSuccess()
        }, 2000)
      } else {
        throw err
      }
    }
  }

  const formatAmount = (amount) => {
    return (amount / 100).toFixed(2)
  }

  if (success) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="flex items-center justify-center p-4 bg-green-100 rounded-lg"
      >
        <Check className="w-5 h-5 text-green-600 mr-2" />
        <span className="text-green-800 font-medium">支付成功！</span>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 支付方式选择 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">选择支付方式</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedPayment('wechat')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPayment === 'wechat'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <Smartphone className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <span className="text-sm">微信支付</span>
          </button>
          <button
            onClick={() => setSelectedPayment('stripe')}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPayment === 'stripe'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-1" />
            <span className="text-sm">信用卡</span>
          </button>
        </div>
      </div>

      {/* 支付按钮 */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            处理中...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Lock className="w-5 h-5 mr-2" />
            支付 ¥{formatAmount(amount)}
          </span>
        )}
      </button>

      {/* 错误信息 */}
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 安全提示 */}
      <p className="text-xs text-gray-500 text-center">
        🔒 支付信息已加密，我们不会存储您的支付信息
      </p>

      {/* 微信支付弹窗 */}
      <WeChatPayModal
        isOpen={showWeChatModal}
        onClose={() => {
          setShowWeChatModal(false)
          setWeChatOrder(null)
        }}
        orderId={weChatOrder?.orderId}
        codeUrl={weChatOrder?.codeUrl || ''}
        amount={weChatOrder?.amount || amount}
        onSuccess={() => {
          setShowWeChatModal(false)
          setWeChatOrder(null)
          setSuccess(true)
          if (onSuccess) onSuccess()
        }}
      />
    </div>
  )
}

export default PaymentButton