# 排查指南

## 请求超时 (Request timed out)

### 可能原因

1. **需要代理但未配置**
   - 在 Raycast 设置 → LLM Talk → **Proxy URL** 中填入你的代理地址
   - 常见代理地址：`http://127.0.0.1:7890`（Clash）、`http://127.0.0.1:1087`（V2RayU）

2. **API Base URL 填写有误**
   - 确保 URL 可被访问，用 curl 测试：
     ```bash
     curl https://api.openai.com/v1/models \
       -H "Authorization: Bearer YOUR_API_KEY"
     ```

3. **网络防火墙/公司网络**
   - 尝试切换到手机热点排查

### 快速诊断
```bash
# 检测常用代理端口
for port in 7890 1087 1080 8888; do
  if lsof -i :$port > /dev/null 2>&1; then
    echo "✅ 端口 $port 正在使用"
  fi
done
```

---

## API Key 无效 (401 Unauthorized)

1. 到对应平台重新生成 API Key
2. 确保复制时没有多余的空格或换行符
3. 在 Raycast 设置中更新 **API Key** 字段

---

## 模型不存在 (404 Not Found)

1. **检查 Model 字段**：模型 ID 必须与平台完全一致（区分大小写）
   - OpenAI: `gpt-4o-mini`（正确）vs `GPT-4o-Mini`（错误）
   - JieKou AI: `deepseek/deepseek-r1`（正确）vs `deepseek-r1`（可能错误）

2. **检查 API Base URL**：
   - JieKou AI 填 `https://api.jiekou.ai/openai`，插件会自动补全为 `/openai/v1`
   - OpenAI 填 `https://api.openai.com/v1`

---

## 各平台 curl 测试命令

### OpenAI 官方
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"Hi"}]}'
```

### JieKou AI
```bash
curl https://api.jiekou.ai/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"deepseek/deepseek-r1","messages":[{"role":"user","content":"Hi"}],"max_tokens":64}'
```

### DeepSeek
```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hi"}]}'
```

---

## 请求频率过高 (429 Too Many Requests)

等待一段时间后重试，或联系平台提升配额。

---

## 通用检查步骤

1. 运行 **"Test API Connection"** 命令查看详细错误
2. 重启 Raycast：`killall Raycast && open -a Raycast`
3. 清除 Raycast 缓存：
   ```bash
   rm -rf ~/Library/Caches/com.raycast.macos
   ```
