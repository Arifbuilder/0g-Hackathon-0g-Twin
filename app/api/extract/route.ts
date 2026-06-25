import { generateObject } from 'ai';
import { MemorySchema } from '@/lib/ai/schemas';
import { saveTo0GStorage } from '@/lib/0g/storage';
import { indexLocallyForRAG } from '@/lib/db/vector';
import { getModelByProvider, get0GComputeModel, AIProvider } from '@/lib/0g/compute';
import { EXTRACTION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { Memory } from '@/types/memory';

export async function POST(req: Request) {
  try {
    const { userMessage, aiResponse, userId, provider, apiKey } = await req.json();
    if (!userMessage || !userId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Resolve model: prefer runtime provider/key, fall back to server env vars
    let model: ReturnType<typeof getModelByProvider> = null;
    if (provider && apiKey) {
      model = getModelByProvider(provider as AIProvider, apiKey);
    }
    if (!model) {
      model = get0GComputeModel();
    }

    let extractedMemories: Array<{ type: 'fact' | 'goal' | 'preference' | 'project' | 'skill' | 'event'; content: string; importance: number }> = [];

    if (model) {
      // Extract structured memories using AI
      const { object } = await generateObject({
        model: model as any,
        schema: MemorySchema,
        system: EXTRACTION_SYSTEM_PROMPT,
        prompt: `Conversation context:\nUser: ${userMessage}\nAI: ${aiResponse}`,
      });
      extractedMemories = (object as any).memories;
    } else {
      // Lightweight pattern-based fallback when no AI key is configured
      const msg = userMessage.toLowerCase();
      if (msg.includes('love') || msg.includes('like') || msg.includes('prefer')) {
        extractedMemories.push({ type: 'preference', content: userMessage, importance: 7 });
      }
      if (msg.includes('building') || msg.includes('project') || msg.includes('working on')) {
        extractedMemories.push({ type: 'project', content: userMessage, importance: 8 });
      }
      if (msg.includes('want to') || msg.includes('goal') || msg.includes('dream') || msg.includes('aim')) {
        extractedMemories.push({ type: 'goal', content: userMessage, importance: 8 });
      }
      if (msg.includes('know') || msg.includes('skill') || msg.includes('expert') || msg.includes('can code')) {
        extractedMemories.push({ type: 'skill', content: userMessage, importance: 7 });
      }
      if (msg.includes('yesterday') || msg.includes('went') || msg.includes('visited') || msg.includes('happened')) {
        extractedMemories.push({ type: 'event', content: userMessage, importance: 6 });
      }
      if (msg.includes('name is') || msg.includes('i live') || msg.includes('i am a') || msg.includes('years old')) {
        extractedMemories.push({ type: 'fact', content: userMessage, importance: 9 });
      }
      if (extractedMemories.length === 0 && userMessage.length > 15 && !userMessage.endsWith('?')) {
        extractedMemories.push({ type: 'fact', content: userMessage, importance: 5 });
      }
    }

    // Save to 0G Storage & index locally
    const memoryPromises = extractedMemories.map(async (mem) => {
      const memoryPayload: Memory = {
        id: crypto.randomUUID(),
        userId,
        type: mem.type,
        content: mem.content,
        importance: mem.importance,
        timestamp: new Date().toISOString(),
      };
      const txHash = await saveTo0GStorage(memoryPayload);
      const savedMemory = { ...memoryPayload, txHash };
      await indexLocallyForRAG(savedMemory);
      return savedMemory;
    });

    const savedMemories = await Promise.all(memoryPromises);
    return Response.json({ success: true, memories: savedMemories });

  } catch (error: any) {
    console.error("[Extract Route] Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
