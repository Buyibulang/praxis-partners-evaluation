# 错误日志和调试指南
# Error Logs and Debugging Guide

## 查看 Edge Function 日志
## Viewing Edge Function Logs

### 查看所有函数的日志
### View all function logs

```bash
supabase functions list
```

### 查看特定函数的日志
### View specific function logs

```bash
# Claude 分析函数
# Claude analysis function
supabase functions logs --function-name=claude-analysis

# Stripe 结账函数
# Stripe checkout function
supabase functions logs --function-name=stripe-checkout-create

# 支付 Webhook 函数
# Payment webhook function
supabase functions logs --function-name=payment-webhook
```

### 实时跟踪日志
### Follow logs in real-time

```bash
supabase functions logs --function-name=<function-name> --tail
```

## 常见错误和解决方案
## Common Errors and Solutions

### 1. ANTHROPIC_API_KEY 未设置
### 1. ANTHROPIC_API_KEY Not Set

**错误信息 | Error message:**
```
ANTHROPIC_API_KEY is not set
```

**解决方案 | Solution:**
```bash
# 设置环境变量
# Set environment variable
supabase secrets set ANTHROPIC_API_KEY=your_api_key
```

### 2. Stripe 密钥无效
### 2. Invalid Stripe Key

**错误信息 | Error message:**
```
Invalid API Key provided: sk_test_***
```

**解决方案 | Solution:**
- 确认 STRIPE_SECRET_KEY 是正确的
- 检查是否有额外的空格
- Verify STRIPE_SECRET_KEY starts with 'sk_test_' (test) or 'sk_live_' (production)

### 3. 数据库连接错误
### 3. Database Connection Error

**错误信息 | Error message:**
```
Failed to connect to database
```

**解决方案 | Solution:**
- 检查 SUPABASE_SERVICE_ROLE_KEY 是否正确
- 确保数据库已经部署
- Check database migration status: `supabase db status`

### 4. CORS 错误
### 4. CORS Error

**错误信息 | Error message:**
```
CORS header 'Access-Control-Allow-Origin' missing
```

**解决方案 | Solution:**
- Ensure CORS headers are set in the function response
- Check if the requesting origin is allowed

## 调试技巧
## Debugging Tips

1. **本地测试函数**

```bash
# 启动本地开发服务器
# Start local development server
supabase functions serve

# 函数将在 http://localhost:54321/functions/v1/<function-name> 可用
# Functions will be available at http://localhost:54321/functions/v1/<function-name>
```

2. **环境变量调试**

```bash
# 查看已设置的环境变量
# View set environment variables
supabase secrets list
```

3. **检查函数部署状态**

```bash
# 查看函数详情
# View function details
supabase functions list --detailed
```

4. **使用 console.log 进行调试**

在函数代码中添加调试输出：
In function code, add debug output:

```typescript
console.log('Debug info:', variable)
console.error('Error occurred:', error)
```

## 联系技术支持
## Contact Technical Support

如果问题持续存在，请提供：
If issues persist, please provide:

1. 完整的错误日志
2. 复现步骤
3. 您的配置（请隐藏敏感信息）
4. 函数代码片段

---

**最后更新 | Last Updated:** 2026-02-03
