function ChatMessage(props: { text: string }) {
  return (
    <div className="bg-info align-items-center justify-content-center d-flex rounded col-5">
      <div className="fs-4 mx-1 text-break">{props.text}</div>
    </div>
  );
}

export default ChatMessage;
