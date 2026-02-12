# 🚀 手动执行安装步骤

**日期**: 2026-02-12
**当前任务**: 完成Supabase CLI和后端部署

---

## 📋 需要手动执行的步骤

由于需要管理员权限和终端交互，请**手动执行**以下步骤：

---

### **步骤1: 安装Homebrew（约10分钟）**

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**操作说明**:
1. 打开新的终端窗口（重要！）
2. 粘贴上面的命令
3. 按Enter键执行
4. 输入你的Mac密码（输入时不会显示，这是正常的）
5. 等待安装完成（约10分钟）

**验证安装**:
```bash
brew --version
```
应该显示版本号（如: Homebrew 4.x.x）

**如果失败，尝试**:
```bash
# 确保命令行工具已安装
xcode-select --install

# 再次运行Homebrew安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

### **步骤2: 升级Node.js到20.x（约15分钟）**

#### **方式A: 使用nvm（推荐）**

```bash
# 1. 安装nvm（Node Version Manager）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. 关闭并重新打开终端，或运行：
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 3. 安装Node.js 20.x
nvm install 20
nvm use 20

# 4. 验证版本
node --version
# 应该显示 v20.x.x
```

#### **方式B: 使用Homebrew**

```bash
# 1. 安装Node.js 20
brew install node@20

# 2. 链接到PATH
echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 3. 验证版本
node --version
# 应该显示 v20.x.x
```

**验证升级**:
```bash
node --version  # 应该显示 v20.x.x
npm --version    # 应该显示 10.x.x
```

---

### **步骤3: 安装Supabase CLI（约5分钟）**

```bash
brew install supabase/tap/supabase
```

**验证安装**:
```bash
supabase --version
# 应该显示版本号（如: 1.123.4）
```

**如果失败**:
```bash
# 尝试更新Homebrew
brew update

# 重新安装
brew install supabase/tap/supabase
```

---

### **步骤4: 登录Supabase（约5分钟）**

```bash
supabase login
```

**操作说明**:
1. 运行上面的命令
2. 按Enter键打开浏览器
3. 选择登录方式（GitHub或Google）
4. 点击授权按钮
5. 等待显示 "Login successful!"

**验证登录**:
```bash
supabase projects list
# 应该显示你的Supabase项目列表
```

---

### **步骤5: 部署数据库（约5分钟）**

```bash
cd /Users/ganbin/venture-evaluation

# 部署所有数据库migration
supabase db push
```

**预期输出**:
```
✓ Applied migration 001_create_subscriptions_table.sql
✓ Applied migration 002_create_payments_table.sql
✓ Applied migration 003_create_usage_limits_table.sql
```

**验证部署**:
1. 访问: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/tables
2. 确认看到3个新表: subscriptions, payments, usage_limits

---

### **步骤6: 部署Edge Functions（约10分钟）**

#### **部署Stripe Checkout函数**

```bash
supabase functions deploy stripe-checkout-create --no-verify-jwt \
  --import-map ./supabase/functions/import_map.json \
  -e SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9 \
  -e STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5
```

预期输出:
```
✓ Deployed Function: stripe-checkout-create
URL: https://jyjnadjvhoeyudltvpfy.functions.supabase.co/stripe-checkout-create
```

#### **部署Payment Webhook函数**

```bash
supabase functions deploy payment-webhook --no-verify-jwt \
  --import-map ./supabase/functions/import_map.json \
  -e SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9 \
  -e STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5
```

预期输出:
```
✓ Deployed Function: payment-webhook
URL: https://jyjnadjvhoeyudltvpfy.functions.supabase.co/payment-webhook
```

**验证部署**:
1. 访问: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/functions
2. 确认看到2个函数: stripe-checkout-create, payment-webhook

---

### **步骤7: 配置Stripe Webhook（约10分钟）**

1. **访问Stripe Dashboard**
   ```
   https://dashboard.stripe.com/webhooks
   ```

2. **添加新的Webhook Endpoint**
   - 点击 "Add endpoint"
   - URL: `https://jyjnadjvhoeyudltvpfy.functions.supabase.co/payment-webhook`
   - Description: `Praxis Partners Payment Webhook`

3. **选择事件类型**
   勾选以下事件:
   - [ ] `payment_intent.succeeded`
   - [ ] `payment_intent.payment_failed`
   - [ ] `checkout.session.completed`

4. **添加Endpoint**
   - 点击 "Add endpoint"

5. **获取Webhook Secret**
   - 在列表中找到新创建的endpoint
   - 点击 "Click to reveal signing secret`
   - 复制以 `whsec_` 开头的密钥

6. **添加到项目配置**
   - 编辑文件: `/Users/ganbin/venture-evaluation/.env.local`
   - 找到行: `# STRIPE_WEBHOOK_SECRET=`
   - 修改为: `STRIPE_WEBHOOK_SECRET=whsec_your_copied_secret`

---

### **步骤8: 切换到生产模式（约2分钟）**

```bash
# 1. 编辑环境变量
# 打开 /Users/ganbin/venture-evaluation/.env.local

# 找到并修改:
VITE_PAYMENT_MOCK_MODE=false  # 从 true 改为 false

# 2. 重启开发服务器
# 停止当前服务器: Ctrl+C
# 重新启动:
npm run dev
```

**验证切换**:
1. 打开浏览器: http://localhost:3000/
2. 打开开发者工具 (F12)
3. 在Console中输入: `console.log(import.meta.env.VITE_PAYMENT_MOCK_MODE)`
4. 确认输出: `false`

---

### **步骤9: 测试支付流程（约10分钟）**

#### **测试1: 测试Stripe Checkout**

```bash
curl -X POST https://jyjnadjvhoeyudltvpfy.functions.supabase.co/stripe-checkout-create \
  -H "Authorization: Bearer sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G" \
  -H "Content-Type: application/json" \
  -d '{"amount": 299, "description": "Test Payment", "planId": "pro"}'
```

预期返回:
```json
{
  "session_id": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

#### **测试2: 浏览器测试完整流程**

1. **访问应用**
   ```
   http://localhost:3000/
   ```

2. **触发支付**
   - 确保用户等级为 free
   - 点击 "升级到Pro" 或 "升级到Premium"
   - 点击 "订阅Pro套餐" 或 "订阅Premium套餐"

3. **在Stripe Checkout页面**
   - 使用测试卡号: `4242 4242 4242 4242`
   - 任意未来日期（如: 12/34）
   - 任意CVC（如: 123）
   - 任意邮编
   - 点击支付

4. **验证结果**
   - [ ] 成功支付后重定向回应用
   - [ ] 用户等级更新为 pro/premium
   - [ ] 数据库中新增订阅记录
   - [ ] QuotaStatus显示正确的额度

5. **验证Webhook**
   - 访问: https://dashboard.stripe.com/test/events
   - 找到最近的 payment_intent.succeeded 事件
   - 确认 Webhook 通知状态为 200 OK

---

## ✅ 验证清单

部署完成后，确认以下项目:

### 基础设施
- [ ] Supabase CLI已安装（`supabase --version` 显示版本）
- [ ] Supabase CLI已登录（`supabase projects list` 显示项目）
- [ ] Node.js版本为20.x+（`node --version`）
- [ ] Homebrew已安装（`brew --version`）

### 数据库
- [ ] 3个表已创建: subscriptions, payments, usage_limits
- [ ] 表结构正确（可访问Dashboard查看）

### Edge Functions
- [ ] stripe-checkout-create 已部署
- [ ] payment-webhook 已部署
- [ ] 函数可访问（通过Dashboard测试）

### Stripe配置
- [ ] Webhook endpoint已创建
- [ ] Webhook Secret已配置到.env.local
- [ ] 事件类型已正确选择（3个）

### 应用配置
- [ ] VITE_PAYMENT_MOCK_MODE=false
- [ ] 服务器已重启
- [ ] Console.log显示false

### 功能测试
- [ ] 支付按钮可正常工作
- [ ] Stripe Checkout页面可访问
- [ ] 支付成功可跳转
- [ ] Webhook接收成功
- [ ] 用户等级更新正确
- [ ] 支付记录写入数据库

---

## 🚨 故障排查

### **问题1: Homebrew安装失败**
```bash
# 检查Xcode命令行工具
xcode-select --install

# 如果已安装，重置路径
sudo xcode-select --reset

# 重新尝试Homebrew安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### **问题2: Node.js版本仍显示旧版本**
```bash
# 检查当前使用的Node.js版本
which node

# 如果显示旧路径，更新.zshrc
echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 或使用nvm
nvm use 20
nvm alias default 20
```

### **问题3: Supabase CLI登录失败**
```bash
# 清除旧凭据
rm -rf ~/.supabase/

# 重新登录
supabase login
```

### **问题4: Edge Functions部署失败**
```bash
# 检查环境变量
export SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9
export STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5

# 强制重新部署
supabase functions deploy stripe-checkout-create --no-verify-jwt --force
```

### **问题5: Webhook测试失败**
```bash
# 检查Webhook日志
supabase functions logs --project-ref jyjnadjvhoeyudltvpfy --function-name payment-webhook --tail

# 检查环境变量
supabase secrets list --project-ref jyjnadjvhoeyudltvpfy

# 确保STRIPE_WEBHOOK_SECRET已设置
```

---

## 📞 需要帮助？

如果在执行上述步骤时遇到任何问题：

### **截图获取帮助**:
在Discord/邮件中提供：
1. 完整的错误信息截图
2. 你正在执行的命令
3. 当前所在的步骤
4. 系统环境信息

### **日志收集**:
```bash
# 收集部署日志
supabase functions deploy [function-name] &> deploy.log

cat deploy.log
```

### **快速联系**:
- 邮箱: support@praxis-partners.com
- Discord: https://discord.gg/praxis-partners

**准备好开始了吗？**

从**步骤1**开始，一步一步执行！每完成一步，请在这里打勾确认。如果遇到问题，随时向我报告错误信息，我会提供针对性的解决方案！

---

**文档版本**: 1.0
**创建时间**: 2026-02-12
**预估总时间**: 50-60分钟
**维护人**: Praxis Partners Team
