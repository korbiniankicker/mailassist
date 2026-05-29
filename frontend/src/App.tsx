import ChatWindow from "./components/ChatWindow/chatWindow";

function App() {
  return (
    <>
      <div className="col-12 d-flex justify-content-center my-3">
        <img src="/public/logo.png" alt="Logo" className="col-4" />
      </div>
      <div className="col-12 d-flex justify-content-center">
        <div className="col-11">
          <ChatWindow></ChatWindow>
        </div>
      </div>
    </>
  );
}

export default App;
