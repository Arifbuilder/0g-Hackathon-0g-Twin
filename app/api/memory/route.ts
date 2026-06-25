import { fetchAllMemories, saveTo0GStorage, deleteMemoryFromStorage } from '@/lib/0g/storage';
import { indexLocallyForRAG } from '@/lib/db/vector';
import { Memory } from '@/types/memory';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return Response.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const memories = await fetchAllMemories(userId);
    return Response.json({ memories });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, type, content, importance } = await req.json();
    if (!userId || !type || !content || importance === undefined) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const memoryPayload: Memory = {
      id: crypto.randomUUID(),
      userId,
      type,
      content,
      importance: Number(importance),
      timestamp: new Date().toISOString(),
    };

    const txHash = await saveTo0GStorage(memoryPayload);
    const savedMemory = { ...memoryPayload, txHash };

    await indexLocallyForRAG(savedMemory);

    return Response.json({ success: true, memory: savedMemory });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const id = searchParams.get('id');
    if (!userId || !id) {
      return Response.json({ error: "Missing userId or id parameter" }, { status: 400 });
    }

    await deleteMemoryFromStorage(userId, id);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
