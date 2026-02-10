import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "./styles/global.css";
import "./index.css";
import "./styles/app.css";
import App from "./app/App";
import { initScrollbarAutoHide } from "./shared/lib/scrollbar";

registerSW({ immediate: true });
initScrollbarAutoHide();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
