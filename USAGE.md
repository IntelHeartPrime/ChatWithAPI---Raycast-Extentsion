# Quick Start Guide

## Initial Setup

1. **Get your API Key**
   - OpenAI: https://platform.openai.com/api-keys
   - JieKou AI: https://jiekou.ai
   - DeepSeek: https://platform.deepseek.com
   - Any other OpenAI-compatible relay platform

2. **Install the extension in Raycast**
   ```bash
   npm install
   npm run dev
   ```

3. **Configure settings**
   - Open Raycast settings (`⌘ + ,`)
   - Find **"LLM Talk"** extension
   - Fill in **API Key**, **Model**, and **API Base URL**

## Commands

### 1. Chat with AI (Interactive)
**Usage**: Open Raycast → Type "Chat with AI"

**What happens**:
- A chat window opens
- Send messages with `⌘+Enter`
- Responses stream in real time
- Conversation is automatically saved

### 2. Browse AI Conversations
**Usage**: Open Raycast → Type "Browse AI Conversations"

**Features**:
- View all saved conversations
- Search by title or content
- Sort by most recent
- Delete unwanted conversations
- View full conversation details

**Keyboard shortcuts**:
- `⌘ + Delete` – Delete selected conversation
- `⌘ + R` – Refresh list
- `Enter` – View conversation details

## Configuration Options

### Required Settings

| Setting | Description | Example |
|---|---|---|
| API Key | Your API key | `sk-...` or `pk_...` |
| Model | Model ID | `gpt-4o-mini` |
| API Base URL | Provider endpoint | `https://api.openai.com/v1` |

### Optional Settings

| Setting | Description | Purpose |
|---|---|---|
| Proxy URL | HTTP/HTTPS proxy URL | Traffic via local proxy tool |
| Referer URL | HTTP-Referer header | Some relay platforms need this |
| App Title | X-Title header | Some relay platforms need this |

## Provider Quick Reference

### OpenAI (Official)
```
API Base URL : https://api.openai.com/v1
Model        : gpt-4o-mini
```

### JieKou AI
```
API Base URL : https://api.jiekou.ai/openai
Model        : deepseek/deepseek-r1
```
Full model list: https://jiekou.ai/#model-library

### DeepSeek
```
API Base URL : https://api.deepseek.com/v1
Model        : deepseek-chat
```

### OpenRouter
```
API Base URL : https://openrouter.ai/api/v1
Model        : openai/gpt-4o
```

### Local Ollama
```
API Base URL : http://localhost:11434/v1
API Key      : ollama   (any non-empty string)
Model        : llama3.2
```

## Where is data stored?

Conversations are stored locally at:
- **macOS**: `~/Library/Application Support/com.raycast.macos/extensions/poe-talk/conversations/`

Each conversation is a JSON file:
```json
{
  "id": "conv_1234567890_abc123",
  "title": "Explain quantum computing...",
  "messages": [
    { "role": "user", "content": "Your message", "timestamp": 1234567890000 },
    { "role": "assistant", "content": "AI response", "timestamp": 1234567891000 }
  ],
  "createdAt": 1234567890000,
  "updatedAt": 1234567891000,
  "botName": "gpt-4o-mini"
}
```

## Troubleshooting

### "请在扩展设置中配置 API Key"
- Go to Raycast settings → LLM Talk
- Make sure **API Key** is filled in

### "模型 '...' 或接口地址不存在" (404)
- Double-check **Model** ID – it must match the provider's model list exactly
- Double-check **API Base URL** – no trailing slash needed

### Request timeout
- If you need a proxy, set it under **Proxy URL** (e.g. `http://127.0.0.1:7890`)
- Test connectivity with the **"Test API Connection"** command

### API Key invalid (401)
- Regenerate your API key on the provider's dashboard
- Make sure there are no leading/trailing spaces in the key field

## 命令行快速测通（可选）

在项目目录下可用脚本验证 **API Key / Base URL / 代理**（与扩展内 `normalize` 规则一致）：

```bash
export API_KEY="你的密钥"
export API_BASE_URL="https://api.jiekou.ai/openai"   # 或 OpenAI 等
export MODEL="deepseek/deepseek-r1"
export PROXY_URL="http://127.0.0.1:7890"           # 不需要可 unset
chmod +x ./test-api.sh
./test-api.sh
```

Node + OpenAI SDK 示例：

```bash
export API_KEY="你的密钥"
export API_BASE_URL="https://api.openai.com/v1"
export MODEL="gpt-4o-mini"
export PROXY_URL="http://127.0.0.1:7890"
node test-proxy-node.js
```

代理端口扫描：`./detect-proxy.sh`（可用 `TEST_URL` 指向你的 `.../v1/models` 等）。
