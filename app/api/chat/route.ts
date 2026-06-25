import { streamText } from 'ai';
import { getModelByProvider, get0GComputeModel, AIProvider } from '@/lib/0g/compute';
import { fetchAllMemories } from '@/lib/0g/storage';
import { queryRAG } from '@/lib/db/vector';
import { CHAT_SYSTEM_PROMPT } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  try {
    const { messages, userId, provider, apiKey } = await req.json();
    if (!messages || messages.length === 0 || !userId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;

    // 1. Fetch memories from storage (real 0G or local fallback)
    const allMemories = await fetchAllMemories(userId);

    // 2. Perform local RAG retrieval
    const relevantMemories = await queryRAG(userId, lastMessage, allMemories, 5);

    // Format RAG context for system prompt
    const contextString = relevantMemories.length > 0
      ? relevantMemories.map(m => `- [${m.type.toUpperCase()}] ${m.content} (Importance: ${m.importance}/10)`).join('\n')
      : "No previous memories found. This is your first interaction with the user.";

    const systemPrompt = CHAT_SYSTEM_PROMPT.replace('{context}', contextString);

    // 3. Resolve AI model: prefer runtime provider/key, fall back to server env vars
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

    // 4. Stream AI response using Vercel AI SDK
    const result = await streamText({
      model: model as any,
      system: systemPrompt,
      messages: messages.slice(0, -1).concat({ role: 'user', content: lastMessage }),
    });

    return result.toDataStreamResponse({
      headers: {
        'x-rag-context': encodeURIComponent(JSON.stringify(relevantMemories)),
      }
    });

  } catch (error: any) {
    console.error("[Chat Route] Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
