// Firebase Authentication 훅
import { useState, useEffect } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider } from "./config";

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: (error as Error).message,
      }));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: (error as Error).message,
      }));
    }
  };

  return {
    user: auth_state.user,
    loading: auth_state.loading,
    error: auth_state.error,
    signInWithGoogle,
    logout,
    isAuthenticated: !!auth_state.user,
  };
}
