import { useState } from "react";
import ChatMessage from "../ChatMessage/chatMessage";
import ChatInput from "../ChatInput/chatInput";
import type { Message } from "../../types/message";
import { useWsClient } from "../../api/hooks/useWsClient";

function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", content: "msg1" },
    { role: "system", content: "msg2" },
  ]);
  const { sendQuery, progress, response, setResponse } = useWsClient();

  function addMessage(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  function addQuery(content: string) {
    if (response.length > 0) {
      addMessage({ role: "assistant", content: response.join() });
      setResponse([]);
    }
    addMessage({ role: "user", content: content });
    sendQuery(content);
  }

  return (
    <div className="d-flex flex-column mx-3 bg-light">
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
      <ChatInput addMessage={addQuery}></ChatInput>
    </div>
  );
}

export default ChatWindow;
