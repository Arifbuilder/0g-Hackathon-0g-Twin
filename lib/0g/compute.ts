import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'deepseek' | '0g';

export const PROVIDER_INFO: Record<AIProvider, {
  label: string;
  model: string;
  description: string;
  free: boolean;
  keyUrl: string;
  keyPlaceholder: string;
}> = {
  gemini: {
    label: 'Google Gemini',
    model: 'gemini-2.0-flash',
    description: 'Free tier · 1,500 req/day · No credit card',
    free: true,
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyPlaceholder: 'AIza...',
  },
  openai: {
    label: 'OpenAI GPT-4o',
    model: 'gpt-4o-mini',
    description: 'Paid · $5 free credit on signup',
    free: false,
    keyUrl: 'https://platform.openai.com/api-keys',
    keyPlaceholder: 'sk-...',
  },
  claude: {
    label: 'Anthropic Claude',
    model: 'claude-3-5-haiku-20241022',
    description: 'Paid · $5 free credit on signup',
    free: false,
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyPlaceholder: 'sk-ant-...',
  },
  deepseek: {
    label: 'DeepSeek',
    model: 'deepseek-chat',
    description: 'Very cheap · ~$0.14 per 1M tokens',
    free: false,
    keyUrl: 'https://platform.deepseek.com/api_keys',
    keyPlaceholder: 'sk-...',
  },
  '0g': {
    label: '0G Compute Node',
    model: 'deepseek-chat',
    description: 'Decentralized · Requires 0G node',
    free: false,
    keyUrl: 'https://0g.ai',
    keyPlaceholder: 'API key from 0G node',
  },
};

/**
 * Returns a model instance based on provider + runtime API key.
 * Used by chat/extract/future API routes to support per-request provider selection.
 */
export function getModelByProvider(provider: AIProvider, apiKey: string) {
  switch (provider) {
    case 'gemini': {
      const google = createGoogleGenerativeAI({ apiKey });
      return google('gemini-2.0-flash');
    }
    case 'openai': {
      const openai = createOpenAI({ apiKey });
      return openai('gpt-4o-mini');
    }
    case 'claude': {
      const anthropic = createAnthropic({ apiKey });
      return anthropic('claude-3-5-haiku-20241022');
    }
    case 'deepseek': {
      const deepseek = createDeepSeek({ apiKey });
      return deepseek('deepseek-chat');
    }
    case '0g': {
      const computeEndpoint = process.env.ZERO_G_COMPUTE_URL;
      const customProvider = createOpenAI({
        baseURL: computeEndpoint,
        apiKey,
      });
      return customProvider(process.env.ZERO_G_COMPUTE_MODEL || 'deepseek-chat');
    }
    default:
      return null;
  }
}

/**
 * Legacy server-side model resolver (reads from env vars).
 * Used as a fallback when no runtime provider/key is supplied.
 */
export function get0GComputeModel() {
  // 0G Compute decentralized node
  const computeEndpoint = process.env.ZERO_G_COMPUTE_URL;
  const computeKey = process.env.ZERO_G_COMPUTE_API_KEY;
  if (computeEndpoint && computeKey) {
    console.log(`[0G Compute] Routing to decentralized node: ${computeEndpoint}`);
    return getModelByProvider('0g', computeKey);
  }

  // Gemini — free tier default
  if (process.env.GEMINI_API_KEY) {
    return getModelByProvider('gemini', process.env.GEMINI_API_KEY);
  }

  // DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    return getModelByProvider('deepseek', process.env.DEEPSEEK_API_KEY);
  }

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    return getModelByProvider('openai', process.env.OPENAI_API_KEY);
  }

  // Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    return getModelByProvider('claude', process.env.ANTHROPIC_API_KEY);
  }

  console.warn('[AI] No API keys found. Configure a provider in the chat settings.');
  return null;
}
