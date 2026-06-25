import { getModelByProvider, get0GComputeModel, AIProvider } from '@/lib/0g/compute';
import { fetchAllMemories } from '@/lib/0g/storage';
import { FUTURE_SELF_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { userId, years, messages, provider, apiKey } = await req.json();
    if (!userId || !years || !messages || messages.length === 0) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // 1. Fetch memories from storage (real 0G or local fallback)
    const allMemories = await fetchAllMemories(userId);

    // 2. Format memories as context for the future simulation
    const contextString = allMemories.length > 0
      ? allMemories.map(m => `- [${m.type.toUpperCase()}] ${m.content}`).join('\n')
      : "No previous memories found. User is starting fresh.";

    const systemPrompt = FUTURE_SELF_SYSTEM_PROMPT
      .replace('{context}', contextString)
      .replace('{years}', years.toString());

    // 3. Resolve model: prefer runtime provider/key, fall back to server env vars
    let model: ReturnType<typeof getModelByProvider> = null;
    if (provider && apiKey) {
      model = getModelByProvider(provider as AIProvider, apiKey);
    }
    if (!model) {
      model = get0GComputeModel();
    }

    if (!model) {
      return Response.json(
        {
          error: "No AI provider configured. Please open the AI Settings panel in the chat sidebar and enter a free Gemini API key from https://aistudio.google.com/app/apikey",
        },
        { status: 503 }
      );
    }

    const result = await streamText({
      model: model as any,
      system: systemPrompt,
      messages: messages.slice(0, -1).concat({ role: 'user', content: lastMessage }),
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("[Future Simulation Route] Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
