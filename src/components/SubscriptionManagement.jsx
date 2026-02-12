import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Calendar,
  Download,
  XCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Receipt,
  Shield
} from 'lucide-react';
import { useEvaluationStore } from '../stores/evaluationStore';
import { supabase } from '../supabaseClient';
import { format } from 'date-fns';

const SubscriptionManagement = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('current'); // current, history, invoices
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userTier, setUserTier, monthlyEvaluations, monthlyAICredits } = useEvaluationStore();

  // Pricing information
  const plans = {
    free: { name: '免费版', price: 0, period: '月' },
    pro: { name: '专业版 Pro', price: 299, period: '年' },
    premium: { name: '高级版 Premium', price: 999, period: '年' }
  };

  // Get mock subscription data for development
  const getMockSubscription = () => {
    const now = new Date();
    const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const tier = userTier || 'free';
    const plan = plans[tier];

    return {
      id: 'sub_mock_' + Date.now(),
      plan_id: tier,
      status: tier === 'free' ? 'active' : 'active',
      current_period_start: now.toISOString(),
      current_period_end: nextBilling.toISOString(),
      amount: plan.price * 100, // in cents
      currency: 'CNY',
      created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    };
  };

  // Get mock payment history
  const getMockPayments = () => {
    const mockPayments = [];
    const baseDate = new Date();

    for (let i = 0; i < 3; i++) {
      const paymentDate = new Date(baseDate);
      paymentDate.setMonth(baseDate.getMonth() - i);

      const isPro = userTier === 'pro';
      const isPremium = userTier === 'premium';

      if (isPro || isPremium || i === 0) {
        mockPayments.push({
          id: 'pay_mock_' + Date.now() + '_' + i,
          amount: (isPro ? 29900 : isPremium ? 99900 : 0),
          currency: 'CNY',
          status: 'succeeded',
          provider: isPro || isPremium ? 'wechat' : 'none',
          created_at: paymentDate.toISOString(),
          description: `${plans[userTier]?.name || '免费版'} - ${format(paymentDate, 'yyyy年MM月')}`,
          receipt_url: null
        });
      }
    }

    return mockPayments;
  };

  // Fetch subscription data
  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // In development mode, use mock data
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
        setSubscription(getMockSubscription());
        setPayments(getMockPayments());
        return;
      }

      // In production, fetch from Supabase
      const userId = await getUserId();

      if (!userId) {
        throw new Error('请先登录');
      }

      // Fetch current subscription
      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      setSubscription(subscriptionData);

      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('subscription_id', subscriptionData?.id)
        .order('created_at', { ascending: false });

      if (paymentsError) {
        throw paymentsError;
      }

      setPayments(paymentsData || []);
    } catch (err) {
      console.error('Failed to fetch subscription data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get user ID helper
  const getUserId = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || 'mock-user-id';
    } catch (error) {
      console.warn('Failed to get user ID:', error.message);
      return 'mock-user-id';
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!confirm('确定要取消订阅吗？取消后将无法使用付费功能。')) {
      return;
    }

    try {
      setLoading(true);

      // In development mode, just update local state
      if (import.meta.env.DEV) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUserTier('free');
        onClose();
        alert('订阅已取消，您的账户已降级为免费版');
        return;
      }

      // In production, cancel via API
      const userId = await getUserId();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({ userId })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setUserTier('free');
      onClose();
      alert('订阅已取消，您的账户已降级为免费版');
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      alert('取消订阅失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Download invoice
  const handleDownloadInvoice = async (paymentId) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // In development, generate a simple receipt
      const receiptContent = `
Praxis Partners 电子收据
========================

订单号：${payment.id}
日期：${format(new Date(payment.created_at), 'yyyy年MM月dd日 HH:mm')}
描述：${payment.description}
金额：¥${(payment.amount / 100).toFixed(2)}
状态：支付成功

感谢您的购买！
      `.trim();

      const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${payment.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert('下载收据失败，请稍后重试');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'yyyy年MM月dd日');
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: '正常' };
      case 'canceled':
        return { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: '已取消' };
      case 'past_due':
        return { color: 'bg-orange-100 text-orange-800', icon: Clock, text: '逾期未付' };
      default:
        return { color: 'bg-blue-100 text-blue-800', icon: Clock, text: '待处理' };
    }
  };

  // Check if subscription can be canceled
  const canCancel = subscription && subscription.plan_id !== 'free' && subscription.status === 'active';

  useEffect(() => {
    fetchSubscriptionData();
  }, [userTier]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchSubscriptionData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <CreditCard className="w-6 h-6 mr-2 text-blue-600" />
          订阅管理
        </h2>
        <p className="text-gray-600">管理您的订阅、查看支付历史并下载发票</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="border-b border-gray-200 mb-6"
      >
        <nav className="flex space-x-8">
          {[
            { id: 'current', label: '当前订阅', icon: Shield },
            { id: 'history', label: '支付历史', icon: Receipt },
            { id: 'invoices', label: '发票', icon: Download }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Current Subscription Tab */}
      {activeTab === 'current' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {subscription ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Subscription Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">订阅详情</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">当前套餐</p>
                      <p className="text-lg font-medium">
                        {plans[subscription.plan_id]?.name || '免费版'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">状态</p>
                      {(() => {
                        const status = getStatusBadge(subscription.status);
                        const Icon = status.icon;
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                            <Icon className="w-4 h-4 mr-1" />
                            {status.text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">价格</p>
                      <p className="text-lg font-medium">
                        {subscription.amount > 0 ? (
                          <>
                            ¥{(subscription.amount / 100).toFixed(2)}
                            <span className="text-sm text-gray-500 ml-1">/{plans[subscription.plan_id]?.period || '月'}</span>
                          </>
                        ) : (
                          '免费'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">续费日期</p>
                      <p className="text-sm font-medium flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Usage */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">本月使用情况</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>项目评估</span>
                      <span>{monthlyEvaluations}/{(userTier === 'free' ? 2 : userTier === 'pro' ? 10 : '∞')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (monthlyEvaluations / (userTier === 'free' ? 2 : userTier === 'pro' ? 10 : 100)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                  {userTier !== 'free' && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>AI分析额度</span>
                        <span>{monthlyAICredits}/{(userTier === 'pro' ? 5 : '∞')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (monthlyAICredits / (userTier === 'pro' ? 5 : 100)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {canCancel && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4 text-red-600">危险操作</h3>
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    取消订阅
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    取消订阅后，您的账户将在当前计费周期结束后降级为免费版
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">未找到订阅信息</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Payment History Tab */}
      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {payment.description || '支付'}
                      </h4>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(payment.created_at)}
                        </span>
                        <span className="flex items-center">
                          {payment.provider === 'wechat' ? (
                            <Smartphone className="w-4 h-4 mr-1" />
                          ) : (
                            <CreditCard className="w-4 h-4 mr-1" />
                          )}
                          {payment.provider === 'wechat' ? '微信支付' : '信用卡'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 mb-1">
                        ¥{(payment.amount / 100).toFixed(2)}
                      </p>
                      {payment.status === 'succeeded' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          成功
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          失败
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无支付记录</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-4">
            {payments.filter(p => p.status === 'succeeded').length > 0 ? (
              payments
                .filter(p => p.status === 'succeeded')
                .map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">
                          {payment.description || '发票'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(payment.created_at)} • ¥{(payment.amount / 100).toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadInvoice(payment.id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        下载
                      </button>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">暂无发票</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
