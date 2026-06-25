export interface Memory {
  id: string;
  userId: string;
  type: 'fact' | 'goal' | 'preference' | 'project' | 'skill' | 'event';
  content: string;
  importance: number; // 1-10
  timestamp: string;
  txHash?: string;
}

export interface DigitalTwinStats {
  syncPercentage: number;
  memoryCount: number;
  categories: {
    fact: number;
    goal: number;
    preference: number;
    project: number;
    skill: number;
    event: number;
  };
  lastSyncTime: string;
}
