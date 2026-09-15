/**
 * PWA 업데이트 안내
 * 새 버전이 준비되면 알리고, 사용자가 누를 때만 새로고침한다
 */

export const PWA_NEED_REFRESH_EVENT = "pwa:need-refresh";

type UpdateHandler = () => void;

let update_handler: UpdateHandler | null = null;

export function setPwaUpdateHandler(handler: UpdateHandler): void {
    update_handler = handler;
}

export function applyPwaUpdate(): void {
    update_handler?.();
}

export function hasPwaUpdate(): boolean {
    return update_handler !== null;
}

export function notifyPwaNeedRefresh(): void {
    window.dispatchEvent(new Event(PWA_NEED_REFRESH_EVENT));
}

export function resetPwaUpdateHandler(): void {
    update_handler = null;
}
