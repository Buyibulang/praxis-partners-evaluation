# 🚀 第三阶段前端支付集成 - 准备工作清单

**目标**: 在完成所有准备工作后，一次性成功集成前端支付功能

**预计准备时间**: 2-4小时（根据经验）

---

## 📋 准备工作流程

### 第一阶段：账户注册与配置（必需）⏱️ 30-60分钟

#### 1.1 Supabase 账户 ✅ 必需
**状态**: ⏳ 待完成
**预计时间**: 15分钟

**操作步骤**:
- [ ] 访问 https://supabase.com
- [ ] 点击 "Start your project"
- [ ] 使用 GitHub/Google 注册
- [ ] 创建新组织（Organization）
- [ ] 在新组织中创建项目
  - 项目名称: `venture-evaluation-prod`
  - 数据库密码: 生成强密码并保存
  - 地区: 选择离你最近的（如 `Southeast Asia (Singapore)`）

**完成后获得**:
- Supabase项目URL: `https://xxxxxxxxxx.supabase.co`
- Supabase API密钥（anon key）
- Supabase服务角色密钥（service_role key）

**记录位置**:
```
项目URL: _________________________
Anon Key: _________________________
Service Role Key: _________________
```

---

#### 1.2 Stripe 账户 ✅ 必需
**状态**: ⏳ 待完成
**预计时间**: 20分钟

**操作步骤**:
- [ ] 访问 https://dashboard.stripe.com/register
- [ ] 完成商家注册流程
- [ ] 验证邮箱
- [ ] 进入 Dashboard
- [ ] 获取 API 密钥:
  - 点击右上角 "Developers"
  - 点击 "API keys"
  - 复制 "Publishable key" (pk_test_...)
  - 点击 "Reveal test key" 获取 "Secret key" (sk_test_...)

**记录位置**:
```
Publishable Key: pk_test________________
Secret Key: sk_test_____________________
```

- [ ] 配置 Webhook:
  - 左侧菜单 "Developers" → "Webhooks"
  - 点击 "Add endpoint"
  - Endpoint URL: `https://your-project.supabase.co/functions/v1/payment-webhook`
  - 选择事件:
    - [ ] `payment_intent.succeeded`
    - [ ] `payment_intent.payment_failed`
    - [ ] `checkout.session.completed`
  - 点击 "Add endpoint"
  - 获取 Webhook Secret (whsec_...)

**记录位置**:
```
Webhook Secret: whsec___________________
```

---

#### 1.3 微信支付商户（可选）
**状态**: ⏳ 可选
**预计时间**: 30-60分钟（如果需要）

**仅在需要微信支付时配置**:
- [ ] 访问 https://pay.weixin.qq.com
- [ ] 注册微信支付商户账号
- [ ] 完成企业认证
- [ ] 获取商户号（MCHID）
- [ ] 获取 API 密钥
- [ ] 配置支付授权目录

**记录位置**:
```
MCHID: _______________________
API Key: ______________________
Cert Serial Number: ___________
```

---

### 第二阶段：本地环境配置 ⏱️ 15分钟

#### 2.1 更新本地环境变量 ✅ 必需
**状态**: ⏳ 待完成
**文件**: `/Users/ganbin/venture-evaluation/.env.local`

**操作步骤**:
- [ ] 打开 `.env.local` 文件
- [ ] 修改 Supabase 配置:
```bash
# Supabase配置（替换为真实值）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase
```

- [ ] 修改 Stripe 配置:
```bash
# Stripe支付配置
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# 注意：下面的密钥只用于后端，不要暴露给前端！
# 后端使用: STRIPE_SECRET_KEY=sk_test_your_secret_key
# 后端使用: STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

- [ ] 修改应用模式:
```bash
# 生产模式
VITE_PAYMENT_MOCK_MODE=false
VITE_APP_ENV=production
```

---

#### 2.2 安装 Supabase CLI ✅ 必需
**状态**: ⏳ 待完成

```bash
# 安装 Supabase CLI
npm install -g supabase

# 验证安装
supabase --version
```

---

#### 2.3 登录 Supabase CLI ✅ 必需
**状态**: ⏳ 待完成

```bash
# 登录 Supabase
supabase login

# 按照提示完成认证
```

---

### 第三阶段：数据库部署 ⏱️ 20分钟

#### 3.1 初始化 Supabase 项目 ✅ 必需
**状态**: ⏳ 待完成
**预计时间**: 10分钟

```bash
# 进入项目目录
cd /Users/ganbin/venture-evaluation

# 如果还未 init，运行（如果已存在则跳过）
supabase init

# 链接到远程项目
supabase link --project-ref your-project-id

# Project ID 是 Supabase URL 中的部分
# 如: https://abcxyz.supabase.co → abcxyz
```

---

#### 3.2 部署数据库迁移 ✅ 必需
**状态**: ⏳ 待完成
**预计时间**: 10分钟

```bash
# 部署所有数据库迁移
supabase db push

# 预期输出:
# Applying migration 001_create_subscriptions_table.sql...
# Applying migration 002_create_payments_table.sql...
# Applying migration 003_create_usage_limits_table.sql...
# ✅ All migrations applied successfully!
```

**验证**:
- [ ] 登录 Supabase Dashboard
- [ ] 进入 "Table Editor"
- [ ] 确认三个表已创建：
  - [ ] subscriptions
  - [ ] payments
  - [ ] usage_limits

---

### 第四阶段：Edge Functions 部署 ⏱️ 15分钟

#### 4.1 部署 WeChat Pay 函数 ✅ 必需
**状态**: ⏳ 待完成

```bash
# 部署 WeChat Pay 函数
supabase functions deploy wechat-pay-create --no-verify-jwt

# 预期输出:
# Deploying function wechat-pay-create...
# ✅ Function wechat-pay-create deployed successfully!
# URL: https://your-project.supabase.co/functions/v1/wechat-pay-create
```

**记录**:
```
WeChat Pay URL: ___________________________
```

---

#### 4.2 部署 Stripe Checkout 函数 ✅ 必需
**状态**: ⏳ 待完成

```bash
# 部署 Stripe Checkout 函数
supabase functions deploy stripe-checkout-create --no-verify-jwt

# 预期输出:
# Deploying function stripe-checkout-create...
# ✅ Function stripe-checkout-create deployed successfully!
# URL: https://your-project.supabase.co/functions/v1/stripe-checkout-create
```

**记录**:
```
Stripe Checkout URL: _______________________
```

---

#### 4.3 部署 Payment Webhook 函数 ✅ 必需
**状态**: ⏳ 待完成

```bash
# 部署 Payment Webhook 函数
supabase functions deploy payment-webhook --no-verify-jwt

# 预期输出:
# Deploying function payment-webhook...
# ✅ Function payment-webhook deployed successfully!
# URL: https://your-project.supabase.co/functions/v1/payment-webhook
```

**记录**:
```
Webhook URL: ________________________________
```

---

### 第五阶段：Stripe 配置 ⏱️ 15分钟

#### 5.1 设置 Stripe Webhook ✅ 必需
**状态**: ⏳ 待完成

**在 Stripe Dashboard 操作**:

1. **添加 Webhook Endpoint**:
   - 前往 https://dashboard.stripe.com/webhooks
   - 点击 "Add endpoint"
   - Endpoint URL: `https://your-project.supabase.co/functions/v1/payment-webhook`

2. **选择事件类型**:
   - [ ] `payment_intent.succeeded`
   - [ ] `payment_intent.payment_failed`
   - [ ] `checkout.session.completed`

3. **保存并获取 Secret**:
   - 点击 "Add endpoint"
   - 复制 Webhook Secret (whsec_...)

**更新环境变量**:
```bash
# 在 .env.local 中添加
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

#### 5.2 配置 Stripe 产品 ✅ 必需
**状态**: ⏳ 待完成

**在 Stripe Dashboard 操作**:

1. **创建产品**:
   - 前往 "Products"
   - 点击 "Add product"
   - 创建 Pro 计划:
     - 名称: "Pro Plan"
     - 描述: "专业版订阅"
     - 价格: ¥299.00 /月
     - 计费周期: Monthly
   - 创建 Premium 计划:
     - 名称: "Premium Plan"
     - 描述: "高级版订阅"
     - 价格: ¥599.00 /月
     - 计费周期: Monthly

2. **记录 Price IDs**:
```
Pro Price ID: price________________________
Premium Price ID: price____________________
```

---

### 第六阶段：前端代码检查 ⏱️ 15分钟

#### 6.1 验证 supabaseClient.js ✅ 必需
**状态**: ⏳ 检查
**文件**: `src/supabaseClient.js`

确保文件正确配置:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**验证项**:
- [ ] 使用 `import.meta.env` 而不是 `process.env`
- [ ] 正确导出 supabase 客户端
- [ ] 没有硬编码的密钥

---

#### 6.2 验证 quotaManager.js ✅ 必需
**状态**: ⏳ 检查
**文件**: `src/utils/quotaManager.js`

确保支持生产模式:
- [ ] 优先使用 Supabase（而不是 localStorage）
- [ ] 正确处理 API 错误
- [ ] 有适当的错误回退机制

---

### 第七阶段：测试数据准备 ⏱️ 10分钟

#### 7.1 创建测试用户 ✅ 推荐
**状态**: ⏳ 待完成

在 Supabase Dashboard 中:

1. **手动插入测试用户**:
```sql
-- 在 Supabase SQL Editor 中执行

-- 插入测试订阅
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
VALUES
  ('test_user_001', 'free', 'active', NOW(), NOW() + INTERVAL '1 month'),
  ('test_user_002', 'pro', 'active', NOW(), NOW() + INTERVAL '1 month'),
  ('test_user_003', 'premium', 'active', NOW(), NOW() + INTERVAL '1 month');

-- 插入测试配额
INSERT INTO usage_limits (user_id, plan_id, evaluations_used, ai_credits_used, last_reset_date)
VALUES
  ('test_user_001', 'free', 1, 0, CURRENT_DATE),
  ('test_user_002', 'pro', 5, 3, CURRENT_DATE),
  ('test_user_003', 'premium', 20, 10, CURRENT_DATE);
```

2. **验证数据**:
```sql
SELECT * FROM subscriptions WHERE user_id LIKE 'test_user_%';
SELECT * FROM usage_limits WHERE user_id LIKE 'test_user_%';
```

---

### 第八阶段：API 测试 ⏱️ 20分钟

#### 8.1 测试 WeChat Pay API ✅ 推荐
**状态**: ⏳ 待测试

使用 curl 或 Postman 测试:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/wechat-pay-create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29900,
    "description": "Pro Plan - Monthly",
    "planId": "pro",
    "userId": "test_user_002"
  }'
```

**预期响应**:
```json
{
  "order_id": "wx_order_...",
  "code_url": "weixin://wxpay/bizpayurl?pr=...",
  "amount": 29900,
  "plan_id": "pro"
}
```

---

#### 8.2 测试 Stripe Checkout API ✅ 推荐
**状态**: ⏳ 待测试

```bash
curl -X POST https://your-project.supabase.co/functions/v1/stripe-checkout-create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29900,
    "description": "Pro Plan - Monthly",
    "planId": "pro",
    "userId": "test_user_002",
    "successUrl": "http://localhost:3000/payment-success",
    "cancelUrl": "http://localhost:3000/payment-cancel"
  }'
```

**预期响应**:
```json
{
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_...",
  "amount": 29900,
  "plan_id": "pro"
}
```

---

## 🎯 准备完成清单

### 必需项（必需完成）
- [ ] Supabase 账户注册
- [ ] Supabase 项目创建
- [ ] Stripe 账户注册
- [ ] Stripe API 密钥获取
- [ ] 环境变量配置（.env.local）
- [ ] Supabase CLI 安装和登录
- [ ] 数据库迁移部署
- [ ] 所有 Edge Functions 部署
- [ ] Webhook 配置

### 推荐项（建议完成）
- [ ] 创建测试数据
- [ ] API 端点测试
- [ ] Webhook 测试
- [ ] 前端代码验证

### 可选项（按需）
- [ ] 微信支付商户注册（如果需要微信支付）

---

## 📝 关键信息记录表

### Supabase 配置
```
项目 URL: ___________________________
Project ID: __________________________
Anon Key: ____________________________
Service Role Key: ____________________
```

### Stripe 配置
```
Publishable Key: pk_test_______________
Secret Key: sk_test____________________
Webhook Secret: whsec__________________
```

### Supabase Edge Functions URLs
```
WeChat Pay: https://____________________.supabase.co/functions/v1/wechat-pay-create
Stripe: https://______________________.supabase.co/functions/v1/stripe-checkout-create
Webhook: https://_____________________.supabase.co/functions/v1/payment-webhook
```

---

## ⚠️ 常见问题和解决方案

### 问题 1: 部署 Edge Function 失败
**症状**: `Error: failed to deploy function`

**解决方案**:
```bash
# 1. 检查网络连接
# 2. 确认已登录: supabase login
# 3. 确认项目已链接: supabase link
# 4. 重试部署: supabase functions deploy function-name --no-verify-jwt
```

### 问题 2: 数据库迁移失败
**症状**: `Error applying migration`

**解决方案**:
```bash
# 1. 检查 SQL 语法
# 2. 手动在 Supabase Dashboard SQL Editor 中执行
# 3. 查看具体错误信息
# 4. 修复后重新运行: supabase db push
```

### 问题 3: Webhook 不工作
**症状**: Stripe 支付成功但用户层级未更新

**解决方案**:
```bash
# 1. 检查 Webhook URL 是否正确
# 2. 检查 Webhook Secret 是否配置
# 3. 在 Stripe Dashboard 中查看 Webhook 日志
# 4. 检查 Supabase Functions 日志
# 5. 检查数据库 permissions (RLS policies)
```

---

## 🎊 准备就绪确认

当所有必需项都完成（打勾），并且:
- ✅ 所有 API 测试通过
- ✅ 数据库表已创建
- ✅ Edge Functions 已部署
- ✅ Webhook 已配置

**那么恭喜你！系统已准备就绪，可以开始第三阶段前端支付集成！**

---

## 🚀 下一步：第三阶段预览

一旦完成以上准备工作，我们将开始：

### Phase 3: 前端支付集成（预计 3-5天）

**任务列表**:
1. 改造 PaymentButton 组件
   - 集成真实支付API
   - 二维码显示
   - 支付状态轮询

2. 支付状态管理
   - paymentManager.js
   - 实时状态更新
   - 错误处理

3. 订阅同步
   - 自动更新用户层级
   - 配额重置
   - 订阅续期处理

**目标**: 完成真实支付流程，用户可以通过 WeChat Pay 和 Stripe 购买订阅

---

*文档版本: 1.0*
*最后更新: 2026-02-03*
