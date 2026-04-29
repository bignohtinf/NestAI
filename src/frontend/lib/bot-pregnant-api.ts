const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface BotQueryRequest {
  question: string;
  user_id: string;
  stage?: string;
}

export interface BotQueryResponse {
  question: string;
  answer: string;
  sources: Array<{
    content: string;
    metadata: Record<string, any>;
  }>;
}

export const botPregnantApi = {
  async query(question: string, userId: string, stage?: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot-pregnant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          user_id: userId,
          stage,
        } as BotQueryRequest),
      });

      if (!response.ok) {
        console.error('Bot API error:', response.status);
        return '';
      }

      const data: BotQueryResponse = await response.json();
      return data.answer;
    } catch (error) {
      console.error('Bot query failed:', error);
      return '';
    }
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bot-pregnant/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
