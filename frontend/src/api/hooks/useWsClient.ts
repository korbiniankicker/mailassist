import { useState, useEffect } from "react";
import { WsClient } from "../websocket/WsClient";

export const useWsClient = () => {
  const [response, setResponse] = useState<Array<string>>([]);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const unsubRes = WsClient.getInstance().setCallback("response", (data) => {
      setResponse((prev) => [...prev, data as string]);
    });
    const unsubProg = WsClient.getInstance().setCallback("response", (data) => {
      setProgress(data as number);
    });
    return () => {
      unsubRes();
      unsubProg();
    };
  }, []);

  const sendQuery = (prompt: string) => {
    WsClient.getInstance().sendMessage("query", { prompt: prompt });
  };

  return { sendQuery, response, progress, setResponse };
};
