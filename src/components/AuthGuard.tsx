"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  gameType: "action-ou-verite" | "undercover";
  requiredPlayers?: number;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAccess: boolean;
  error: string | null;
  playerCount?: number;
}

export default function AuthGuard({
  children,
  gameType,
  requiredPlayers = 1,
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    hasAccess: false,
    error: null,
  });

  useEffect(() => {
    const checkAccess = async () => {
      // Si la session est en cours de chargement, attendre
      if (status === "loading") {
        return;
      }

      // Si pas de session, rediriger vers la page d'accueil
      if (status === "unauthenticated" || !session) {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          hasAccess: false,
          error: "Vous devez être connecté pour accéder à ce jeu.",
        });
        setTimeout(() => {
          router.push("/");
        }, 2000);
        return;
      }

      // Vérifier l'accès au jeu via l'API
      try {
        const response = await fetch(`/api/games/${gameType}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            hasAccess: true,
            error: null,
            playerCount: data.playerCount,
          });
        } else {
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            hasAccess: false,
            error: data.error || "Accès refusé au jeu",
            playerCount: data.currentPlayers,
          });

          // Si l'utilisateur n'a pas assez de joueurs, rediriger vers la gestion des joueurs
          if (data.requiresPlayers) {
            setTimeout(() => {
              router.push("/players/manage");
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification d'accès:", error);
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          hasAccess: false,
          error: "Erreur lors de la vérification des permissions",
        });
      }
    };

    checkAccess();
  }, [session, status, router, gameType]);

  // Écran de chargement
  if (authState.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Vérification des permissions...
          </h2>
          <p className="text-gray-300">Nous vérifions votre accès au jeu</p>
        </div>
      </div>
    );
  }

  // Écran d'erreur d'authentification
  if (!authState.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900">
        <div className="mx-auto max-w-md p-8 text-center">
          <div className="mb-4 text-6xl">🔒</div>
          <h1 className="mb-4 text-3xl font-bold text-white">
            Accès restreint
          </h1>
          <p className="mb-6 text-gray-300">{authState.error}</p>
          <p className="text-sm text-gray-400">
            Vous allez être redirigé vers la page d'accueil...
          </p>
        </div>
      </div>
    );
  }

  // Écran d'erreur d'accès au jeu
  if (!authState.hasAccess) {
    const isPlayerRequirementError = authState.error?.includes("joueur");

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-900 via-red-900 to-purple-900">
        <div className="mx-auto max-w-md p-8 text-center">
          <div className="mb-4 text-6xl">
            {isPlayerRequirementError ? "👥" : "❌"}
          </div>
          <h1 className="mb-4 text-3xl font-bold text-white">
            {isPlayerRequirementError ? "Joueurs requis" : "Accès refusé"}
          </h1>
          <p className="mb-6 text-gray-300">{authState.error}</p>

          {isPlayerRequirementError && (
            <div className="mb-6 rounded-lg bg-white/10 p-4">
              <p className="text-sm text-white">
                {authState.playerCount !== undefined && (
                  <>
                    Joueurs actuels: {authState.playerCount}
                    <br />
                  </>
                )}
                Minimum requis: {requiredPlayers}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={() => router.push("/players/manage")}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
            >
              Gérer mes joueurs
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-gray-600 px-6 py-2 font-bold text-white transition-colors hover:bg-gray-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si tout va bien, afficher le jeu
  return <>{children}</>;
}
