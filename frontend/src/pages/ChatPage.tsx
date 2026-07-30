import { useState } from "react";
import { useAuth } from "../api/context/AuthContext";
import { useConversations } from "../api/hooks/useConversations";
import ChatWindow from "../components/ChatWindow/chatWindow";
import ConversationList from "../components/ConversationList/ConversationList";
import { Api } from "../api/http/HttpClient";

const SIDEBAR_WIDTH = 280;

export default function ChatPage() {
  const { logout } = useAuth();
  const { conversations, loading, refresh, getMessages } = useConversations();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatKey, setChatKey] = useState(0);

  return (
    <div className="d-flex" style={{ height: "100vh" }}>
      <div
        className="border-end bg-light d-flex flex-column"
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
          height: "100vh",
          transition: "margin-left 0.2s",
          marginLeft: sidebarOpen ? 0 : -SIDEBAR_WIDTH,
        }}
      >
        <div className="d-flex justify-content-end p-1">
          <button className="btn btn-sm btn-outline-secondary border-0" onClick={() => setSidebarOpen(false)}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="flex-grow-1 overflow-hidden">
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            loading={loading}
            onSelect={setActiveConversationId}
            onDelete={async (id) => { await Api.del(`/conversations/${id}`); if (id === activeConversationId) { setActiveConversationId(null); setChatKey(k => k + 1); } refresh(); }}
            onRefresh={refresh}
            onNew={() => { setActiveConversationId(null); setChatKey(k => k + 1); refresh(); }}
          />
        </div>
      </div>

      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        <div className="d-flex align-items-center justify-content-center px-3 py-2 border-bottom position-relative">
          {!sidebarOpen && (
            <button className="btn btn-sm btn-outline-secondary position-absolute start-0 ms-2" onClick={() => setSidebarOpen(true)}>
              <i className="bi bi-list"></i>
            </button>
          )}
          <img src="/logo.png" alt="Logo" style={{ width: "33%", height: "auto" }} />
          <button className="btn btn-outline-secondary btn-sm position-fixed top-0 end-0 m-3" onClick={logout}>
            Logout
          </button>
        </div>
        <div className="flex-grow-1 overflow-auto">
          <ChatWindow key={chatKey} conversationId={activeConversationId} getMessages={getMessages} onConversationCreated={(id) => { setActiveConversationId(id); refresh(); }} />
        </div>
      </div>
    </div>
  );
}
