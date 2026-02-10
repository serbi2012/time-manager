const SCROLL_HIDE_DELAY = 1200;

const STANDARD_SCROLLBAR_CSS = `
@layer base {
    * {
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
        transition: scrollbar-color 0.3s ease-out;
    }
    *:hover {
        scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
        transition: scrollbar-color 0.2s ease-out;
    }
    .is-scrolling {
        scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        transition: scrollbar-color 0.15s ease-out;
    }
}
`;

const SAFARI_SCROLLBAR_CSS = `
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0);
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: content-box;
}
:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border: 2px solid transparent;
    background-clip: content-box;
}
:hover::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid transparent;
    background-clip: content-box;
}
.is-scrolling::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid transparent;
    background-clip: content-box;
}
`;

function isSafari(): boolean {
    const ua = navigator.userAgent;
    return (
        ua.includes("Safari") &&
        !ua.includes("Chrome") &&
        !ua.includes("Chromium")
    );
}

function injectScrollbarStyles(): void {
    const style = document.createElement("style");
    style.setAttribute("data-scrollbar", "");
    style.textContent = isSafari()
        ? SAFARI_SCROLLBAR_CSS
        : STANDARD_SCROLLBAR_CSS;
    document.head.appendChild(style);
}

export function initScrollbarAutoHide(): () => void {
    injectScrollbarStyles();

    const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>();

    const handleScroll = (event: Event) => {
        const raw_target = event.target;

        const target =
            raw_target === document || raw_target === document.documentElement
                ? document.documentElement
                : raw_target instanceof Element
                ? raw_target
                : null;

        if (!target) return;

        target.classList.add("is-scrolling");

        const existing_timer = timers.get(target);
        if (existing_timer) {
            clearTimeout(existing_timer);
        }

        const timer = setTimeout(() => {
            target.classList.remove("is-scrolling");
            timers.delete(target);
        }, SCROLL_HIDE_DELAY);

        timers.set(target, timer);
    };

    document.addEventListener("scroll", handleScroll, {
        capture: true,
        passive: true,
    });

    return () => {
        document.removeEventListener("scroll", handleScroll, {
            capture: true,
        } as EventListenerOptions);
    };
}
