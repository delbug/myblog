#!/bin/bash
# 部署初始化脚本：等待 MySQL 就绪 → 推送表结构 → 填充种子数据

set -e

echo "⏳ 等待 MySQL 启动..."
sleep 15

echo "📦 推送数据库表结构..."
npm run db:push

echo "🌱 填充种子数据..."
npm run db:seed

echo "✅ 初始化完成！"
echo "   前台: http://localhost:3000"
echo "   后台: http://localhost:3000/admin/login"
echo "   账号: admin / admin123"
