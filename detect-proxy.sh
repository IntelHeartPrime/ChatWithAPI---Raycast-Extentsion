#!/bin/bash

# 检测本机常见代理端口，并用示例 HTTPS 目标测试直连 / 走代理
# 目标 URL 仅用于连通性（返回 401 等也可能表示网络已通）

TEST_URL="${TEST_URL:-https://api.openai.com/v1/models}"

echo "🔍 Raycast 扩展 — 代理检测"
echo "=============================="
echo "测试 URL: $TEST_URL"
echo ""

echo "📡 系统代理 (macOS scutil):"
scutil --proxy 2>/dev/null | grep -E "(HTTPEnable|HTTPProxy|HTTPPort|HTTPSEnable|HTTPSProxy|HTTPSPort)" || true
echo ""

echo "🌍 环境变量:"
echo "HTTP_PROXY: ${HTTP_PROXY:-未设置}"
echo "HTTPS_PROXY: ${HTTPS_PROXY:-未设置}"
echo ""

echo "🔌 常见本地代理端口:"
for port in 1087 7890 8888 1080 7891; do
  if lsof -i :"$port" > /dev/null 2>&1; then
    echo "  ✅ 端口 $port 正在监听"
    lsof -i :"$port" | grep LISTEN | awk '{print "     " $1 " (PID " $2 ")"}'
  else
    echo "  — 端口 $port 未使用"
  fi
done
echo ""

echo "🌐 直连 $TEST_URL (约 5s 超时):"
if curl -sS --connect-timeout 5 -o /dev/null -w "HTTP %{http_code}\n" "$TEST_URL" 2>/dev/null; then
  :
else
  echo "  ❌ 直连失败（可能需要代理）"
fi
echo ""

echo "💡 在 Raycast → LLM Talk 中填写 Proxy URL，例如:"
echo "   http://127.0.0.1:7890"
echo ""

echo "🧪 经代理测试 (仅测常见端口):"
for port in 7890 1087 1080; do
  if lsof -i :"$port" > /dev/null 2>&1; then
    echo "  尝试 http://127.0.0.1:$port ..."
    code=$(curl -sS --connect-timeout 4 -x "http://127.0.0.1:$port" -o /dev/null -w "%{http_code}" "$TEST_URL" 2>/dev/null || echo "err")
    echo "  → HTTP $code （401/403 也可能表示已连通）"
  fi
done

echo ""
echo "=============================="
echo "✅ 检测结束"
