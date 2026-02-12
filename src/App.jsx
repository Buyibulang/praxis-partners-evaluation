import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EvaluationForm from './components/EvaluationForm'
import ReportPage from './components/ReportPage'
import HistoryPage from './components/HistoryPage'
import CompareTool from './components/CompareTool'
import QuotaStatus from './components/QuotaStatus'
import SubscriptionManagement from './components/SubscriptionManagement'
import PaymentSuccessPage from './components/PaymentSuccessPage'
import PaymentFailedPage from './components/PaymentFailedPage'
import { useEvaluationStore } from './stores/evaluationStore'

function App() {
  const [currentView, setCurrentView] = useState('form') // form, history, report, compare, subscription, payment-success, payment-failed
  const [selectedEvaluations, setSelectedEvaluations] = useState([])
  const { currentEvaluation } = useEvaluationStore()

  // Check URL parameters for payment callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const paymentStatus = params.get('payment')
    const planId = params.get('plan')

    if (paymentStatus === 'success' && planId) {
      setCurrentView('payment-success')
    } else if (paymentStatus === 'failed') {
      setCurrentView('payment-failed')
    }
  }, [])

  const handleComplete = (evaluation) => {
    if (evaluation) {
      setSelectedEvaluations([evaluation])
    } else if (currentEvaluation) {
      setSelectedEvaluations([currentEvaluation])
    }
    setCurrentView('report')
  }

  const handleViewReport = (evaluation) => {
    setSelectedEvaluations([evaluation])
    setCurrentView('report')
  }

  const handleCompare = (evaluationIds) => {
    setSelectedEvaluations(evaluationIds)
    setCurrentView('compare')
  }

  const handleNewEvaluation = () => {
    setCurrentView('form')
  }

  const handleShowHistory = () => {
    setCurrentView('history')
  }

  const handleShowSubscription = () => {
    setCurrentView('subscription')
  }

  const handlePaymentSuccess = (planId) => {
    setCurrentView('payment-success')
  }

  const handlePaymentFailed = () => {
    setCurrentView('payment-failed')
  }

  const handleRetryPayment = () => {
    setCurrentView('form')
  }

  const renderHeader = () => {
    switch (currentView) {
      case 'form':
        return (
          <header className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="text-sm font-medium text-primary-800 bg-primary-100 inline-block px-3 py-1 rounded-full mb-2">
                  Praxis Partners
                </div>
                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  创业项目评估工具
                </h1>
                <p className="text-slate-600 max-w-2xl">
                  基于Praxis Partners投资方法论，通过5大维度、20项核心指标，为您的创业项目提供专业级的评估分析与成长建议
                </p>
              </div>

              {/* Quota Status Component */}
              <div className="ml-6 hidden lg:block">
                <QuotaStatus onManageSubscription={handleShowSubscription} />
              </div>
            </div>

            {/* Mobile Quota Status */}
            <div className="lg:hidden mb-4">
              <QuotaStatus onManageSubscription={handleShowSubscription} />
            </div>
          </header>
        )
      case 'history':
        return (
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('form')}
              className="btn btn-secondary mb-4"
            >
              ← 返回
            </button>
          </div>
        )
      case 'report':
        return (
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('history')}
              className="btn btn-secondary mb-4"
            >
              ← 返回历史记录
            </button>
          </div>
        )
      case 'compare':
        return (
          <div className="mb-6">
            <button
              onClick={() => setCurrentView('history')}
              className="btn btn-secondary mb-4"
            >
              ← 返回
            </button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentView === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderHeader()}
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleShowHistory}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  历史记录
                </button>
              </div>
              <EvaluationForm onComplete={handleComplete} />
            </motion.div>
          )}

          {currentView === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderHeader()}
              <div className="max-w-6xl mx-auto">
                <HistoryPage
                  onSelect={handleViewReport}
                  onCompare={handleCompare}
                  onNewEvaluation={handleNewEvaluation}
                />
              </div>
            </motion.div>
          )}

          {currentView === 'report' && selectedEvaluations.length > 0 && (
            <motion.div
              key="report"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderHeader()}
              <ReportPage evaluation={selectedEvaluations[0]} />
            </motion.div>
          )}

          {currentView === 'compare' && selectedEvaluations.length > 0 && (
            <CompareTool
              evaluationIds={selectedEvaluations}
              onClose={handleShowHistory}
            />
          )}

          {currentView === 'subscription' && (
            <motion.div
              key="subscription"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SubscriptionManagement
                onClose={() => setCurrentView('form')}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </motion.div>
          )}

          {currentView === 'payment-success' && (
            <motion.div
              key="payment-success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentSuccessPage
                onViewSubscription={handleShowSubscription}
                onStartEvaluating={() => setCurrentView('form')}
              />
            </motion.div>
          )}

          {currentView === 'payment-failed' && (
            <motion.div
              key="payment-failed"
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PaymentFailedPage
                onRetry={handleRetryPayment}
                onContactSupport={() => window.open('mailto:support@praxis-partners.com', '_blank')}
                onReturnHome={() => setCurrentView('form')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
