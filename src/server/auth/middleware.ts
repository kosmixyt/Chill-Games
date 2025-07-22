import { NextRequest, NextResponse } from "next/server";
import { auth } from "./index";

/**
 * Middleware d'authentification pour les routes API
 * Vérifie que l'utilisateur est connecté avant d'autoriser l'accès
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        error:
          "Non autorisé. Vous devez être connecté pour accéder à cette ressource.",
      },
      { status: 401 },
    );
  }

  return { session, user: session.user };
}

/**
 * Type guard pour vérifier l'authentification
 */
export function isAuthenticated(
  result: NextResponse | { session: any; user: any },
): result is { session: any; user: any } {
  return "session" in result;
}
