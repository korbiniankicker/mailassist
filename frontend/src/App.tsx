import { useAuth } from "./api/context/AuthContext";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <ChatPage />;
}

export default App;
