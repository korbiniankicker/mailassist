import { useState } from "react";
import ChatMessage from "../ChatMessage/chatMessage";
import ChatInput from "../ChatInput/chatInput";
import type { Message } from "../../types/message";
import { useWsClient } from "../../api/hooks/useWsClient";
import IngestionReload from "../IngestionReload/IngestionReload";

function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendQuery, response, setResponse, thinking } = useWsClient();

  function addMessage(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  function addQuery(content: string) {
    if (response.length > 0) {
      addMessage({ role: "assistant", content: response.join("") });
      setResponse([]);
    }
    addMessage({ role: "user", content: content });
    sendQuery(content);
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
        <div
          key={messages.length + 1}
          className="d-flex justify-content-start w-100 my-1"
        >
          <ChatMessage text={response.join("")}></ChatMessage>
        </div>
      )}
      {thinking && response.length === 0 && (
        <div
          key={messages.length + 2}
          className="d-flex justify-content-start w-100 my-1"
        >
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
