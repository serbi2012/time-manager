import { useState, useEffect, useCallback } from "react";
import type { User } from "firebase/auth";
import { getAuthInstance, getGoogleProviderInstance } from "./config";

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export function useAuth() {
    const [auth_state, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let unsubscribe: (() => void) | null = null;
        let cancelled = false;

        (async () => {
            const auth = await getAuthInstance();
            const { onAuthStateChanged } = await import("firebase/auth");
            if (cancelled) return;
            unsubscribe = onAuthStateChanged(auth, (user) => {
                setAuthState({ user, loading: false, error: null });
            });
        })();

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, []);

    const signInWithGoogle = useCallback(async () => {
        try {
            setAuthState((prev) => ({ ...prev, loading: true, error: null }));
            const auth = await getAuthInstance();
            const provider = await getGoogleProviderInstance();
            const { signInWithPopup } = await import("firebase/auth");
            await signInWithPopup(auth, provider);
        } catch (error) {
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: (error as Error).message,
            }));
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const auth = await getAuthInstance();
            const { signOut } = await import("firebase/auth");
            await signOut(auth);
        } catch (error) {
            setAuthState((prev) => ({
                ...prev,
                error: (error as Error).message,
            }));
        }
    }, []);

    return {
        user: auth_state.user,
        loading: auth_state.loading,
        error: auth_state.error,
        signInWithGoogle,
        logout,
        isAuthenticated: !!auth_state.user,
    };
}
