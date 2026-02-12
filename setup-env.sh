#!/bin/bash

# Quick environment setup script
# 快速环境变量设置脚本

echo "Setting up environment variables for deployment..."

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Praxis Partners 创业评估工具
# Praxis Partners Venture Evaluation Tool
# Environment Variables Configuration

# ===== Supabase 配置 | Supabase Configuration =====
VITE_SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_ZdtH7mRtQN-FoNN3Hvq4vQ_XfOtcz2G
VITE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9
VITE_SUPABASE_PROJECT_ID=jyjnadjvhoeyudltvpfy
VITE_SUPABASE_DATABASE_PASSWORD=CuaiRWQgkO8UUbjJ

# ===== Stripe 配置 | Stripe Configuration =====
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51SwjZeQgFR6PoIOfDKPf29sEij87UzKNF6gSzRdRJr3AZEL7USaTTHqqEZKsXLOY79utnR363yG4lu6bISBtg8eV00wOopk6w8
STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5

# Stripe Webhook Secret - 在配置 Stripe Webhook 后填写
# Stripe Webhook Secret - Fill this after configuring Stripe Webhook
# STRIPE_WEBHOOK_SECRET=whsec_...

# ===== Claude API 配置 | Claude API Configuration =====
# 前往 https://console.anthropic.com/ 获取API密钥
# Get your API key from https://console.anthropic.com/
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# ===== 微信支付配置 | WeChat Pay Configuration =====
VITE_WECHAT_PAY_ENABLED=false

# ===== 应用配置 | Application Configuration =====
VITE_APP_ENV=production
VITE_PAYMENT_MOCK_MODE=false

# ===== 分析统计配置 | Analytics Configuration =====
# VITE_MIXPANEL_TOKEN=your_mixpanel_token
EOF
    echo ".env.local file created successfully!"
else
    echo ".env.local file already exists. Please verify it contains all required variables."
fi

echo ""
echo "Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and edit .env.local with your API keys"
echo "2. Install Supabase CLI: npm install -g supabase"
echo "3. Login to Supabase: supabase login"
echo "4. Run deployment: ./deploy.sh"
echo ""
