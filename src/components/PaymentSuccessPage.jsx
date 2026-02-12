import { motion } from 'framer-motion';
import { CheckCircle, Home, Shield, ArrowRight, Clock, Zap, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const PaymentSuccessPage = ({ planId = 'pro', onViewSubscription, onStartEvaluating }) => {
  const [showFeatures, setShowFeatures] = useState(false);

  const plans = {
    pro: {
      name: '专业版 Pro',
      price: 299,
      features: [
        '✅ 每月10次完整评估',
        '✅ 完整PDF报告下载',
        '✅ AI深度分析（5次/月）',
        '✅ 查看50个历史记录',
        '✅ 基础项目对比',
        '✅ 行业基准数据',
        '✅ 邮件客服支持'
      ]
    },
    premium: {
      name: '高级版 Premium',
      price: 999,
      features: [
        '🚀 无限次完整评估',
        '🚀 完整AI分析（无限次）',
        '🚀 无限历史记录',
        '🚀 高级项目对比',
        '🚀 完整行业基准',
        '🚀 数据导出功能',
        '🚀 优先客服支持'
      ]
    }
  };

  const plan = plans[planId] || plans.pro;

  useEffect(() => {
    // Show features with delay for animation
    const timer = setTimeout(() => setShowFeatures(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="max-w-lg w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-4"
            >
              <CheckCircle className="w-20 h-20 mx-auto" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold mb-2"
            >
              支付成功！
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-green-100"
            >
              感谢您的购买，您的账户已成功升级
            </motion.p>
          </div>

          <div className="p-8">
            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-6"
            >
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">订单号</span>
                  <span className="font-mono text-sm">ORD-{Date.now()}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">购买套餐</span>
                  <span className="font-medium flex items-center">
                    {planId === 'premium' ? (
                      <>
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        Premium
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-1 text-blue-500" />
                        Pro
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">支付金额</span>
                  <span className="text-xl font-bold text-gray-900">¥{plan.price}</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center text-blue-800">
                  <Clock className="w-4 h-4 mr-2" />
                  <p className="text-sm">
                    您的订阅有效期至：{new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: showFeatures ? 1 : 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-600" />
                您现在可以使用以下功能
              </h3>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: showFeatures ? 1 : 0,
                      x: showFeatures ? 0 : -20
                    }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center text-sm text-gray-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {feature.startsWith('✅') || feature.startsWith('🚀') ? feature.substring(2) : feature}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Start Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6"
            >
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                快速开始
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p>1. 点击"开始新评估"创建您的第一个项目评估</p>
                <p>2. 填写项目信息并完成所有评估维度</p>
                <p>3. 查看AI深度分析报告</p>
                <p>4. 导出PDF报告或分享给团队成员</p>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="space-y-3"
            >
              <button
                onClick={onStartEvaluating}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center font-medium shadow-lg"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                开始新评估
              </button>
              <button
                onClick={onViewSubscription}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Shield className="w-5 h-5 mr-2" />
                查看订阅管理
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                返回首页
              </button>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-6 pt-6 border-t border-gray-200 text-center"
            >
              <p className="text-sm text-gray-500 mb-2">
                需要帮助？我们的客服团队随时为您服务
              </p>
              <div className="flex justify-center space-x-4 text-sm">
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  在线客服
                </button>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  查看帮助文档
                </button>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  发送邮件
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
