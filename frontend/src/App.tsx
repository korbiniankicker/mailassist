import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./api/context/AuthContext";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/chat" replace />
          ) : (
            <LoginPage mode="login" />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/chat" replace />
          ) : (
            <LoginPage mode="register" />
          )
        }
      />
      <Route
        path="/chat"
        element={
          isAuthenticated ? <ChatPage /> : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

export default App;
