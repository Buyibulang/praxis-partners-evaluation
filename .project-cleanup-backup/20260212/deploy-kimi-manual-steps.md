# Kimi Edge Function 手动部署指南

## 📋 部署清单

### 步骤 1: 配置 Supabase 环境变量

#### 访问 Supabase Dashboard
```
https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/settings/edge-functions
```

#### 添加环境变量

在 "Environment Variables" 部分，添加以下变量：

| 变量名 | 值 |
|--------|-----|
| KIMI_API_KEY | sk-TEzhJgiVEUPl6zcII6vGTqLWaUoRHaI4IlFsW2ffoDBgl5Uy |

**操作步骤**：
1. 点击 "Add new variable"
2. 变量名输入: `KIMI_API_KEY`
3. 值输入: `sk-TEzhJgiVEUPl6zcII6vGTqLWaUoRHaI4IlFsW2ffoDBgl5Uy`
4. 点击 "Save"

**重要**: 环境变量添加后，需要重新部署函数才能生效。

---

### 步骤 2: 部署 Edge Function

#### 访问 Functions 页面
```
https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/functions
```

#### 检查 kimi-analysis 函数

查看函数列表中是否有 `kimi-analysis` 函数：

**情况 A: 函数已存在**
1. 点击 `kimi-analysis` 函数
2. 查看详情页面
3. 检查 "Source code" 是否正确显示代码
4. 如果环境变量已配置，点击 "Deploy" 按钮重新部署

**情况 B: 函数不存在**
1. 点击 "Create a new function" 或 "New function"
2. 函数名输入: `kimi-analysis`
3. 选择运行环境: `Deno`
4. 代码编辑器中输入以下内容:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    const apiKey = Deno.env.get('KIMI_API_KEY')

    if (!apiKey) {
      throw new Error('KIMI_API_KEY is not set')
    }

    // Call Kimi (Moonshot AI) API
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Kimi API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const analysis = data.choices[0].message.content

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in kimi-analysis:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
```

5. 配置函数:
   - 认证: 关闭 (No authentication required)
   - 区域: 选择最近的区域 (如 Singapore 或 Tokyo)
   - 环境变量: 确保 `KIMI_API_KEY` 已列出

6. 点击 "Create function" 或 "Deploy"

---

### 步骤 3: 验证部署

部署完成后，验证函数是否正常工作。

#### 方法 A: 使用浏览器测试

访问以下 URL（替换 `YOUR_SUPABASE_ANON_KEY`）：
```
https://jyjnadjvhoeyudltvpfy.functions.supabase.co/kimi-analysis
```

你会看到一个测试页面，可以填写 JSON 进行测试：

```json
{
  "prompt": "请分析一个健康科技公司，综合评分 80/100"
}
```

#### 方法 B: 使用 curl 测试

```bash
curl -X POST "https://jyjnadjvhoeyudltvpfy.functions.supabase.co/kimi-analysis" \
  -H "Authorization: Bearer sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "You are a VC analyst. Analyze a startup in health tech with scores: Market 85, Product 78, Team 92, Finance 65, Execution 80. Give investment insights in Chinese."
  }'
```

**预期成功响应**:
```json
{
  "analysis": "这是一个优秀的健康科技项目..."
}
```

**可能的错误响应**:
- `{"error":"KIMI_API_KEY is not set"}` - 环境变量未配置
- `{"error":"Function not found"}` - 函数未部署
- `{"error":"Invalid API Key"}` - Kimi API 密钥无效

---

### 步骤 4: 前端集成测试

部署成功后，测试前端应用。

#### 访问前端应用
```
http://localhost:3000
```

#### 完整测试流程

1. **创建新评估**
   - 点击 "开始新评估"
   - 填写项目信息：名称、行业、融资阶段
   - 完整填写所有 5 个维度的评估（市场、产品、团队、财务、执行）

2. **提交评估**
   - 点击 "生成评估报告"
   - 查看评分结果

3. **测试 AI 分析**
   - 在结果页面点击 "AI深度分析"
   - 依次点击所有 7 个分析模块的 "开始分析"
   - 观察每个模块的响应时间和输出质量

#### 预期行为

**成功情况**:
- 每个模块显示 "AI正在分析中"（2-5秒）
- 显示中文分析结果
- 内容专业、具体、有针对性
- 可以点击"重新分析"

**失败情况**:
- 显示错误消息（红色提示框）
- 常见错误：
  - "AI分析失败，请重试" - API 错误或网络问题
  - "本月AI分析额度已用完" - 达到配额限制
  - "AI分析功能需要Pro或Premium订阅" - 权限问题

---

### 步骤 5: 监控和验证

#### 查看函数日志

在 Supabase Dashboard:
```
https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/functions/kimi-analysis/logs
```

检查:
- 是否有错误日志
- 响应时间是否正常
- API 调用次数

#### 监控 Kimi API 使用

访问:
```
https://platform.moonshot.cn/
```

查看:
- [ ] 今日调用次数
- [ ] 本月费用
- [ ] Token 使用量
- [ ] 响应时间统计

---

## 🔧 故障排查

### 问题 1: 函数部署失败

**症状**: 部署时显示错误

**解决方案**:
1. 检查代码语法是否正确
2. 确认环境变量已配置
3. 查看部署日志获取详细错误信息
4. 尝试使用项目中的文件部署:
   ```bash
   # 如果安装了 Supabase CLI
   supabase functions deploy kimi-analysis --no-verify-jwt
   ```

### 问题 2: API 调用返回 401

**症状**: `{"error":"Invalid Authentication"}`

**解决方案**:
1. 确认 `KIMI_API_KEY` 已正确配置
2. 检查密钥是否有效（在 Kimi 平台测试）
3. 确保账户有足够余额
4. 检查密钥格式是否正确

### 问题 3: API 调用返回 404

**症状**: `{"error":"Function not found"}`

**解决方案**:
1. 确认函数已部署
2. 检查函数名称是否正确（`kimi-analysis`）
3. 检查 Supabase Project ID 是否正确
4. 重新部署函数

### 问题 4: 前端无法调用函数

**症状**: CORS 错误或网络错误

**解决方案**:
1. 确认函数已正确部署且状态为 Active
2. 检查前端调用的 URL 是否正确
3. 检查网络连接
4. 查看浏览器控制台错误信息

### 问题 5: 分析结果质量不佳

**症状**: 分析结果过于笼统或不符合预期

**解决方案**:
1. 检查 prompt 是否包含足够的项目信息
2. 尝试调整 temperature 参数（当前 0.3）
3. 考虑使用更大的模型（如 moonshot-v1-32k）
4. 优化 prompt 工程

---

## 📊 性能基准

### 预期性能指标

- **部署时间**: 2-5 分钟
- **首次调用**: 5-10 秒（冷启动）
- **后续调用**: 2-5 秒
- **Token 使用**: 800-1,400 tokens/次分析
- **费用**: ¥0.05-0.10/次分析

### 优化建议

1. **减少冷启动**:
   - 使用更高的调用频率保持函数活跃
   - 考虑使用 Supabase 的定期任务预热函数

2. **降低成本**:
   - 实施缓存机制（相同输入复用结果）
   - 监控使用情况，设置配额限制
   - 考虑使用更小的模型（如果质量可接受）

3. **提高响应速度**:
   - 优化 prompt 长度
   - 减少 max_tokens（当前 4,000）
   - 使用流式响应（需要修改前端代码）

---

## 🎯 部署检查清单

完成以下检查后，表示部署成功：

### 配置检查
- [ ] KIMI_API_KEY 已添加到 Supabase 环境变量
- [ ] kimi-analysis 函数已创建或更新
- [ ] 函数状态显示 "ACTIVE"

### 功能检查
- [ ] curl 测试返回成功响应
- [ ] 前端可以正常调用函数
- [ ] 所有 7 个 AI 分析模块正常工作

### 性能检查
- [ ] 响应时间在 2-10 秒范围内
- [ ] 没有 500 错误
- [ ] Token 使用量在预期范围内

### 质量检查
- [ ] 分析结果用中文输出
- [ ] 内容专业、具体、有针对性
- [ ] 与项目信息相关

---

## 🚀 部署完成后的下一步

部署成功后：

1. **全面测试**
   - 创建多个不同类型的评估
   - 测试所有 7 个 AI 模块
   - 验证结果质量

2. **监控设置**
   - 设置费用提醒
   - 监控 API 使用情况
   - 配置错误警报

3. **用户反馈**
   - 收集用户体验反馈
   - 评估分析质量
   - 收集改进建议

4. **持续优化**
   - 基于反馈调整 prompt
   - 优化分析流程
   - 考虑添加更多 AI 功能

---

## 📞 需要帮助？

如果遇到问题：

1. **查看日志**: Supabase Dashboard → Functions → kimi-analysis → Logs
2. **测试 API**: 使用 curl 或 Postman 直接测试 Edge Function
3. **检查配置**: 确认所有环境变量正确设置
4. **参考文档**: AI_API_MIGRATION.md 和 tests/manual-kimi-test.md

**重要**: 部署过程中有任何问题，请立即停止并寻求帮助，避免产生不必要的 API 费用。
