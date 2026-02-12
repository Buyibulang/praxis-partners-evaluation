# 🚀 Praxis Partners 创业评估工具 - 部署指南

**一键部署系统 | One-Click Deployment System**

## 📋 部署前准备 | Pre-Deployment Checklist

Your project is ready for deployment! Here's what you have and what needs to be done:

### ✅ 已准备就绪 | Already Available
- **Supabase 数据库**: 完全设置并可部署
- **Supabase 凭证**: URL, ANON KEY, SERVICE ROLE KEY
- **Stripe 凭证**: Publishable Key 和 Secret Key
- **Edge Functions**: 3 个函数已完成并准备部署

### ⚠️ 需要您完成 | Needs Your Action
- **安装 Supabase CLI**: 用于部署边缘函数
- **登录 Supabase**: 使用 `supabase login` 命令

### 🔧 我将为您自动化 | Automated For You
- ✓ 数据库迁移部署
- ✓ 所有 Edge Functions 部署
- ✓ API 端点测试
- ✓ 部署状态报告

---

## 🎯 快速开始 | Quick Start

### 第 1 步: 安装 Supabase CLI
### Step 1: Install Supabase CLI

```bash
# 使用 npm 安装（推荐）
# Install via npm (recommended)
npm install -g supabase

# 或者使用 Homebrew (macOS)
# Or use Homebrew (macOS)
brew install supabase/tap/supabase

# 验证安装
# Verify installation
supabase --version
```

### 第 2 步: 登录 Supabase
### Step 2: Login to Supabase

```bash
supabase login
```

系统会打开浏览器让您进行身份验证。请使用与您的 Supabase 项目关联的账户。
This will open a browser for authentication. Use the account associated with your Supabase project.

### 第 3 步: 运行一键部署
### Step 3: Run One-Click Deployment

```bash
# 确保您有执行权限
# Ensure you have execute permission
chmod +x deploy.sh

# 运行部署脚本
# Run deployment script
./deploy.sh
```

---

## 📚 详细文档 | Detailed Documentation

### 主部署指南 | Main Deployment Guide
- **`NEXT_STEPS.md`**: 完整的部署步骤和验证清单
- **`STRIPE_WEBHOOK_SETUP.md`**: 详细的 Stripe Webhook 配置指南
- **`ERROR_LOGS.md`**: 错误日志查看和故障排除指南

### 脚本说明 | Script Information
- **`deploy.sh`**: 主部署脚本，执行以下操作
  - 检查环境变量
  - 链接 Supabase 项目
  - 部署数据库迁移
  - 部署 3 个 Edge Functions
  - 测试 API 端点
  - 生成部署报告

---

## 🔐 您的凭证 | Your Credentials

### Supabase 配置 | Supabase Configuration
```
Project ID: jyjnadjvhoeyudltvpfy
URL: https://jyjnadjvhoeyudltvpfy.supabase.co
Anon Key: sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G
Service Role Key: sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9
Database Password: CuaiRWQgkO8UUbjJ
```

### Stripe 配置 | Stripe Configuration
```
Publishable Key: pk_test_51SwjZeQgFR6PoIOfDKPf29sEij87UzKNF6gSzRdRJr3AZEL7USaTTHqqEZKsXLOY79utnR363yG4lu6bISBtg8eV00wOopk6w8
Secret Key: sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5
Webhook Secret: (需要配置 - see STRIPE_WEBHOOK_SETUP.md)
```

---

## 🚀 预计部署时间 | Estimated Deployment Time

| 步骤 | 时间 | 状态 |
|------|------|------|
| Supabase CLI 安装 | 5 分钟 | 需要操作 |
| Supabase 登录 | 2 分钟 | 需要操作 |
| 自动化部署 | 10-15 分钟 | 自动完成 |
| Stripe Webhook 配置 | 10-20 分钟 | 配置完成后手动设置 |
| **总计** | **15-25 分钟（不含 Webhook）** |

---

## 🛠️ 部署的组件 | Components to Deploy

### 1. 数据库迁移 | Database Migrations
- ✅ `001_create_subscriptions_table.sql`
- ✅ `002_create_payments_table.sql`
- ✅ `003_create_usage_limits_table.sql`

### 2. Edge Functions
- ✅ **claude-analysis** - AI 深度分析
- ✅ **stripe-checkout-create** - Stripe 结账会话创建
- ✅ **payment-webhook** - 支付 Webhook 处理

---

## 🧪 部署后验证 | Post-Deployment Testing

脚本会自动测试以下端点：
The script will automatically test these endpoints:

1. **Claude Analysis**: `https://jyjnadjvhoeyudltvpfy.functions.supabase.co/claude-analysis`
2. **Stripe Checkout**: `https://jyjnadjvhoeyudltvpfy.functions.supabase.co/stripe-checkout-create`
3. **Payment Webhook**: `https://jyjnadjvhoeyudltvpfy.functions.supabase.co/payment-webhook`

---

## 🔧 下一步配置 | Next Configuration Steps

部署完成后，您需要：

1. **配置 Stripe Webhook**（必需）
   - 参见 `STRIPE_WEBHOOK_SETUP.md`
   - 预计时间: 10-20 分钟

2. **更新前端环境变量**
   - 确保 `.env.local` 中所有变量正确

3. **测试完整支付流程**
   - 创建测试订阅
   - 验证 Webhook 处理

---

## 🆘 需要帮助？| Need Help?

如果遇到问题，请检查以下资源：

1. **查看错误日志**: 参见 `ERROR_LOGS.md`
2. **验证环境变量**: 确保所有 API 密钥正确
3. **检查部署状态**: 使用 `supabase status`
4. **测试函数**: 使用 `supabase functions logs`

---

## 📊 部署报告 | Deployment Report

运行 `deploy.sh` 后，您将看到包含以下内容的完整报告：

- ✓ 已部署的函数列表
- ✓ API 端点 URL
- ✓ 数据库迁移状态
- ✓ 环境变量状态
- ⚠️ 需要注意的问题
- 📋 后续配置步骤

---

**准备好部署了吗？| Ready to deploy?**

1. 安装 Supabase CLI
2. 运行 `supabase login`
3. 执行 `./deploy.sh`

**祝您部署顺利！| Happy deploying!**

---

*Praxis Partners 团队 | Praxis Partners Team*
*部署指南 v1.0 | Deployment Guide v1.0*
