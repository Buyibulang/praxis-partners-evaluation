#!/bin/bash

# 如果自动化脚本失败，使用这个手动部署指南

# Step 1: 确保 supabase_cli 已安装
which supabase || echo "supabase 命令未找到，请手动安装"

# Step 2: 登录（如果尚未登录）
supabase login

# Step 3: 进入项目目录
cd /Users/ganbin/venture-evaluation

# Step 4: 链接项目（如果尚未链接）
supabase link --project-ref jyjnadjvhoeyudltvpfy

# Step 5: 部署数据库迁移
echo "部署数据库..."
supabase db push

# Step 6: 部署 Edge Functions
echo "部署 Edge Functions..."
supabase functions deploy wechat-pay-create --no-verify-jwt -e "SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co" -e "SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9" -e "STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5"

supabase functions deploy stripe-checkout-create --no-verify-jwt -e "SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co" -e "SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9" -e "STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5"

supabase functions deploy payment-webhook --no-verify-jwt -e "SUPABASE_URL=https://jyjnadjvhoeyudltvpfy.supabase.co" -e "SUPABASE_SERVICE_ROLE_KEY=sb_secret_RaQmxxku8QUDQA1FZR6AHA_Kd31Qth9" -e "STRIPE_SECRET_KEY=sk_test_51SwjZeQgFR6PoIOfHjMtWUq8SPLpbmMFCWKLr2Y4TCOJWzT2r8oMlI5rTgothQcNenBEKA25h7Gf3sXjWnI77HNl001AdQg4H5"

echo "✅ 部署完成！"
