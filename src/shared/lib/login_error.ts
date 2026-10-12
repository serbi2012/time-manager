import { ERROR_MESSAGES } from "../constants";

const IGNORED_LOGIN_ERROR_CODES = new Set(["auth/cancelled-popup-request"]);

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
    "auth/popup-blocked": ERROR_MESSAGES.loginPopupBlocked,
    "auth/popup-closed-by-user": ERROR_MESSAGES.loginPopupClosed,
    "auth/unauthorized-domain": ERROR_MESSAGES.loginUnauthorizedDomain,
    "auth/network-request-failed": ERROR_MESSAGES.loginNetworkFailed,
};

export function getErrorCode(error: unknown): string | null {
    if (typeof error !== "object" || error === null || !("code" in error)) {
        return null;
    }
    const { code } = error;
    return typeof code === "string" ? code : null;
}

export function getLoginErrorMessage(error: unknown): string | null {
    const code = getErrorCode(error);
    if (!code) return ERROR_MESSAGES.loginFailed;
    if (IGNORED_LOGIN_ERROR_CODES.has(code)) return null;

    return (
        LOGIN_ERROR_MESSAGES[code] ?? `${ERROR_MESSAGES.loginFailed} (${code})`
    );
}
