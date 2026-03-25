import OpenAI from "openai";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Message } from "./history";
import fetch from "node-fetch";

export interface PoeClientConfig {
  apiKey: string;
  model: string;
  apiBaseUrl: string;
  proxyUrl?: string;
  refererUrl?: string;
  appTitle?: string;
}

// Cache proxy agent to avoid recreating
let cachedAgent: HttpsProxyAgent<string> | undefined;
let cachedProxyUrl: string | undefined;

function getProxyAgent(configProxyUrl?: string) {
  // 优先使用配置中的代理
  const proxyUrl = 
    configProxyUrl ||
    process.env.HTTPS_PROXY || 
    process.env.https_proxy || 
    process.env.HTTP_PROXY || 
    process.env.http_proxy ||
    process.env.ALL_PROXY ||
    process.env.all_proxy;

  if (proxyUrl) {
    // Reuse cached agent if proxy URL hasn't changed
    if (cachedProxyUrl === proxyUrl && cachedAgent) {
      return cachedAgent;
    }
    cachedProxyUrl = proxyUrl;
    cachedAgent = new HttpsProxyAgent(proxyUrl);
    return cachedAgent;
  }

  return undefined;
}

export class PoeClient {
  private client: OpenAI;
  private model: string;

  private static normalizeBaseUrl(url: string): string {
    const trimmedUrl = url.trim().replace(/\/+$/, "");

    try {
      const parsed = new URL(trimmedUrl);
      const pathname = parsed.pathname.replace(/\/+$/, "");

      if (!pathname || pathname === "") {
        parsed.pathname = "/v1";
        return parsed.toString().replace(/\/+$/, "");
      }

      if (pathname === "/openai") {
        parsed.pathname = "/openai/v1";
        return parsed.toString().replace(/\/+$/, "");
      }

      return parsed.toString().replace(/\/+$/, "");
    } catch {
      return trimmedUrl;
    }
  }

  constructor(config: PoeClientConfig) {
    const headers: Record<string, string> = {};
    
    if (config.refererUrl) {
      headers["HTTP-Referer"] = config.refererUrl;
    }
    
    if (config.appTitle) {
      headers["X-Title"] = config.appTitle;
    }

    const httpAgent = getProxyAgent(config.proxyUrl);
    const normalizedBaseUrl = PoeClient.normalizeBaseUrl(config.apiBaseUrl);

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: normalizedBaseUrl,
      defaultHeaders: headers,
      timeout: 60000, // 60 seconds timeout
      maxRetries: 0, // 禁用重试以便更快看到错误
      // 使用支持代理的 node-fetch
      // @ts-expect-error - fetch type mismatch but works
      fetch: (url: string, init: any) => {
        return fetch(url, {
          ...init,
          agent: httpAgent,
        });
      },
    });

    this.model = config.model;
  }

  async *streamChat(messages: Message[]): AsyncGenerator<string, void, unknown> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: formattedMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string; status?: number };
      if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
        throw new Error('请求超时，请检查网络连接或稍后重试');
      } else if (err.status === 401) {
        throw new Error('API Key 无效，请在设置中检查 API Key');
      } else if (err.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      } else {
        throw new Error(err.message || '请求失败，请稍后重试');
      }
    }
  }

  async chat(messages: Message[]): Promise<string> {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: formattedMessages,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string; status?: number; cause?: unknown };
      
      if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
        throw new Error(`请求超时 (${err.code || 'timeout'})，请检查：1) 代理是否运行 2) 网络连接`);
      } else if (err.status === 401) {
        throw new Error('API Key 无效，请在设置中检查 API Key');
      } else if (err.status === 404) {
        throw new Error(`模型 '${this.model}' 或接口地址不存在，请检查 Model 和 API Base URL`);
      } else if (err.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      } else {
        throw new Error(`${err.message || '请求失败'} (status: ${err.status || 'unknown'})`);
      }
    }
  }
}
