import {useState} from "react";
import ChatMessage from "../ChatMessage/chatMessage";
import ChatInput from "../ChatInput/chatInput";
import type { Message } from "../../types/message"

function ChatWindow() {
    const [messages, setMessages] = useState<Message[]>([{role: "user", content: "msg1"}, {role: "system", content: "msg2"}]);

    function addMessage(message: Message) {
        setMessages(prev => [...prev, message])
    }
    return (
        <div className="d-flex flex-column mx-3 bg-light">
            {messages.map((message, index) => {
                if(message.role === "user") {
                    return (
                    <div key={index} className="d-flex justify-content-end w-100 my-1">
                        <ChatMessage text={message.content}></ChatMessage>
                    </div>
                    );
                }
                else {
                    return (
                    <div key={index} className="d-flex justify-content-start w-100 my-1">
                        <ChatMessage text={message.content}></ChatMessage>
                    </div>
                    );
                }
            })}
            <ChatInput addMessage={addMessage}></ChatInput>
        </div>
    );
}

export default ChatWindow;