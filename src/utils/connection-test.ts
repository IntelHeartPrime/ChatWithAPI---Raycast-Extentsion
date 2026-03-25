import { showToast, Toast } from "@raycast/api";
import { PoeClient } from "./poe-client";
import { getLlmPreferences } from "./llm-preferences";

export async function testPoeConnection(): Promise<boolean> {
  const preferences = getLlmPreferences();

  if (!preferences.apiKey) {
    showToast(Toast.Style.Failure, "未配置 API Key", "请在设置中添加 API Key");
    return false;
  }

  const toast = await showToast({
    style: Toast.Style.Animated,
    title: "测试连接...",
  });

  try {
    console.log("🔧 测试配置:");
    console.log("  Model:", preferences.model);
    console.log("  Base URL:", preferences.apiBaseUrl);
    console.log("  Proxy:", preferences.proxyUrl || "未配置");
    console.log("  API Key:", preferences.apiKey ? "已配置 (" + preferences.apiKey.substring(0, 10) + "...)" : "未配置");

    const client = new PoeClient({
      apiKey: preferences.apiKey,
      model: preferences.model || "gpt-4o-mini",
      apiBaseUrl: preferences.apiBaseUrl,
      proxyUrl: preferences.proxyUrl,
      refererUrl: preferences.refererUrl,
      appTitle: preferences.appTitle,
    });

    console.log("📤 发送测试消息...");
    
    // Send a simple test message
    const response = await client.chat([
      {
        role: "user",
        content: "Hi",
        timestamp: Date.now(),
      },
    ]);

    console.log("📥 收到响应:", response ? "成功" : "空响应");

    if (response) {
      toast.style = Toast.Style.Success;
      toast.title = "✅ 连接成功";
      toast.message = `Model: ${preferences.model}${preferences.proxyUrl ? " (使用代理)" : ""}`;
      return true;
    }

    toast.style = Toast.Style.Failure;
    toast.title = "❌ 连接失败";
    toast.message = "未收到响应";
    return false;
  } catch (error) {
    console.error("❌ 测试连接错误:", error);
    
    const err = error as { message?: string; code?: string; status?: number };
    let errorMessage = "未知错误";
    
    if (err.message?.includes("timeout")) {
      errorMessage = preferences.proxyUrl 
        ? "连接超时 - 请检查代理设置是否正确" 
        : "连接超时 - 可能需要配置代理";
    } else if (err.status === 401) {
      errorMessage = "API Key 无效";
    } else if (err.message) {
      errorMessage = err.message;
    }

    toast.style = Toast.Style.Failure;
    toast.title = "❌ 连接失败";
    toast.message = errorMessage;
    
    // 显示详细建议
    if (!preferences.proxyUrl && err.message?.includes("timeout")) {
      setTimeout(() => {
        showToast(
          Toast.Style.Failure,
          "💡 提示",
          "如果在中国大陆，请在设置中配置代理: http://127.0.0.1:7890"
        );
      }, 2000);
    }
    
    return false;
  }
}

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: "API Key 不能为空" };
  }

  return { valid: true };
}
