import { describe, it, expect } from "vitest";
import {
    getErrorCode,
    getLoginErrorMessage,
} from "@/shared/lib/login_error";
import { ERROR_MESSAGES } from "@/shared/constants";

describe("getErrorCode", () => {
    it("code 속성이 있으면 반환한다", () => {
        expect(getErrorCode({ code: "auth/popup-blocked" })).toBe(
            "auth/popup-blocked"
        );
    });

    it("code가 없거나 문자열이 아니면 null을 반환한다", () => {
        expect(getErrorCode(new Error("x"))).toBeNull();
        expect(getErrorCode({ code: 1 })).toBeNull();
        expect(getErrorCode(null)).toBeNull();
        expect(getErrorCode("auth/popup-blocked")).toBeNull();
    });
});

describe("getLoginErrorMessage", () => {
    it("팝업이 차단되면 팝업 허용 안내를 반환한다", () => {
        expect(getLoginErrorMessage({ code: "auth/popup-blocked" })).toBe(
            ERROR_MESSAGES.loginPopupBlocked
        );
    });

    it("로그인 창이 닫히면 창 닫힘 안내를 반환한다", () => {
        expect(
            getLoginErrorMessage({ code: "auth/popup-closed-by-user" })
        ).toBe(ERROR_MESSAGES.loginPopupClosed);
    });

    it("허용되지 않은 주소면 주소 안내를 반환한다", () => {
        expect(
            getLoginErrorMessage({ code: "auth/unauthorized-domain" })
        ).toBe(ERROR_MESSAGES.loginUnauthorizedDomain);
    });

    it("네트워크 오류면 연결 확인 안내를 반환한다", () => {
        expect(
            getLoginErrorMessage({ code: "auth/network-request-failed" })
        ).toBe(ERROR_MESSAGES.loginNetworkFailed);
    });

    it("이전 로그인 창이 취소된 경우는 메시지를 띄우지 않는다", () => {
        expect(
            getLoginErrorMessage({ code: "auth/cancelled-popup-request" })
        ).toBeNull();
    });

    it("알 수 없는 오류 코드는 코드를 붙여 반환한다", () => {
        expect(getLoginErrorMessage({ code: "auth/internal-error" })).toBe(
            `${ERROR_MESSAGES.loginFailed} (auth/internal-error)`
        );
    });

    it("코드가 없는 오류는 기본 실패 문구를 반환한다", () => {
        expect(getLoginErrorMessage(new Error("x"))).toBe(
            ERROR_MESSAGES.loginFailed
        );
    });
});
