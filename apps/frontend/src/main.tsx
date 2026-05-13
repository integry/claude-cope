import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ShareCardRenderPage from "./components/ShareCardRenderPage";
import { initPostHog } from "./analytics";

const path = window.location.pathname;
const isShareCardRenderPath = path.startsWith("/share-card-render/");

if (!isShareCardRenderPath) {
  initPostHog();
}

const root = createRoot(document.getElementById("root")!);

if (isShareCardRenderPath) {
  root.render(<ShareCardRenderPage />);
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
