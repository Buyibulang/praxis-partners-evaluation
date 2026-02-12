#!/bin/bash

# Disable mock mode for production testing
echo "🔧 禁用支付模拟模式..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local 文件不存在"
  exit 1
fi

# Backup original file
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)

echo "✅ 已备份原文件"

# Update VITE_PAYMENT_MOCK_MODE to false
sed -i '' 's/VITE_PAYMENT_MOCK_MODE=true/VITE_PAYMENT_MOCK_MODE=false/' .env.local

echo "✅ 已将 VITE_PAYMENT_MOCK_MODE 设置为 false"
echo ""
echo "📝 下一步操作："
echo "1. 重启开发服务器 (按 Ctrl+C 停止，然后 npm run dev)"
echo "2. 确保后端 Edge Functions 已部署"
echo "3. 测试真实支付流程 (需要部署后)"
