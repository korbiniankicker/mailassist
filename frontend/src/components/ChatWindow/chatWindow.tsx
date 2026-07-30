import { useState, useEffect } from "react";
import ChatMessage from "../ChatMessage/chatMessage";
import ChatInput from "../ChatInput/chatInput";
import type { Message } from "../../types/message";
import { useWsClient } from "../../api/hooks/useWsClient";
import IngestionReload from "../IngestionReload/IngestionReload";

type Props = {
  conversationId: number | null;
  getMessages: (id: number) => Promise<Message[]>;
  onConversationCreated?: (id: number) => void;
};

function ChatWindow({ conversationId, getMessages, onConversationCreated }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendQuery, response, setResponse, thinking, error, clearError, activeConversationId: wsActiveId } = useWsClient();

  useEffect(() => {
    if (!conversationId && wsActiveId) {
      onConversationCreated?.(wsActiveId);
    }
  }, [conversationId, wsActiveId, onConversationCreated]);

  useEffect(() => {
    let ignore = false;
    if (conversationId) {
      getMessages(conversationId).then((data) => {
        if (!ignore) setMessages(data);
      }).catch((err) => console.error('[ChatWindow] getMessages failed:', err));
      setResponse([]);
      clearError();
    } else {
      setMessages([]);
      setResponse([]);
      clearError();
    }
    return () => { ignore = true; };
  }, [conversationId, getMessages, setResponse, clearError]);

  useEffect(() => {
    if (error) {
      setMessages((prev) => [...prev, { role: "error", content: error }]);
      setResponse([]);
      clearError();
    }
  }, [error, clearError, setResponse]);

  function addMessage(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  function addQuery(content: string) {
    if (response.length > 0) {
      addMessage({ role: "assistant", content: response.join("") });
      setResponse([]);
    }
    addMessage({ role: "user", content: content });
    sendQuery(content, conversationId ?? undefined);
  }

  return (
    <div className="d-flex flex-column mx-3">
      {messages.map((message, index) => {
        if (message.role === "user") {
          return (
            <div key={index} className="d-flex justify-content-end w-100 my-1">
              <ChatMessage text={message.content}></ChatMessage>
            </div>
          );
        } else if (message.role === "error") {
          return (
            <div key={index} className="d-flex justify-content-start w-100 my-1">
              <div className="alert alert-danger py-1 px-3 mb-0 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                {message.content}
              </div>
            </div>
          );
        } else {
          return (
            <div
              key={index}
              className="d-flex justify-content-start w-100 my-1"
            >
              <ChatMessage text={message.content}></ChatMessage>
            </div>
          );
        }
      })}
      {response.length > 0 && (
        <div className="d-flex justify-content-start w-100 my-1">
          <ChatMessage text={response.join("")}></ChatMessage>
        </div>
      )}
      {thinking && response.length === 0 && (
        <div className="d-flex justify-content-start w-100 my-1">
          <ChatMessage text={"..."}></ChatMessage>
        </div>
      )}
      <div className="my-3">
        <IngestionReload></IngestionReload>
      </div>
      <div className="my-3">
        <ChatInput addMessage={addQuery}></ChatInput>
      </div>
    </div>
  );
}

export default ChatWindow;
