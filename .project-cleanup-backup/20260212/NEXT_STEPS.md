# 🎯 下一步操作指南

## ✅ 当前状态

**已完成**:
- ✓ Supabase 和 Stripe 账户注册
- ✓ 获取所有 API 密钥
- ✓ 环境变量已配置

**需要完成**:
- ☐ Supabase CLI 验证
- ☐ CLI 登录
- ☐ 部署数据库和 Edge Functions
- ☐ 配置 Stripe Webhook

---

## 🚀 立即开始

### 步骤 1: 验证 Supabase CLI 安装

**你刚才运行了**: `brew install supabase/supabase/supabase`

**现在请验证安装**:

打开新的终端窗口（重要！）并运行:

```bash
supabase --version
```

#### 情况 A: 成功（看到版本号）
```bash
# 输出示例:
1.XXX.X
```
✅ **完美！** 继续步骤 2

#### 情况 B: 未找到命令
```bash
# 输出:
-bash: supabase: command not found
```

**解决方案**:

```bash
# 方法 1: 添加 Homebrew 路径
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 方法 2: 或重新安装
brew reinstall supabase/tap/supabase

# 方法 3: 直接链接
sudo ln -s /opt/homebrew/bin/supabase /usr/local/bin/supabase
```

**验证修复**:
```bash
which supabase
# 应该输出: /opt/homebrew/bin/supabase

supabase --version
# 应该输出版本号
```

---

### 步骤 2: 登录 Supabase CLI

**运行**:

```bash
supabase login
```

**你会看到**:
```
You will be taken to your web browser to complete the login process.
Press Enter to continue...
```

**操作**: 按 **Enter** 键

**浏览器会自动打开**，显示 Supabase 的授权页面

**在浏览器中**:
1. 选择你的登录方式（GitHub / Google）
2. 点击授权按钮
3. 等待页面显示 "Login successful!"

**返回终端**:
```
Enter your access token: [自动填充]
Login successful!
```

✅ **完成！**

---

### 步骤 3: 运行一键部署脚本

**首先，使脚本可执行**:

```bash
cd /Users/ganbin/venture-evaluation
chmod +x deploy.sh
```

**然后运行部署**:

```bash
./deploy.sh
```

**你会看到详细的部署过程**:

```
🚀 Supabase 部署脚本
═══════════════════════════════════

✅ 环境变量检查通过！
   • Supabase URL: https://jyjnadjvhoeyudltvpfy.supabase.co
   • Stripe Publishable Key: pk_test_51Swj... configured

📦 部署数据库...
   • 检查迁移文件... found 3 files
   • Applying migration 001_create_subscriptions_table.sql... ✓
   • Applying migration 002_create_payments_table.sql... ✓
   • Applying migration 003_create_usage_limits_table.sql... ✓
   ✅ 数据库部署成功！

⚡ 部署 Edge Functions...
   • 部署 wechat-pay-create... ✓
     URL: https://jyjnadjvhoeyudltvpfy.functions.supabase.co/wechat-pay-create
   • 部署 stripe-checkout-create... ✓
     URL: https://jyjnadjvhoeyudltvpfy.functions.supabase.co/stripe-checkout-create
   • 部署 payment-webhook... ✓
     URL: https://jyjnadjvhoeyudltvpfy.functions.supabase.co/payment-webhook
   ✅ 所有函数部署成功！

🧪 测试 API 端点...
   • 测试 WeChat Pay... ✓ (200 OK)
   • 测试 Stripe Checkout... ✓ (200 OK)
   • 测试 Payment Webhook... ✓ (200 OK)
   ✅ 所有测试通过！

═══════════════════════════════════
✅ 部署完成总结:
   • 数据库表: 3/3 deployed
   • Edge Functions: 3/3 deployed
   • API 测试: 3/3 passed

   系统已准备就绪！
═══════════════════════════════════

下一步: 配置 Stripe Webhook
查看文档: stripe-webhook-setup.md
```

**预计用时**: 10-15 分钟

---

### 步骤 4: 配置 Stripe Webhook（必需）

**为什么必须配置 Webhook？**

Stripe 需要通过 Webhook 通知你的应用支付状态：
- 支付成功 → 升级用户等级
- 支付失败 → 记录错误日志

**操作步骤**:

**在浏览器中**:

1. **登录 Stripe Dashboard**
   - 访问: https://dashboard.stripe.com/webhooks

2. **添加 Webhook Endpoint**
   - 点击 "Add endpoint"

3. **填写 Endpoint URL**
   ```
   https://jyjnadjvhoeyudltvpfy.supabase.co/functions/v1/payment-webhook
   ```

4. **选择事件类型**
   勾选以下事件:
   - [ ] `payment_intent.succeeded`
   - [ ] `payment_intent.payment_failed`
   - [ ] `checkout.session.completed`

5. **添加并获取 Secret**
   - 点击 "Add endpoint"
   - 在列表中找到新创建的 webhook
   - 点击 "Click to reveal signing secret"
   - 复制以 `whsec_` 开头的密钥

6. **添加 Secret 到环境变量**

```bash
# 打开 .env.local
nano /Users/ganbin/venture-evaluation/.env.local
```

在文件中找到:
```bash
# Stripe Webhook Secret (待配置)
# STRIPE_WEBHOOK_SECRET=
```

修改为:
```bash
# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_heresdfasdfasdfasdfasdfasdfasdfsdfasdf`
```

**保存文件**: `Ctrl+O` (Mac: `Cmd+O`)，然后 `Ctrl+X` (Mac: `Cmd+X`)

**验证 Webhook 配置**:

在终端运行:
```bash
cd /Users/ganbin/venture-evaluation
./test-webhook.sh
```

如果看到:
```
✅ Webhook test successful!
✅ Webhook signature verification passed!
```

✅ **配置成功！**

---

## 📋 快速检查清单

完成所有步骤后，检查:

```
部署状态:
☐ 1. Supabase CLI 安装并验证 ✓
☐ 2. CLI 登录成功 ✓
☐ 3. 运行 ./deploy.sh 完成 ✓
☐ 4. 数据库表已创建 ✓
☐ 5. Edge Functions 已部署 ✓
☐ 6. API 测试通过 ✓
☐ 7. Stripe Webhook 已配置 ✓
☐ 8. Webhook Secret 已添加到 .env.local ✓

系统状态: ☐ 全部完成 ☐ 部分完成
```

---

## ⚠️ 常见问题

### Q1: `./deploy.sh: Permission denied`

**解决**:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Q2: `Error: project not found`

**解决**:
```bash
# 重新链接项目
supabase link --project-ref jyjnadjvhoeyudltvpfy

# 再次运行部署
./deploy.sh
```

### Q3: 部署成功但 API 测试失败

**解决**:
```bash
# 检查函数日志
supabase functions logs --project-ref jyjnadjvhoeyudltvpfy --function-name wechat-pay-create --tail

# 重新部署特定函数
supabase functions deploy wechat-pay-create --no-verify-jwt
```

---

## 🎯 下一步（部署后）

完成所有部署后，进入 **Phase 3**:

查看文档: `DEPLOYMENT_SUMMARY.md` (Phase 3 预览)

主要任务:
- 改造 PaymentButton 组件
- 集成真实支付流程
- 实现二维码支付显示
- 支付状态管理

---

## 📞 需要帮助？

如果在部署过程中遇到问题：

1. **截图错误信息**
2. **完整输出日志**（运行 `./deploy.sh 2>&1 | tee deploy.log`）
3. **告诉我卡住的位置**

准备以上信息，我会提供针对性的解决方案！

---

**准备好了吗？** 开始步骤 1: 验证 Supabase CLI！
