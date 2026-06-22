import { useState, useEffect } from "react";
import { WsClient } from "../websocket/WsClient";

export const useWsClient = () => {
  const [response, setResponse] = useState<Array<string>>([]);
  const [progress, setProgress] = useState<number>(0);
  const [thinking, setThinking] = useState<boolean>(false);

  useEffect(() => {
    const unsubRes = WsClient.getInstance().setCallback("response", (data) => {
      setResponse((prev) => [...prev, data as string]);
      if (thinking) setThinking(false);
    });
    const unsubProg = WsClient.getInstance().setCallback("progress", (data) => {
      setProgress(data as number);
    });
    return () => {
      unsubRes();
      unsubProg();
    };
  }, []);

  const sendIngestionQuery = () => {
    WsClient.getInstance().sendMessage("ingest");
  };

  const sendQuery = (prompt: string) => {
    WsClient.getInstance().sendMessage("query", { prompt: prompt });
    setThinking(true);
  };

  return {
    sendIngestionQuery,
    sendQuery,
    response,
    progress,
    setResponse,
    thinking,
  };
};
