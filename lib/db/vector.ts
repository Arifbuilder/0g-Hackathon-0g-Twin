import { Memory } from '@/types/memory';

// In-memory indexing placeholder for client/server alignment
export async function indexLocallyForRAG(memory: Memory): Promise<void> {
  console.log(`[Local RAG Index] Indexed memory ID: ${memory.id} for fast retrieval.`);
}

// Custom RAG search based on token-matching and semantic-importance scoring
export async function queryRAG(
  userId: string,
  query: string,
  memories: Memory[],
  limit = 5
): Promise<Memory[]> {
  if (!memories || memories.length === 0) return [];

  // Standard stop words to ignore
  const stopWords = new Set(['the', 'and', 'a', 'to', 'of', 'in', 'is', 'that', 'it', 'for', 'on', 'with', 'as', 'at', 'by', 'an', 'this']);

  const queryTokens = query.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 1 && !stopWords.has(t));

  if (queryTokens.length === 0) {
    // Fallback: return most important/recent memories
    return [...memories]
      .sort((a, b) => b.importance - a.importance || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  const scored = memories.map(memory => {
    const contentLower = memory.content.toLowerCase();
    let score = 0;

    // Check token overlaps
    queryTokens.forEach(token => {
      if (contentLower.includes(token)) {
        score += 1.0;
        // Exact word boundary matching bonus
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        if (regex.test(contentLower)) {
          score += 0.5;
        }
      }
    });

    // Add weight for matching category in query (e.g. if user asks "what are my goals")
    if (query.toLowerCase().includes(memory.type) || (memory.type === 'preference' && query.toLowerCase().includes('like'))) {
      score += 1.0;
    }

    // Weight by memory importance (normalized between 0 and 0.5)
    score += (memory.importance / 10) * 0.5;

    return { memory, score };
  });

  // Filter memories with positive overlap score, sort descending
  return scored
    .filter(item => item.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .map(item => item.memory)
    .slice(0, limit);
}
