#!/bin/bash

# Enable mock mode for testing payment functionality without real backend
echo "🔧 启用支付模拟模式..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local 文件不存在"
  exit 1
fi

# Backup original file
cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)

echo "✅ 已备份原文件"

# Update VITE_PAYMENT_MOCK_MODE to true
sed -i '' 's/VITE_PAYMENT_MOCK_MODE=false/VITE_PAYMENT_MOCK_MODE=true/' .env.local

echo "✅ 已将 VITE_PAYMENT_MOCK_MODE 设置为 true"
echo ""
echo "📝 下一步操作："
echo "1. 重启开发服务器 (按 Ctrl+C 停止，然后 npm run dev)"
echo "2. 打开 http://localhost:3000/"
echo "3. 点击"升级到 Pro"测试支付流程"
echo "4. 支付将在 2 秒后自动成功（模拟模式）"
echo ""
echo "🎯 要恢复生产模式，运行: ./DISABLE_MOCK_MODE.sh"

