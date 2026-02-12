#!/bin/bash

# Vercel自动部署脚本
# 每次git push时自动触发

echo "🚀 准备部署到Vercel..."
echo "=================================="

# 检查Git状态
echo "📦 检查Git状态..."
if [ ! -d ".git" ]; then
    echo "❌ 不是Git仓库，请先初始化: git init"
    exit 1
fi

# 添加所有更改
echo "📥 添加更改到Git..."
git add .

# 检查是否有更改
if git diff --staged --quiet; then
    echo "⚠️  没有新的更改需要提交"
    echo "   如果确定要部署，请输入提交信息:"
    read -p "提交信息: " commit_message
    git commit -m "$commit_message" -m "$(date)"
else
    # 自动提交
    git commit -m "$(date +'%Y-%m-%d %H:%M:%S') 自动部署" -m "更新内容:" -m "- 代码更新" -m "- 功能优化"
fi

# 推送到GitHub
echo "☁️  推送到GitHub..."
git push

echo ""
echo "✅ 推送完成！"
echo ""
echo "Vercel会自动检测到push并开始部署："
echo "- 安装依赖 (npm install)"
echo "- 构建应用 (npm run build)"
echo "- 部署到全球CDN"
echo "- 配置SSL证书"
echo ""
echo "部署进度查看："
echo "https://vercel.com/dashboard"
echo ""
echo "预计时间：2-5分钟"
