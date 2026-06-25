import fs from 'fs';
import path from 'path';
import { Memory } from '@/types/memory';

let client: any = null;
try {
  const rpcUrl = process.env.ZERO_G_RPC_URL;
  if (rpcUrl) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ZgClient } = require('@0glabs/0g-ts-sdk');
    client = new ZgClient(rpcUrl);
  }
} catch (e) {
  console.warn('[0G Storage] SDK client initialization failed, running in fallback mode.', e);
}

const FALLBACK_DIR = path.join(process.cwd(), 'data');
const FALLBACK_FILE = path.join(FALLBACK_DIR, 'fallback_storage.json');

function ensureFallbackFile() {
  if (!fs.existsSync(FALLBACK_DIR)) {
    fs.mkdirSync(FALLBACK_DIR, { recursive: true });
  }
  if (!fs.existsSync(FALLBACK_FILE)) {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify([]));
  }
}

export async function saveToLocalFallback(data: Memory): Promise<void> {
  ensureFallbackFile();
  const fileData = fs.readFileSync(FALLBACK_FILE, 'utf8');
  const memories: Memory[] = JSON.parse(fileData);
  memories.push(data);
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(memories, null, 2));
  console.log(`[Local Fallback] Saved memory locally: ${data.id}`);
}

export async function getMemoriesFromLocalFallback(userId: string): Promise<Memory[]> {
  ensureFallbackFile();
  const fileData = fs.readFileSync(FALLBACK_FILE, 'utf8');
  const memories: Memory[] = JSON.parse(fileData);
  return memories.filter(m => m.userId === userId);
}

export async function saveTo0GStorage(data: any): Promise<string> {
  try {
    if (!client) {
      throw new Error("0G Storage Client not initialized (ZERO_G_RPC_URL is missing)");
    }
    const buffer = Buffer.from(JSON.stringify(data));
    const txHash = await client.upload(buffer);
    console.log(`[0G Storage] Saved memory. Tx: ${txHash}`);
    return txHash;
  } catch (error) {
    console.error("[0G Storage] Upload failed, using local fallback:", error);
    const mockTxHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const enrichedData = { ...data, txHash: mockTxHash };
    await saveToLocalFallback(enrichedData);
    return mockTxHash;
  }
}

export async function fetchAllMemories(userId: string): Promise<Memory[]> {
  return await getMemoriesFromLocalFallback(userId);
}

export async function deleteMemoryFromStorage(userId: string, id: string): Promise<boolean> {
  ensureFallbackFile();
  const fileData = fs.readFileSync(FALLBACK_FILE, 'utf8');
  const memories: Memory[] = JSON.parse(fileData);
  const updated = memories.filter(m => !(m.userId === userId && m.id === id));
  fs.writeFileSync(FALLBACK_FILE, JSON.stringify(updated, null, 2));
  return true;
}
