import { useState, useEffect, useCallback } from "react";
import { WsClient } from "../websocket/WsClient";

type ResponseChunk = { response: string; conversation_id: number };

export const useWsClient = () => {
  const [response, setResponse] = useState<Array<string>>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
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
      const p = Number(data);
      setProgress(p);
      if (p >= 100) setIsIngesting(false);
    });
    const unsubErr = WsClient.getInstance().setCallback("exception", (data: unknown) => {
      const err = data as { message?: string };
      if (err.message) setError(err.message);
      setResponse([]);
      setThinking(false);
      setIsIngesting(false);
      setProgress(0);
    });

    return () => {
      unsubRes();
      unsubProg();
      unsubErr();
    };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const sendIngestionQuery = useCallback(() => {
    setProgress(0);
    setIsIngesting(true);
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
    isIngesting,
    setResponse,
    thinking,
    activeConversationId,
    error,
    clearError,
  };
};
