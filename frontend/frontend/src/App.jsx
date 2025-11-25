import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateProject from "./pages/CreateProject.jsx";
import Editor from "./pages/Editor.jsx";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";

function App() {
  const { user } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>; // Wait until token is restored

  if (!user) return <Navigate to="/login" />;

  return children;
};


  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/editor/:id"
        element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
