function ChatMessage(props: { text: string }) {
  return (
    <div className="bg-info align-items-center justify-content-center d-flex rounded">
      <div className="fs-3 mx-1">{props.text}</div>
    </div>
  );
}

export default ChatMessage;
