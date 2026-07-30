import { useState, useEffect, useCallback } from "react";
import { WsClient } from "../websocket/WsClient";

type ResponseChunk = { response: string; conversation_id: number };

export const useWsClient = () => {
  const [response, setResponse] = useState<Array<string>>([]);
  const [progress, setProgress] = useState<number>(0);
  const [thinking, setThinking] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubRes = WsClient.getInstance().setCallback("response", (data: unknown) => {
      const chunk = data as ResponseChunk;
      if (chunk.response) {
        setResponse((prev) => [...prev, chunk.response]);
        setThinking(false);
      }
      setActiveConversationId(chunk.conversation_id);
    });
    const unsubProg = WsClient.getInstance().setCallback("progress", (data: unknown) => {
      setProgress(data as number);
    });
    const unsubErr = WsClient.getInstance().setCallback("exception", (data: unknown) => {
      const err = data as { message?: string };
      if (err.message) setError(err.message);
      setResponse([]);
      setThinking(false);
    });

    return () => {
      unsubRes();
      unsubProg();
      unsubErr();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const sendIngestionQuery = useCallback(() => {
    WsClient.getInstance().sendMessage("ingest");
  }, []);

  const sendQuery = useCallback((prompt: string, conversation_id?: number) => {
    WsClient.getInstance().sendMessage("query", {
      prompt,
      ...(conversation_id ? { conversation_id } : {}),
    });
    setThinking(true);
  }, []);

  return {
    sendIngestionQuery,
    sendQuery,
    response,
    progress,
    setResponse,
    thinking,
    activeConversationId,
    error,
    clearError,
  };
};
