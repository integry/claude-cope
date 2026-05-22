import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/courier-prime/latin-400.css";
import "@fontsource/courier-prime/latin-700.css";
import "./index.css";
import App from "./App";
import { initPostHog } from "./analytics";

initPostHog();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
