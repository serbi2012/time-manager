import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./index.css";
import "./styles/app.css";
import App from "./app/App";
import { initScrollbarAutoHide } from "./shared/lib/scrollbar";

if (import.meta.env.PROD) {
    import("virtual:pwa-register").then(({ registerSW }) => {
        registerSW({ immediate: true });
    });
} else {
    navigator.serviceWorker?.getRegistrations().then((registrations) => {
        registrations.forEach((r) => r.unregister());
    });
}

initScrollbarAutoHide();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
