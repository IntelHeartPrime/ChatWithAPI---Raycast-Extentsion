# LLM Talk - Raycast Extension

A Raycast extension for chatting with any OpenAI-compatible API (OpenAI, JieKou AI, DeepSeek, local Ollama, etc.) with automatic conversation history.

## Features

- 🤖 **Chat with any LLM**: Supports any OpenAI-compatible endpoint
- 🌐 **Relay platform support**: Works with JieKou AI, OpenRouter, and other relay services
- 💬 **Conversation History**: Automatically saves all conversations locally
- 📝 **Browse & Manage**: View and delete past conversations
- 🔐 **Secure**: API key stored in Raycast's secure preferences
- ⚡ **Streaming**: Real-time streaming output for faster responses

## Setup

### 1. Get your API Key

- **OpenAI**: https://platform.openai.com/api-keys
- **JieKou AI**: https://jiekou.ai (管理 API 密钥)
- **DeepSeek**: https://platform.deepseek.com
- **Other relay platforms**: See the platform's documentation

### 2. Configure the Extension

1. Open Raycast preferences (`⌘ + ,`)
2. Navigate to **Extensions → LLM Talk**
3. Fill in:
   - **API Key**: Your API key from the chosen platform
   - **Model**: The model ID to use (see examples below)
   - **API Base URL**: The endpoint base URL for your provider

### 3. API Base URL Examples

| Platform | Base URL |
|---|---|
| OpenAI (official) | `https://api.openai.com/v1` |
| JieKou AI | `https://api.jiekou.ai/openai` |
| DeepSeek | `https://api.deepseek.com/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |
| Local Ollama | `http://localhost:11434/v1` |

### 4. Model ID Examples

| Platform | Model IDs |
|---|---|
| OpenAI | `gpt-4o`, `gpt-4o-mini`, `o1` |
| JieKou AI | `deepseek/deepseek-r1`, `anthropic/claude-3-5-sonnet` |
| DeepSeek | `deepseek-chat`, `deepseek-reasoner` |
| OpenRouter | `openai/gpt-4o`, `google/gemini-2.0-flash-001` |

## Usage

### Chat with AI (Interactive)

1. Open Raycast (`⌘ + Space`)
2. Type **"Chat with AI"**
3. A chat window opens:
   - Press `⌘+Enter` to send a message
   - Press `⌘+N` to start a new conversation
   - Press `⌘+C` to copy the last response
   - Press `⌘+Shift+C` to copy the full conversation

### Browse Conversation History

1. Open Raycast (`⌘ + Space`)
2. Type **"Browse AI Conversations"**
3. View, search and manage all past conversations

### Test API Connection

1. Open Raycast (`⌘ + Space`)
2. Type **"Test API Connection"**
3. A quick connectivity check is run and the result is shown

## Storage

Conversations are stored locally at:
```
~/Library/Application Support/com.raycast.macos/extensions/poe-talk/conversations/
```

Each conversation is saved as a JSON file with all messages and timestamps.

## Optional Proxy

If you need an HTTP/HTTPS proxy (e.g. Clash on `http://127.0.0.1:7890`), add it under **Proxy URL** in the extension settings.

## Development

```bash
npm install
npm run dev    # hot-reload development mode
npm run build  # production build
```

## License

MIT
