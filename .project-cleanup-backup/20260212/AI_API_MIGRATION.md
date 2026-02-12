# AI API 切换为 Kimi (Moonshot AI) 说明

## 变更记录

已将 AI 分析功能从 Claude (Anthropic) 切换为 Kimi (Moonshot AI)

### 原因
- Kimi 更适合中文语境
- 访问更稳定
- 成本相对更低
- 国内服务，速度更快

## 技术变更

### 1. Edge Function 切换

**旧文件**: `supabase/functions/claude-analysis/index.ts` (保留但不再使用)
**新文件**: `supabase/functions/kimi-analysis/index.ts`

主要变化：
- API 端点: `https://api.moonshot.cn/v1/chat/completions`
- 认证方式: Bearer token
- 请求格式: OpenAI 兼容格式
- 模型: `moonshot-v1-8k`

### 2. 前端调用修改

**文件**: `src/components/AIAnalysis.jsx`

变更：
```javascript
// 旧代码
const response = await supabase.functions.invoke('claude-analysis', {
  body: { prompt }
})

// 新代码
const response = await supabase.functions.invoke('kimi-analysis', {
  body: { prompt }
})
```

### 3. 环境变量变更

**添加**: `KIMI_API_KEY` (在 `.env.local` 中已配置)
**保留**: `VITE_ANTHROPIC_API_KEY` (供参考，未使用)

## Kimi API 配置

### 获取 API Key
1. 访问 https://platform.moonshot.cn/
2. 注册账号
3. 在控制台生成 API Key
4. 将 Key 配置到 Supabase Edge Function

### 配置步骤

#### 方法 1: 通过 Supabase Dashboard (推荐)

1. 访问: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/settings/edge-functions
2. 添加环境变量:
   - 变量名: `KIMI_API_KEY`
   - 值: `sk-TEzhJgiVEUPl6zcII6vGTqLWaUoRHaI4IlFsW2ffoDBgl5Uy`
3. 部署 Edge Function:
   - 选择 `kimi-analysis` 函数
   - 点击 "Deploy"

#### 方法 2: 使用 deploy.sh 脚本

```bash
# 编辑 deploy.sh 并设置 KIMI_API_KEY
export KIMI_API_KEY="sk-TEzhJgiVEUPl6zcII6vGTqLWaUoRHaI4IlFsW2ffoDBgl5Uy"

# 运行部署
./deploy.sh
```

## 测试验证

### API 测试
```bash
curl -X POST "https://jyjnadjvhoeyudltvpfy.functions.supabase.co/kimi-analysis" \
  -H "Authorization: Bearer sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "分析一个健康科技创业项目，评分80/100"}'
```

### 前端测试
1. 启动应用: `npm run dev`
2. 创建一个评估
3. 点击 "AI深度分析"
4. 验证 7 个模块都能正常工作

## Kimi API 特性

### 支持的模型
- `moonshot-v1-8k`: 8k 上下文，适合大多数分析
- `moonshot-v1-32k`: 32k 上下文，适合长文本
- `moonshot-v1-128k`: 128k 上下文，适合超长文本

### 定价参考
- 8k 模型: ¥0.06/1K tokens (输入), ¥0.06/1K tokens (输出)
- 32k 模型: ¥0.12/1K tokens (输入), ¥0.12/1K tokens (输出)
- 128k 模型: ¥0.24/1K tokens (输入), ¥0.24/1K tokens (输出)

### 优势
- 长文本理解能力强
- 中文支持优秀
- API 稳定性好
- 响应速度快

## 回退方案

如果 Kimi API 出现问题，可以轻松切换回 Claude:

1. 修改 `src/components/AIAnalysis.jsx`:
   ```javascript
   // 改回 'claude-analysis'
   const response = await supabase.functions.invoke('claude-analysis', {
     body: { prompt }
   })
   ```

2. 在 Supabase 中配置 `ANTHROPIC_API_KEY`

3. 重新部署 `claude-analysis` Edge Function

## 维护建议

1. **监控 API 使用**：在 Kimi 控制台查看调用量和费用
2. **设置配额提醒**：避免超出预算
3. **定期测试**：确保 API 正常工作
4. **备份方案**：准备备用 API (如 Claude 或 OpenAI)

## 问题排查

### 问题 1: API 调用失败
- 检查 Supabase 中是否正确配置了 `KIMI_API_KEY`
- 验证 API Key 是否有效
- 检查 Kimi 账户是否有足够额度

### 问题 2: 分析结果质量不佳
- 调整 prompt 工程
- 尝试使用更大的模型 (32k 或 128k)
- 优化 temperature 参数

### 问题 3: 响应慢
- Kimi 默认响应速度良好
- 检查网络连接
- 考虑升级到更高性能的模型

## 总结

已成功将 AI 分析功能切换为 Kimi API，所有代码已更新并配置完毕。现在可以在配置好 Supabase Edge Function 后开始测试 AI 分析功能。
