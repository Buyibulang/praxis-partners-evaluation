# 🚀 后端部署执行清单

**创建日期**: 2026-02-12
**项目**: Praxis Partners 创业评估工具
**目标**: 部署后端支付系统
**当前状态**: 待开始

---

## 📋 部署步骤清单

### **步骤1: 安装Supabase CLI**
- [ ] **方式选择** (选择一种):\n   - [ ] 方式A: Homebrew (macOS)\n     ```bash\n     brew install supabase/tap/supabase\n     ```\n   - [ ] 方式B: Scoop (Windows)\n     ```bash\n     scoop bucket add supabase https://github.com/supabase/scoop-bucket.git\n     scoop install supabase\n     ```\n   - [ ] 方式C: 直接下载\n     - 访问: https://github.com/supabase/cli/releases\n     - 下载适合你系统的版本\n     - 解压并添加到PATH

- [ ] **验证安装**\n  ```bash\n  supabase --version\n  ```\n  应该显示版本号（如: 1.xxx.x）

---

### **步骤2: 登录Supabase CLI**
- [ ] **运行登录命令**\n  ```bash\n  supabase login\n  ```

- [ ] **浏览器授权**\n  - [ ] 按Enter键打开浏览器\n  - [ ] 选择登录方式（GitHub/Google）\n  - [ ] 点击授权\n  - [ ] 等待"Login successful!"

- [ ] **验证登录**\n  ```bash\n  supabase projects list\n  ```\n  应该显示你的项目列表

---

### **步骤3: 部署数据库**
- [ ] **方式选择** (选择一种):\n   - [ ] 方式A: 使用CLI\n     ```bash\n     supabase db push\n     ```

   - [ ] 方式B: 使用Dashboard (推荐)\n     1. 访问: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/sql\n     2. 点击 "SQL Editor"\n     3. 依次运行以下文件:

- [ ] **运行001_create_subscriptions_table.sql**
  - [ ] 打开文件: `supabase/migrations/001_create_subscriptions_table.sql`\n  - [ ] 复制全部内容\n  - [ ] 粘贴到SQL Editor\n  - [ ] 点击 "Run"\n  - [ ] 确认没有错误

- [ ] **运行002_create_payments_table.sql**
  - [ ] 打开文件: `supabase/migrations/002_create_payments_table.sql`\n  - [ ] 复制全部内容\n  - [ ] 粘贴到SQL Editor\n  - [ ] 点击 "Run"\n  - [ ] 确认没有错误

- [ ] **运行003_create_usage_limits_table.sql**
  - [ ] 打开文件: `supabase/migrations/003_create_usage_limits_table.sql`\n  - [ ] 复制全部内容\n  - [ ] 粘贴到SQL Editor\n  - [ ] 点击 "Run"\n  - [ ] 确认没有错误

- [ ] **验证数据库表**
  - [ ] 访问: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/tables\n  - [ ] 确认出现3个表:\n    - [ ] subscriptions\n    - [ ] payments\n    - [ ] usage_limits

---

### **步骤4: 部署Edge Functions**

#### **Function 1: stripe-checkout-create**
- [ ] **检查函数文件**\n  - [ ] 文件存在: `supabase/functions/stripe-checkout-create/index.js`

- [ ] **部署命令**\n  ```bash\n  supabase functions deploy stripe-checkout-create --no-verify-jwt \\\n    --import-map ./supabase/functions/import_map.json \\\n    -e SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co \\\n    -e SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9 \\\n    -e STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5\n  ```\n  - [ ] 等待部署完成\n  - [ ] 确认没有错误\n
- [ ] **验证部署**
  - [ ] 访问: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/functions\n  - [ ] 确认 `stripe-checkout-create` 出现在列表中

#### **Function 2: payment-webhook**
- [ ] **检查函数文件**\n  - [ ] 文件存在: `supabase/functions/payment-webhook/index.js`

- [ ] **部署命令**\n  ```bash\n  supabase functions deploy payment-webhook --no-verify-jwt \\\n    --import-map ./supabase/functions/import_map.json \\\n    -e SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co \\\n    -e SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9 \\\n    -e STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5\n  ```\n  - [ ] 等待部署完成\n  - [ ] 确认没有错误\n
- [ ] **验证部署**
  - [ ] 访问: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/functions\n  - [ ] 确认 `payment-webhook` 出现在列表中

#### **Function 3: claude-analysis (可选)**
- [ ] **检查函数文件**\n  - [ ] 文件存在: `supabase/functions/claude-analysis/index.js`

- [ ] **部署命令**\n  ```bash\n  supabase functions deploy claude-analysis --no-verify-jwt \\\n    -e SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co \\\n    -e ANTHROPIC_API_KEY=your_anthropic_api_key\n  ```\n  - [ ] 等待部署完成\n  - [ ] 确认没有错误\n
- [ ] **验证部署**
  - [ ] 访问: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/functions\n  - [ ] 确认 `claude-analysis` 出现在列表中

---

### **步骤5: 配置Stripe Webhook**

- [ ] **访问Stripe Dashboard**
  - [ ] 登录: https://dashboard.stripe.com/webhooks

- [ ] **添加Webhook Endpoint**
  - [ ] 点击 "Add endpoint"

- [ ] **配置Endpoint**
  - [ ] URL: `https://jyjnadjvhoeyudltvpfy.functions.supabase.co/payment-webhook`
  - [ ] Description: `Praxis Partners Payment Webhook`

- [ ] **选择事件类型**
  - [ ] 勾选: `payment_intent.succeeded`
  - [ ] 勾选: `payment_intent.payment_failed`
  - [ ] 勾选: `checkout.session.completed`
  - [ ] 点击 "Add endpoint"

- [ ] **获取Webhook Secret**
  - [ ] 在Webhook列表中找到新创建的endpoint
  - [ ] 点击 "Click to reveal signing secret"
  - [ ] 复制以 `whsec_` 开头的密钥
  - [ ] **临时保存**，下一步使用

- [ ] **添加到环境变量**
  - [ ] 编辑文件: `.env.local`
  - [ ] 找到行: `# STRIPE_WEBHOOK_SECRET=`
  - [ ] 修改为: `STRIPE_WEBHOOK_SECRET=whsec_your_copied_secret`

---

### **步骤6: 测试API端点**

- [ ] **测试Stripe Checkout**
  - [ ] 运行命令:\n    ```bash\n    curl -X POST https://jyjnadjvhoeyudltvpfy.functions.supabase.co/stripe-checkout-create \\\n      -H "Authorization: Bearer sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G" \\\n      -H "Content-Type: application/json" \\\n      -d '{"amount": 299, "description": "Test Payment", "planId": "pro"}'\n    ```
  - [ ] 预期返回: 包含 `session_id` 的JSON
  - [ ] 确认HTTP状态码: 200

- [ ] **测试Payment Webhook**
  - [ ] 运行命令:\n    ```bash\n    curl -X POST https://jyjnadjvhoeyudltvpfy.functions.supabase.co/payment-webhook \\\n      -H "Authorization: Bearer sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G" \\\n      -H "Content-Type: application/json" \\\n      -d '{"type": "payment.succeeded", "data": {"subscriptionId": "test"}}'\n    ```
  - [ ] 预期返回: `received` 或成功消息
  - [ ] 确认HTTP状态码: 200

---

### **步骤7: 禁用模拟模式**

- [ ] **编辑环境变量**
  - [ ] 打开文件: `.env.local`
  - [ ] 找到: `VITE_PAYMENT_MOCK_MODE=true`
  - [ ] 修改为: `VITE_PAYMENT_MOCK_MODE=false`

- [ ] **重启开发服务器**
  - [ ] 停止当前服务器: `Ctrl+C`
  - [ ] 重新启动: `npm run dev`

- [ ] **验证配置**
  - [ ] 打开浏览器: http://localhost:3000/
  - [ ] 打开浏览器的开发者工具
  - [ ] 在Console中输入: `console.log(import.meta.env.VITE_PAYMENT_MOCK_MODE)`
  - [ ] 确认输出: `false`

---

### **步骤8: 完整支付流程测试**

- [ ] **测试支付按钮**
  - [ ] 访问: http://localhost:3000/
  - [ ] 确保设置为免费版用户
  - [ ] 点击 "升级到Pro" 或 "升级到Premium"
  - [ ] 点击 "订阅Pro套餐" 或 "订阅Premium套餐"
  - [ ] 确认跳转到Stripe Checkout页面

- [ ] **测试支付成功**
  - [ ] 在Stripe Checkout页面:
    - [ ] 使用测试卡号: `4242 4242 4242 4242`
    - [ ] 任意未来日期
    - [ ] 任意CVC
    - [ ] 任意邮编
  - [ ] 点击支付
  - [ ] 确认重定向回应用
  - [ ] 确认用户等级更新

- [ ] **验证Webhook处理**
  - [ ] 访问: https://dashboard.stripe.com/test/events
  - [ ] 找到最新的成功支付事件
  - [ ] 确认Webhook通知已发送
  - [ ] 确认状态: 200 (成功)

---

## 🎯 部署验证清单

### ✅ 基础设施验证
- [ ] 所有3个数据库表已创建
- [ ] 所有Edge Functions已部署
- [ ] Stripe Webhook已配置
- [ ] Webhook Secret已添加到.env.local
- [ ] VITE_PAYMENT_MOCK_MODE=false

### ✅ 功能验证
- [ ] 支付按钮正常工作
- [ ] Stripe Checkout页面可访问
- [ ] 支付成功可跳转
- [ ] Webhook接收成功
- [ ] 用户等级更新正确
- [ ] 支付记录写入数据库

---

## 📊 测试结果记录

### **数据库测试**
- **测试日期**: __________
- **执行人**: __________
- **测试结果**: ☐ 通过 ☐ 失败
- **备注**: __________

### **Edge Functions测试**
- **测试日期**: __________
- **执行人**: __________
- **测试结果**: ☐ 通过 ☐ 失败
- **备注**: __________

### **支付流程测试**
- **测试日期**: __________
- **执行人**: __________
- **测试结果**: ☐ 通过 ☐ 失败
- **备注**: __________

---

## 🚨 故障排查

### **问题1: Supabase CLI 找不到**
```bash
# 解决：添加Homebrew路径到PATH\necho 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc\nsource ~/.zshrc\n```

### **问题2: 部署函数失败**
```bash
# 检查错误日志\nsupabase functions logs --project-ref jyjnadjvhoeyudltvpfy --function-name stripe-checkout-create --tail\n
# 重新部署\nsupabase functions deploy stripe-checkout-create --no-verify-jwt --force\n```

### **问题3: Webhook未触发**
```bash
# 检查：\n1. Stripe Dashboard中的Webhook URL是否正确\n2. .env.local中的STRIPE_WEBHOOK_SECRET是否配置\n3. 函数logs中是否有错误\n```

---

## 📞 需要帮助？

如果遇到问题：

1. **查看日志**: `supabase functions logs --project-ref jyjnadjvhoeyudltvpfy --function-name [function-name] --tail`
2. **检查配置**: 确认.env.local中的所有密钥正确
3. **联系支持**: support@praxis-partners.com

**准备好开始了吗？**

从步骤1开始，一步一步来！每完成一步打勾确认。

---

**文档版本**: 1.0
**最后更新**: 2026-02-12
**维护人**: Praxis Partners Team
