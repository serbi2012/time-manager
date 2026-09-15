import { useState, useEffect } from "react";

/**
 * 네트워크 연결 상태
 */
export function useOnlineStatus(): boolean {
    const [is_online, setIsOnline] = useState(() =>
        typeof navigator === "undefined" ? true : navigator.onLine
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return is_online;
}
