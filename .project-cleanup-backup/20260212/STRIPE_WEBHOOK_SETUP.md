# Stripe Webhook 配置指南
# Stripe Webhook Configuration Guide

**⚠️ 关键安全配置 | Critical Security Configuration**

本指南将帮助您配置 Stripe Webhook，这是我们支付系统正常运行所必需的关键步骤。
This guide will help you configure Stripe Webhook, a critical step for our payment system to function properly.

## 配置步骤
## Configuration Steps

### 步骤 1: 登录 Stripe 仪表板
### Step 1: Login to Stripe Dashboard

访问: https://dashboard.stripe.com/test/webhooks
Website: https://dashboard.stripe.com/test/webhooks

### 步骤 2: 添加新的 Webhook 端点
### Step 2: Add New Webhook Endpoint

点击 "Add endpoint" 按钮
Click the "Add endpoint" button

**Endpoint URL:**
```
https://jyjnadjvhoeyudltvpfy.functions.supabase.co/payment-webhook
```

### 步骤 3: 选择要监听的事件
### Step 3: Select Events to Listen For

监听以下 Stripe 事件：
Select these Stripe events:

- ✅ `checkout.session.completed`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

### 步骤 4: 获取 Webhook 密钥
### Step 4: Get Webhook Secret

创建 Webhook 后，Stripe 会提供一个密钥：
After creating the webhook, Stripe will provide a signing secret:

示例格式 | Example format:
```
whsec_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### 步骤 5: 添加到环境变量
### Step 5: Add to Environment Variables

将其添加到您的 `.env.local` 文件中：
Add this to your `.env.local` file:

```bash
# 替换为您实际的 Webhook 密钥
# Replace with your actual webhook secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Webhook 端点测试
## Webhook Endpoint Testing

### 步骤 1: 使用 Stripe CLI 进行本地测试
### Step 1: Test Locally with Stripe CLI

```bash
# 安装 Stripe CLI（如果未安装）
# Install Stripe CLI (if not installed)
brew install stripe/stripe-cli/stripe

# 登录 Stripe CLI
# Login to Stripe CLI
stripe login

# 转发 Webhook 到本地（测试用）
# Forward webhooks to local (for testing)
stripe listen --forward-to http://localhost:54321/functions/v1/payment-webhook

# 在另一个终端中测试 Webhook
# Test webhook in another terminal
stripe trigger checkout.session.completed
```

### 步骤 2: 在 Stripe 仪表板中测试
### Step 2: Test in Stripe Dashboard

1. 在 Webhook 设置页面，点击您的端点
2. 点击 "Send test webhook"
3. 选择事件类型
4. 发送测试

### 步骤 3: 验证 Webhook 功能
### Step 3: Verify Webhook Functionality

测试期望的响应：
Expected response:

```json
{
  "received": true
}
```

## Webhook 事件处理逻辑
## Webhook Event Handling Logic

### checkout.session.completed
- **意图**: 完成支付会话
- **意图**: Complete payment session
- **操作**: 更新订阅状态为 'active'

### invoice.payment_succeeded
- **意图**: 支付成功
- **意图**: Payment successful
- **操作**: 记录付款并更新订阅

### invoice.payment_failed
- **意图**: 支付失败
- **意图**: Payment failed
- **操作**: 发送失败通知并更新订阅状态

### customer.subscription.updated
- **意图**: 订阅变更
- **意图**: Subscription changed
- **操作**: 更新订阅详情和配额

### customer.subscription.deleted
- **意图**: 订阅取消
- **意图**: Subscription canceled
- **操作**: 降级到免费计划并更新配额

## 安全最佳实践
## Security Best Practices

1. **验证 Webhook 签名**

  总是验证 Stripe 签名以确保请求来自 Stripe
  Always verify Stripe signatures to ensure requests are from Stripe

2. **使用环境变量**

  不要硬编码密钥
  Never hardcode secrets

3. **限制 Webhook 端点访问**

  仅接受来自 Stripe IP 范围的请求（生产环境）
  Only accept requests from Stripe IP ranges (production)

4. **记录所有 Webhook 事件**

  保留 Webhook 日志以进行故障排除
  Keep webhook logs for troubleshooting

## 故障排除
## Troubleshooting

### Webhook 未被触发
### Webhook Not Triggered

1. 检查端点 URL 是否正确
2. 验证事件选择是否正确
3. 查看 Dashboard 中的 Webhook 日志
4. 检查 Edge Function 日志：`supabase functions logs --function-name=payment-webhook`

### 签名验证失败
### Signature Verification Failed

1. 检查 Webhook 密钥是否正确
2. 验证密钥没有额外的空格
3. 确保使用正确的密钥格式（以 whsec_ 开头）

### Webhook 超时
### Webhook Timeouts

1. Edge Functions 超过 30 秒会自动超时
2. 优化函数执行时间
3. 异步处理耗时操作

## 相关文档
## Related Documentation

- [Stripe Webhook 文档](https://docs.stripe.com/webhooks)
- [Stripe Webhook Best Practices](https://docs.stripe.com/webhooks/best-practices)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**上次更新 | Last Updated:** 2026-02-03
