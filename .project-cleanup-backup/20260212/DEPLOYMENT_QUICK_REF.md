# 部署速查卡 | Deployment Quick Reference

## 🎯 快速部署命令 | Quick Deployment Commands

```bash
# 1. 安装 Supabase CLI
npm install -g supabase      # OR brew install supabase/tap/supabase

# 2. 登录 Supabase
supabase login

# 3. 运行部署脚本
./deploy.sh

# 4. 配置 Stripe Webhook
# 参见 STRIPE_WEBHOOK_SETUP.md
```

## 🔑 关键凭证 | Key Credentials

**Supabase:**
- Project: `jyjnadjvhoeyudltvpfy`
- URL: `https://jyjnadjvhoeyudltvpfy.supabase.co`
- Anon Key: `sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G`
- Service Key: `sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9`

**Stripe:**
- Publishable: `pk_test_51SwjZeQgFR6PoIOfDKPf29sEij87UzKNF6gSzRdRJr3AZEL7USaTTHqqEZKsXLOY79utnR363yG4lu6bISBtg8eV00wOopk6w8`
- Secret: `sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5`
- Webhook: `未设置 | Not set yet`

## 📚 部署文档 | Deployment Docs

1. `DEPLOYMENT_GUIDE.md` - 主要部署指南
2. `NEXT_STEPS.md` - 详细后续步骤
3. `STRIPE_WEBHOOK_SETUP.md` - Webhook 配置
4. `ERROR_LOGS.md` - 故障排除指南

## 🔧 故障排除 | Troubleshooting

```bash
# 检查部署状态
supabase status

# 查看函数日志
supabase functions logs --function-name=claude-analysis

# 测试数据库连接
supabase db test
```

## 🎓 部署顺序 | Deployment Order

1. ✅ 系统检查
2. ✅ 链接项目
3. ✅ 部署数据库
4. ✅ 部署函数
5. ✅ 测试端点
6. ⚠️ 配置 Webhook
7. ✅ 验证结果

---

**⏱️ 预计时间: 15-25分钟**
**⏱️ Estimated Time: 15-25 minutes**
