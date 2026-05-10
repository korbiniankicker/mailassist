import {useState} from "react";
import type { Message } from "../../types/message";

function ChatInput({ addMessage }: { addMessage: (message: Message) => void }) {
  const [input, setInput] = useState("");
  
  function handleSend() {
    addMessage({role: "user", content: input});
    setInput("");
  }

  return (
    <div className="input-group">
      <input value={input} onChange={e => setInput(e.target.value)} type="text" className="form-control"></input>
      <button onClick={handleSend} className="btn btn-primary">Send</button>
    </div>
  );
}

export default ChatInput;
