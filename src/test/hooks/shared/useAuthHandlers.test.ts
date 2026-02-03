/**
 * useAuthHandlers 훅 테스트
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// firebase useAuth 모킹 - vi.hoisted로 함수 선언
const {
    mockSignInWithGoogle,
    mockLogout,
    mockMessageSuccess,
    mockMessageError,
} = vi.hoisted(() => ({
    mockSignInWithGoogle: vi.fn(),
    mockLogout: vi.fn(),
    mockMessageSuccess: vi.fn(),
    mockMessageError: vi.fn(),
}));

vi.mock("../../../firebase/useAuth", () => ({
    useAuth: () => ({
        user: { email: "test@example.com" },
        loading: false,
        isAuthenticated: true,
        signInWithGoogle: mockSignInWithGoogle,
        logout: mockLogout,
    }),
}));

vi.mock("antd", async () => {
    const actual = await vi.importActual("antd");
    return {
        ...actual,
        message: {
            success: mockMessageSuccess,
            error: mockMessageError,
        },
    };
});

import { useAuthHandlers } from "../../../shared/hooks/useAuthHandlers";

describe("useAuthHandlers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("handleLogin", () => {
        it("성공 시 signInWithGoogle을 호출한다", async () => {
            mockSignInWithGoogle.mockResolvedValue(undefined);

            const { result } = renderHook(() => useAuthHandlers());

            await act(async () => {
                await result.current.handleLogin();
            });

            expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
        });

        it("실패 시 에러 메시지를 표시한다", async () => {
            mockSignInWithGoogle.mockRejectedValue(new Error("Login failed"));

            const { result } = renderHook(() => useAuthHandlers());

            await act(async () => {
                await result.current.handleLogin();
            });

            expect(mockMessageError).toHaveBeenCalledWith(
                "로그인에 실패했습니다"
            );
        });
    });

    describe("handleLogout", () => {
        it("성공 시 logout을 호출하고 성공 메시지를 표시한다", async () => {
            mockLogout.mockResolvedValue(undefined);

            const { result } = renderHook(() => useAuthHandlers());

            await act(async () => {
                await result.current.handleLogout();
            });

            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(mockMessageSuccess).toHaveBeenCalledWith(
                "로그아웃되었습니다"
            );
        });

        it("실패 시 에러 메시지를 표시한다", async () => {
            mockLogout.mockRejectedValue(new Error("Logout failed"));

            const { result } = renderHook(() => useAuthHandlers());

            await act(async () => {
                await result.current.handleLogout();
            });

            expect(mockMessageError).toHaveBeenCalledWith(
                "로그아웃에 실패했습니다"
            );
        });
    });

    describe("반환값", () => {
        it("user를 반환한다", () => {
            const { result } = renderHook(() => useAuthHandlers());

            expect(result.current.user).toEqual({ email: "test@example.com" });
        });

        it("loading을 반환한다", () => {
            const { result } = renderHook(() => useAuthHandlers());

            expect(result.current.loading).toBe(false);
        });

        it("isAuthenticated를 반환한다", () => {
            const { result } = renderHook(() => useAuthHandlers());

            expect(result.current.isAuthenticated).toBe(true);
        });

        it("signInWithGoogle을 반환한다", () => {
            const { result } = renderHook(() => useAuthHandlers());

            expect(result.current.signInWithGoogle).toBe(mockSignInWithGoogle);
        });

        it("logout을 반환한다", () => {
            const { result } = renderHook(() => useAuthHandlers());

            expect(result.current.logout).toBe(mockLogout);
        });
    });
});
