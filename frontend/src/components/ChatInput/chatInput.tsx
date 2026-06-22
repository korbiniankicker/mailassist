import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

function ChatInput({ addMessage }: { addMessage: (message: string) => void }) {
  const [input, setInput] = useState("");

  function handleSend() {
    if (input) {
      addMessage(input);
      setInput("");
    }
  }

  return (
    <div className="input-group">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        type="text"
        className="form-control"
      ></input>
      <button onClick={handleSend} className="btn btn-primary">
        <i className="bi bi-arrow-up-circle-fill"></i>
      </button>
    </div>
  );
}

export default ChatInput;
