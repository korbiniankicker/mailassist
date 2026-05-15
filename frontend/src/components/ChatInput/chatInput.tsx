import { useState } from "react";

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
        Send
      </button>
    </div>
  );
}

export default ChatInput;
