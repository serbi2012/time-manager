/**
 * 인증 핸들러 훅
 *
 * Google 로그인/로그아웃을 처리하는 공통 로직을 제공합니다.
 * Desktop/Mobile Layout에서 중복되던 handleLogin/handleLogout 로직을 통합합니다.
 */

import { useCallback } from "react";
import { message } from "antd";
import { useAuth } from "../../firebase/useAuth";
import type { User } from "firebase/auth";

/**
 * 인증 핸들러 훅 반환 타입
 */
export interface UseAuthHandlersReturn {
    /** 현재 로그인된 사용자 */
    user: User | null;
    /** 인증 로딩 상태 */
    loading: boolean;
    /** 인증 여부 */
    isAuthenticated: boolean;
    /** Google 로그인 처리 */
    handleLogin: () => Promise<void>;
    /** 로그아웃 처리 */
    handleLogout: () => Promise<void>;
    /** Google 로그인 함수 (직접 접근용) */
    signInWithGoogle: () => Promise<void>;
    /** 로그아웃 함수 (직접 접근용) */
    logout: () => Promise<void>;
}

/**
 * 인증 핸들러 훅
 *
 * @example
 * ```tsx
 * const { user, loading, isAuthenticated, handleLogin, handleLogout } = useAuthHandlers();
 *
 * // 로그인 버튼
 * <Button onClick={handleLogin} loading={loading}>
 *   로그인
 * </Button>
 *
 * // 로그아웃 버튼
 * <Button onClick={handleLogout}>
 *   로그아웃
 * </Button>
 * ```
 */
export function useAuthHandlers(): UseAuthHandlersReturn {
    const { user, loading, isAuthenticated, signInWithGoogle, logout } =
        useAuth();

    /**
     * 로그인 처리 (에러 핸들링 포함)
     */
    const handleLogin = useCallback(async () => {
        try {
            await signInWithGoogle();
        } catch {
            message.error("로그인에 실패했습니다");
        }
    }, [signInWithGoogle]);

    /**
     * 로그아웃 처리 (에러 핸들링 포함)
     */
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            message.success("로그아웃되었습니다");
        } catch {
            message.error("로그아웃에 실패했습니다");
        }
    }, [logout]);

    return {
        user,
        loading,
        isAuthenticated,
        handleLogin,
        handleLogout,
        signInWithGoogle,
        logout,
    };
}
