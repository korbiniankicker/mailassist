import { useState, useEffect, useCallback } from 'react';
import { Api } from '../http/HttpClient';
import type { Conversation } from '../../types/conversation';
import type { Message } from '../../types/message';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await Api.get<Conversation[]>('/conversations');
      setConversations(data);
    } catch {
      // handled by HttpClient (auth:expired event)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getMessages = useCallback(
    async (conversationId: number): Promise<Message[]> => {
      return Api.get<Message[]>(`/conversations/${conversationId}/messages`);
    },
    [],
  );

  return { conversations, loading, refresh, getMessages };
}
