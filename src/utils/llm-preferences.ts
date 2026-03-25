import { getPreferenceValues } from "@raycast/api";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_API_BASE_URL = "https://api.openai.com/v1";

/** Matches package.json preferences plus optional legacy keys for migration */
type RawLlmPreferences = {
  apiKey?: string;
  /** Legacy (pre-rename); Raycast only returns this if still declared in manifest */
  poeApiKey?: string;
  model?: string;
  /** Legacy display name field reused as model id in older versions */
  botName?: string;
  apiBaseUrl?: string;
  proxyUrl?: string;
  refererUrl?: string;
  appTitle?: string;
};

export type LlmPreferences = {
  apiKey: string;
  model: string;
  apiBaseUrl: string;
  proxyUrl?: string;
  refererUrl?: string;
  appTitle?: string;
};

function trimOrEmpty(v: string | undefined): string {
  return (v ?? "").trim();
}

/**
 * Resolves extension preferences: merges legacy keys, applies manifest defaults when values are missing.
 */
export function getLlmPreferences(): LlmPreferences {
  const p = getPreferenceValues() as RawLlmPreferences;

  console.log("🔧 [LLM Preferences] Raw preferences from Raycast:");
  console.log("  - apiKey:", p.apiKey ? `存在 (${p.apiKey.length} chars)` : "空");
  console.log("  - poeApiKey (legacy):", p.poeApiKey ? `存在 (${p.poeApiKey.length} chars)` : "空");
  console.log("  - model:", p.model || "空");
  console.log("  - botName (legacy):", p.botName || "空");
  console.log("  - apiBaseUrl:", p.apiBaseUrl || "空");

  const apiKey = trimOrEmpty(p.apiKey) || trimOrEmpty(p.poeApiKey);
  const modelRaw = trimOrEmpty(p.model) || trimOrEmpty(p.botName);
  const model = modelRaw || DEFAULT_MODEL;

  let apiBaseUrl = trimOrEmpty(p.apiBaseUrl);
  if (!apiBaseUrl) {
    apiBaseUrl = DEFAULT_API_BASE_URL;
  }

  const result = {
    apiKey,
    model,
    apiBaseUrl,
    proxyUrl: trimOrEmpty(p.proxyUrl) || undefined,
    refererUrl: trimOrEmpty(p.refererUrl) || undefined,
    appTitle: trimOrEmpty(p.appTitle) || undefined,
  };

  console.log("✅ [LLM Preferences] Final resolved values:");
  console.log("  - apiKey:", result.apiKey ? `✅ 已配置 (${result.apiKey.length} chars)` : "❌ 为空");
  console.log("  - model:", result.model);
  console.log("  - apiBaseUrl:", result.apiBaseUrl);

  return result;
}
