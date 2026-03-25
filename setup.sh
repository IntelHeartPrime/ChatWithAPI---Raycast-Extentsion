#!/bin/bash

# LLM Talk (poe-talk) — 快速初始化脚本

echo "🚀 LLM Talk Extension Setup"
echo "=========================="
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm"
    exit 1
fi

echo "✅ npm: $(npm --version)"
echo ""

if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

if ! command -v ray &> /dev/null; then
    echo "⚠️  未找到 Raycast CLI（ray），开发时可从 Raycast 菜单安装 CLI。"
    echo ""
fi

echo "🔨 构建扩展..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 构建成功"
    echo ""
    echo "📝 下一步:"
    echo "   1. Raycast → 设置 (⌘,) → Extensions → 本扩展"
    echo "   2. 填写 API Key、Model、API Base URL（OpenAI 兼容地址）"
    echo "   3. 如需翻墙，填写 Proxy URL，例如 http://127.0.0.1:7890"
    echo "   4. 运行「Test API Connection」自测"
    echo "   5. 开发调试: npm run dev"
    echo ""
    echo "📚 文档: README.md、USAGE.md、TROUBLESHOOTING.md"
    echo ""
else
    echo ""
    echo "❌ 构建失败，请查看上方错误信息"
    exit 1
fi
