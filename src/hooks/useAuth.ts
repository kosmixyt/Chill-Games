"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
  error: string | null;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
  });

  useEffect(() => {
    if (status === "loading") {
      setAuthState({
        isLoading: true,
        isAuthenticated: false,
        user: null,
        error: null,
      });
    } else if (status === "authenticated" && session) {
      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        user: session.user,
        error: null,
      });
    } else {
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: "Non connecté",
      });
    }
  }, [session, status]);

  return authState;
}

export function useRequireAuth() {
  const authState = useAuth();

  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      // Optionnellement, rediriger vers la page de connexion
      console.warn("Authentification requise");
    }
  }, [authState]);

  return authState;
}
