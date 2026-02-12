# 💳 支付功能测试指南

## 🎯 测试概述
本文档指导你如何测试Praxis Partners创业评估工具的支付功能。

## 📋 测试前提

### 环境要求
- ✅ Node.js 16+
- ✅ npm dependencies installed (`npm install`)
- ✅ 开发服务器运行中 (`npm run dev`)

### API密钥配置
检查 `.env.local` 文件是否包含：
- ✓ VITE_SUPABASE_URL
- ✓ VITE_SUPABASE_ANON_KEY
- ✓ VITE_STRIPE_PUBLISHABLE_KEY (可选)

## 🧪 测试模式

### 模式1: 模拟模式 (推荐用于开发)
**特性：**
- 无需部署后端
- 支付自动成功（2秒延迟）
- 测试完整的UI流程

**启动步骤：**
```bash
# 1. 启用模拟模式
./ENABLE_MOCK_MODE.sh

# 2. 重启开发服务器
npm run dev

# 3. 打开浏览器访问 http://localhost:3000/
```

**测试流程：**
1. 点击页面顶部的"免费版"状态
2. 点击"升级到Pro"或"升级到Premium"
3. 选择套餐（Pro ¥299/年 或 Premium ¥999/年）
4. 选择支付方式（微信支付或信用卡）
5. 点击"支付 ¥X.XX"
6. 等待2秒，查看成功提示

**微信支付测试：**
- 选择微信支付后，会显示二维码弹窗（目前在模拟模式也显示）
- 弹窗会显示倒计时（5分钟）
- 在开发环境中，可以点击"X"关闭弹窗
- 回到UpgradeModal，会显示"支付成功！”

**成功验证：**
- 页面顶部的用户层级会从"免费版"更新为"专业版 Pro"或"高级版 Premium"
- QuotaStatus 组件会显示新的配额限制

### 模式2: 真实支付模式 (需要后端部署)
**特性：**
- 调用真实的 Edge Functions
- 真实的微信支付二维码
- 真实的 Stripe Checkout 流程

**前提条件：**
- ✅ Edge Functions 已部署 (`./deploy.sh`)
- ✅ Supabase 项目已配置
- ✅ Stripe Webhook 已设置（如果使用 Stripe）

**启动步骤：**
```bash
# 1. 禁用模拟模式
./DISABLE_MOCK_MODE.sh

# 2. 重启开发服务器
npm run dev

# 3. 打开浏览器访问 http://localhost:3000/
```

**测试流程：**
1. 点击"升级到 Pro"
2. 选择支付方式
3. 点击支付
   - **微信支付**：会显示真实二维码，需用手机微信扫描支付
   - **Stripe**：会跳转到 Stripe Checkout 页面
4. 支付完成后自动返回应用
5. 验证用户层级已更新

## 🔍 功能清单

### ✅ 已完成功能
- [x] UpgradeModal 组件（套餐对比）
- [x] PaymentButton 组件（支付方式选择）
- [x] WeChatPayModal 组件（二维码弹窗）
- [x] 模拟支付模式（2秒自动成功）
- [x] Edge Functions 集成代码
- [x] 支付状态管理
- [x] 用户层级升级逻辑

### 🔄 自动行为
- 加载状态显示
- 错误处理
- 成功提示
- 二维码倒计时
- 支付状态轮询（每3秒检查一次）

### 🎨 UI交互
- 支付方式选择高亮
- 加载动画
- 成功动画
- 模态框弹窗
- 响应式设计

## 🐛 常见问题

### Q1: 支付按钮无效或报错
**原因：**
- Edge Functions 未部署
- .env.local 配置错误
- 网络连接问题

**解决：**
```bash
# 临时切换到模拟模式进行测试
./ENABLE_MOCK_MODE.sh
npm run dev
```

### Q2: 二维码弹窗不显示
**原因：**
- 微信支付的 URL 格式错误
- Edge Function 返回的数据格式不正确

**解决：**
- 检查浏览器控制台日志
- 验证 Edge Function 返回的数据结构

### Q3: 支付成功但层级未更新
**原因：**
- onSuccess 回调未正确传递
- 状态管理未正确更新

**解决：**
- 检查 UpgradeModal 中的 handleSuccess 函数
- 验证 useEvaluationStore 是否正确更新

## 📊 测试数据

### Mock Payment Response (模拟数据)
```json
{
  "order_id": "wx_order_123456",
  "code_url": "weixin://wxpay/bizpayurl?pr=123456",
  "amount": 29900,
  "plan_id": "pro"
}
```

### Edge Functions 端点
- 微信支付：`https://jyjnadjvhoeyudltvpfy.functions.supabase.co/wechat-pay-create`
- Stripe支付：`https://jyjnadjvhoeyudltvpfy.functions.supabase.co/stripe-checkout-create`
- Webhook：`https://jyjnadjvhoeyudltvpfy.functions.supabase.co/payment-webhook`

## 🎯 下一步

完成前端支付功能后，需要：
1. **部署后端**：运行 `./deploy.sh`
2. **配置 Webhook**：按照 `STRIPE_WEBHOOK_SETUP.md` 配置
3. **真实支付测试**：使用小额真实支付测试
4. **生产环境部署**：更新环境变量为生产配置

## 📞 技术支持

如遇到问题：
1. 查看浏览器控制台错误日志
2. 检查服务器日志：`supabase functions logs`
3. 在 GitHub 提交 Issue 时附上：
   - 错误截图
   - 控制台日志
   - 操作步骤

---

**测试愉快！ 🚀**