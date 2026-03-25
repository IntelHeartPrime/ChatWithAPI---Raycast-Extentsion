# 代理配置指南

## 何时需要代理

若直连 OpenAI 或境外中转 API 超时、失败，可在扩展里配置 **Proxy URL**（例如 Clash 的 `http://127.0.0.1:7890`）。

## 第 1 步：完全退出并重启 Raycast

修改扩展偏好后，建议完全退出 Raycast 再打开，确保新选项生效。

```bash
killall Raycast
sleep 2
open -a Raycast
```

## 第 2 步：打开扩展设置

1. `⌘ + ,` 打开 Raycast 设置  
2. **Extensions** → **LLM Talk**（扩展目录名可能仍为 `poe-talk`）

## 第 3 步：填写必填项

| 字段 | 说明 |
|------|------|
| **API Key** | 各平台发放的密钥 |
| **Model** | 模型 ID（与平台文档一致） |
| **API Base URL** | OpenAI 兼容根地址，例如 `https://api.openai.com/v1`、`https://api.jiekou.ai/openai` |
| **Proxy URL**（可选） | `http://127.0.0.1:7890` 等 |

## 第 4 步：测试

在 Raycast 中运行 **「Test API Connection」**，确认能收到回复。

开发模式下可在终端查看日志，应包含 **Model**、**Base URL**、**Proxy** 等信息。

## 手动用 curl 测代理

把 `YOUR_PROXY` 换成你的代理地址，把 URL 换成你在设置里填的 **API Base URL** 对应的 `.../v1/models`（多数平台可用；无列表接口时改用文档里的 `chat/completions` 示例）。

```bash
# 示例：经代理访问 OpenAI（401 仅表示未带 Key，能连上即代理可用）
curl -sS --connect-timeout 8 -x http://127.0.0.1:7890 \
  -o /dev/null -w "%{http_code}\n" \
  https://api.openai.com/v1/models
```

## 常见问题

### 配置了代理仍超时

1. 确认 Clash/V2Ray 等已开启且端口正确（`lsof -i :7890`）  
2. **API Base URL** 无多余空格、无错误路径  
3. 尝试 **规则模式 / 全局模式** 切换

### 环境变量（备选）

在 `~/.zshrc` 中：

```bash
export HTTPS_PROXY=http://127.0.0.1:7890
export HTTP_PROXY=http://127.0.0.1:7890
```

重启终端与 Raycast。扩展内 **Proxy URL** 仍优先于部分环境变量（见 `poe-client.ts` 中的代理逻辑）。

## 辅助脚本

项目根目录下的 `./detect-proxy.sh` 可检测本机常见代理端口，并用示例 URL 测试经代理的连通性。
