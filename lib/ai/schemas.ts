import { z } from 'zod';

export const MemorySchema = z.object({
  memories: z.array(
    z.object({
      type: z.enum(['fact', 'goal', 'preference', 'project', 'skill', 'event']),
      content: z.string().describe('The specific detail extracted'),
      importance: z.number().min(1).max(10).describe('How crucial this is to the user\'s identity'),
    })
  ),
});
