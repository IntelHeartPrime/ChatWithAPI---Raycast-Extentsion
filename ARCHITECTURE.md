# 项目结构说明

## 概述

本 Raycast 扩展通过 **OpenAI 官方 SDK**（`openai` 包）调用任意 **OpenAI 兼容** 的 HTTP API：可接 OpenAI、JieKou AI、DeepSeek、OpenRouter、本地 Ollama 等。对话记录以 JSON 形式保存在本机。

## 目录结构

```
poe-talk/
├── src/
│   ├── poe-talking-chat.tsx      # 主对话（流式）
│   ├── poe-talking-history.tsx   # 历史列表与详情
│   ├── poe-test-connection.ts    # 测试连接（no-view）
│   ├── poe-clear-history.ts      # 清空历史（no-view）
│   └── utils/
│       ├── poe-client.ts         # OpenAI 兼容客户端封装
│       ├── connection-test.ts    # 连接测试逻辑
│       └── history.ts            # 会话读写
├── package.json                  # Raycast manifest + 依赖
├── tsconfig.json
├── README.md / USAGE.md / TROUBLESHOOTING.md
└── CHANGELOG.md
```

## 核心模块

### `src/utils/poe-client.ts`

- 使用 `OpenAI`，`baseURL` 来自偏好 **API Base URL**（经 `normalizeBaseUrl` 处理：根路径补 `/v1`，`/openai` 补为 `/openai/v1`）。
- `chat.completions.create`，支持 `stream: true` 的流式与一次性返回。
- 可选 **HTTPS 代理**：偏好 **Proxy URL** 或常见 `HTTPS_PROXY` 等环境变量（`HttpsProxyAgent` + `node-fetch`）。

### `src/utils/history.ts`

- `Conversation` 中仍使用字段名 `botName` 存储 **当时使用的模型 ID**（历史兼容，未改 JSON 结构）。

### `package.json` 偏好项

- `apiKey`、`model`、`apiBaseUrl`（必填）  
- `proxyUrl`、`refererUrl`、`appTitle`（可选）

## 数据流（对话）

1. 用户输入 → 追加 `Message` 到当前 `Conversation`  
2. `PoeClient.streamChat(messages)` → 逐块 `yield` 文本 → UI 节流更新  
3. 完成后写入磁盘 `saveConversation`

## 依赖

- `@raycast/api`、`@raycast/utils`  
- `openai`：OpenAI 兼容 API  
- `https-proxy-agent`、`node-fetch`：Node 下走 HTTP 代理

## 构建

```bash
npm install
npm run dev    # ray develop
npm run build  # ray build
npm run lint
```
