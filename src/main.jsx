import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { GoalProvider } from "./context/GoalContext";
import App from "./App.jsx";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <GoalProvider>
        <App />
      </GoalProvider>
    </AuthProvider>
  </StrictMode>,
);
