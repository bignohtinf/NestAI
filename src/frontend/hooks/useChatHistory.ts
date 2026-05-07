import { useState, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { apiCall } from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatHistoryItem {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryFull extends ChatHistoryItem {
  messages: ChatMessage[];
}

const API_BASE = '/api/chat-history';

export function useChatHistory() {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dispatchUpdate = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('chatHistoryUpdated'));
    }
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    ...(user?.id && { 'x-user-id': user.id }),
  });

  const createChatHistory = useCallback(async (title: string, messages: ChatMessage[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, messages }),
      });
      if (!res.ok) throw new Error('Failed to create chat history');
      const data = await res.json();
      dispatchUpdate();
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getChatHistories = useCallback(async (limit = 5, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?limit=${limit}&offset=${offset}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch chat histories');
      return await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const getChatHistory = useCallback(async (chatId: string) => {
    if (!chatId || chatId === 'undefined' || chatId === 'null') {
      console.warn('getChatHistory blocked: invalid chatId:', chatId);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${chatId}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch chat history');
      return await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateChatHistory = useCallback(async (chatId: string, title: string) => {
    if (!chatId || chatId === 'undefined' || chatId === 'null') return null;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${chatId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error('Failed to update chat history');
      const data = await res.json();
      dispatchUpdate();
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const deleteChatHistory = useCallback(async (chatId: string) => {
    if (!chatId || chatId === 'undefined' || chatId === 'null') return null;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${chatId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete chat history');
      const data = await res.json();
      dispatchUpdate();
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const addMessagesToChat = useCallback(async (chatId: string, messages: ChatMessage[]) => {
    if (!chatId || chatId === 'undefined' || chatId === 'null') return null;
    try {
      const res = await fetch(`${API_BASE}/${chatId}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(messages),
      });
      if (!res.ok) throw new Error('Failed to add messages to chat');
      return await res.json();
    } catch (err) {
      console.error('addMessagesToChat error:', err);
      throw err;
    }
  }, [user?.id]);

  const createNewChat = useCallback(async (title: string = 'Cuộc trò chuyện mới') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, messages: [] }),
      });
      if (!res.ok) throw new Error('Failed to create new chat');
      const data = await res.json();
      dispatchUpdate();
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const generateChatTitle = useCallback(async (question: string) => {
    try {
      const data = await apiCall<any>('/api/bot-pregnant/generate-title', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ question }),
      });
      return data;
    } catch (err) {
      console.error('Failed to generate chat title:', err);
      return null;
    }
  }, [user?.id]);

  return {
    loading,
    error,
    createChatHistory,
    createNewChat,
    getChatHistories,
    getChatHistory,
    updateChatHistory,
    deleteChatHistory,
    addMessagesToChat,
    generateChatTitle,
  };
}
