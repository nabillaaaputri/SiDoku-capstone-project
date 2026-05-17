import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.css";
import { AuthProvider } from "./contexts/AuthContext";
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);