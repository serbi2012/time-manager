import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const { mockSignInWithPopup } = vi.hoisted(() => ({
    mockSignInWithPopup: vi.fn(),
}));

vi.mock("../../../firebase/config", () => ({
    getAuthInstance: vi.fn().mockResolvedValue({}),
    getGoogleProviderInstance: vi.fn().mockResolvedValue({}),
}));

vi.mock("firebase/auth", () => ({
    onAuthStateChanged: (_auth: unknown, callback: (user: null) => void) => {
        callback(null);
        return () => {};
    },
    signInWithPopup: mockSignInWithPopup,
    signOut: vi.fn(),
}));

import { useAuth } from "../../../firebase/useAuth";

describe("useAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("로그인이 실패하면 오류를 다시 던지고 로딩을 끝낸다", async () => {
        const popup_error = Object.assign(new Error("blocked"), {
            code: "auth/popup-blocked",
        });
        mockSignInWithPopup.mockRejectedValue(popup_error);

        const { result } = renderHook(() => useAuth());
        await waitFor(() => expect(result.current.loading).toBe(false));

        let thrown: unknown;
        await act(async () => {
            await result.current.signInWithGoogle().catch((error) => {
                thrown = error;
            });
        });

        expect(thrown).toBe(popup_error);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe("blocked");
    });

    it("로그인이 성공하면 오류 없이 끝난다", async () => {
        mockSignInWithPopup.mockResolvedValue({});

        const { result } = renderHook(() => useAuth());
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.signInWithGoogle();
        });

        expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBeNull();
    });
});
