import { createRoot } from "react-dom/client";
import "@fontsource/courier-prime/latin-400.css";
import "@fontsource/courier-prime/latin-700.css";
import "./index.css";
import ShareCardRenderPage from "./components/ShareCardRenderPage";

createRoot(document.getElementById("root")!).render(<ShareCardRenderPage />);
