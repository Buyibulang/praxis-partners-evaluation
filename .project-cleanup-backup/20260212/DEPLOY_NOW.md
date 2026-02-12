# 🚀 立即部署 Kimi Edge Function

## 快速部署指南

以下是最简化的部署步骤，按照顺序操作即可。

---

## 📋 部署清单

### ✅ 已完成（本地）
- [x] Kimi API 密钥已测试通过
- [x] Kimi Edge Function 代码已创建 (`supabase/functions/kimi-analysis/index.ts`)
- [x] 前端代码已更新为调用 `kimi-analysis`
- [x] 环境变量已配置

### 🔜 待完成（Supabase 控制台）
- [ ] 配置环境变量 `KIMI_API_KEY`
- [ ] 部署 `kimi-analysis` Edge Function
- [ ] 测试函数是否工作正常

---

## 🎯 步骤 1: 配置环境变量

### 访问 Supabase Dashboard

🔗 **URL**: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/settings/edge-functions

### 操作步骤：

1. 点击页面上的 "Add new variable" 按钮
2. 在 "Name" 字段输入: `KIMI_API_KEY`
3. 在 "Value" 字段输入: `sk-TEzhJgiVEUPl6zcII6vGTqLWaUoRHaI4IlFsW2ffoDBgl5Uy`
4. 点击 "Save" 按钮

### 验证：
- [ ] 在环境变量列表中看到 `KIMI_API_KEY`

---

## 🎯 步骤 2: 部署 Edge Function

### 访问 Functions 页面

🔗 **URL**: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/functions

### 操作步骤：

**情况 A：如果看到 `kimi-analysis` 函数**

1. 点击 `kimi-analysis` 函数名称
2. 进入详情页面查看 "Source code"
3. 确认代码看起来正确（应该显示 TypeScript 代码）
4. 点击右上角的 "Deploy" 按钮
5. 等待状态变为 "ACTIVE"（可能需要 1-2 分钟）

**情况 B：如果没看到 `kimi-analysis` 函数**

1. 点击 "New function" 或 "Create function" 按钮
2. 函数名称输入: `kimi-analysis`
3. 选择运行环境: `Deno`
4. 在代码编辑器中，复制粘贴以下内容：

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    const apiKey = Deno.env.get('KIMI_API_KEY')

    if (!apiKey) {
      throw new Error('KIMI_API_KEY is not set')
    }

    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshot-v1-8k',
        messages: [{ role: 'user', content: prompt }],
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

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
```

5. 配置选项：
   - Authentication: 选择 "Do not require authentication"（无认证）
   - Region: 选择最近的数据中心（如 Singapore 或 Tokyo）
6. 点击 "Create function" 或 "Deploy" 按钮
7. 等待状态变为 "ACTIVE"

### 验证部署：
- [ ] 函数列表中显示 `kimi-analysis` 状态为 ACTIVE
- [ ] 点击函数可以看到详细信息和代码

---

## 🎯 步骤 3: 测试部署

### 使用 curl 命令测试

打开终端，运行以下命令：

```bash
curl -X POST "https://jyjnadjvhoeyudltvpfy.functions.supabase.co/kimi-analysis" \
  -H "Authorization: Bearer sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "You are a VC analyst. Analyze a health tech startup with scores: Market 85, Product 78, Team 92, Finance 65, Execution 80. Give investment insights in Chinese."
  }' | python3 -m json.tool
```

### 预期结果

**成功响应**:
```json
{
  "analysis": "这是一个综合评分80分的健康科技创业项目...（中文分析内容）"
}
```

**错误响应**:
```json
{"error":"KIMI_API_KEY is not set"}  # 环境变量未配置
{"error":"Function not found"}      # 函数未部署
{"error":"Invalid API Key"}         # Kimi API Key 无效
```

### 验证检查
- [ ] curl 命令返回 200 状态码
- [ ] 返回的 JSON 包含 analysis 字段
- [ ] analysis 内容是中文

---

## 🎯 步骤 4: 前端测试

### 打开应用

```bash
# 如果开发服务器没运行
npm run dev
```

访问: http://localhost:3000

### 完整测试流程

1. **创建评估**
   - 点击 "开始新评估"
   - 填写项目信息（可以测试用例）
   - 完整填写所有 5 个维度评分

2. **提交并生成报告**
   - 点击 "生成评估报告"
   - 查看显示的评分结果

3. **测试 AI 分析**
   - 点击 "AI深度分析" 按钮
   - 依次点击 7 个模块的 "开始分析":
     - [ ] 项目定位分析
     - [ ] 风险评估
     - [ ] 投资亮点
     - [ ] 改进建议
     - [ ] 融资建议
     - [ ] 里程碑规划
     - [ ] 市场策略

4. **验证结果**
   - 每个模块显示分析内容（中文）
   - 内容专业、具体、有针对性
   - 响应时间 2-10 秒

---

## 📊 故障排查快速参考

| 问题 | 症状 | 解决方案 |
|------|------|----------|
| API Key 未设置 | `{"error":"KIMI_API_KEY is not set"}` | 重新配置环境变量并重新部署 |
| 函数未找到 | `{"error":"Function not found"}` | 检查函数是否已部署，状态是否为 ACTIVE |
| 认证失败 | `{"error":"Invalid API Key"}` | 检查 Kimi API Key 是否有效，账户是否有余额 |
| CORS 错误 | 浏览器显示 CORS 错误 | 确认函数已正确部署，URL 正确 |
| 前端调用失败 | 控制台显示 404/500 错误 | 检查函数名称是否为 `kimi-analysis` |

---

## 🎉 部署成功标志

当所有步骤完成且测试通过：

```
部署状态: ✅ 成功

✓ 环境变量已配置
✓ Edge Function 已部署 (ACTIVE)
✓ API 测试通过
✓ 前端调用正常

所有的 AI 分析功能已准备就绪！
```

---

## 🔄 部署后的下一步

1. **全面测试**
   - 创建多个不同类型项目的评估
   - 测试边界情况
   - 收集反馈

2. **监控设置**
   - 在 Kimi 控制台查看使用统计
   - 设置费用提醒
   - 监控 API 响应时间

3. **准备上线**
   - 检查是否需要增加配额
   - 准备用户文档
   - 制定定价策略

---

## ⏱️ 预计时间

- 步骤 1 (配置环境变量): 2 分钟
- 步骤 2 (部署函数): 3-5 分钟
- 步骤 3 (测试 API): 2 分钟
- 步骤 4 (前端测试): 10-15 分钟

**总计**: 约 20-25 分钟

---

## 📞 遇到问题？

如果在部署过程中遇到问题：

1. **查看详细文档**: `deploy-kimi-manual-steps.md`
2. **查看迁移指南**: `AI_API_MIGRATION.md`
3. **查看测试指南**: `tests/manual-kimi-test.md`
4. **检查 Supabase 日志**: https://supabase.com/dashboard/project/jyjnadjvhoeyudltvpfy/functions/kimi-analysis/logs

**重要**: 如果 API 测试一直失败，请立即停止并检查 Kimi API Key 是否仍然有效。
