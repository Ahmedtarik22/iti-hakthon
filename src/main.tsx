
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { AuthProvider } from "./lib/AuthContext.tsx";
  import { LocaleProvider } from "./lib/LocaleContext.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <LocaleProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LocaleProvider>
  );
  