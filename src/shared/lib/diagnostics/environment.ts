import { CURRENT_VERSION } from "@/constants/changelog";
import { STORAGE_KEYS } from "@/shared/constants";
import type { DiagnosticEnvironment } from "./types";

/**
 * 현재 브라우저/앱 환경 정보 수집
 */
export function collectEnvironment(): DiagnosticEnvironment {
    return {
        app_version: CURRENT_VERSION,
        user_agent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
        },
        device_pixel_ratio: window.devicePixelRatio,
        online: navigator.onLine,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        collected_at: new Date().toISOString(),
        url: window.location.href,
    };
}

/**
 * LocalStorage에 저장된 작업 데이터 크기(바이트)
 *
 * 접근이 차단된 환경에서는 null을 반환한다.
 */
export function measureStorageBytes(): number | null {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.WORK_TIME);
        return raw ? new Blob([raw]).size : 0;
    } catch {
        return null;
    }
}
