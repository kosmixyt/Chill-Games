import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./src/server/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protéger les routes de jeux
  if (pathname.startsWith("/play/")) {
    const session = await auth();

    // Si l'utilisateur n'est pas connecté, rediriger vers l'accueil
    if (!session?.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("error", "auth_required");
      return NextResponse.redirect(url);
    }
  }

  // Protéger les routes de gestion des joueurs
  if (pathname.startsWith("/players")) {
    const session = await auth();

    // Si l'utilisateur n'est pas connecté, rediriger vers l'API auth signin
    if (!session?.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/api/auth/signin";
      url.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(url);
    }
  }

  // Protéger les routes API de jeux
  if (pathname.startsWith("/api/games/")) {
    const session = await auth();

    // Si l'utilisateur n'est pas connecté, retourner 401
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé. Authentification requise." },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Matcher pour les routes à protéger
  matcher: ["/play/:path*", "/players/:path*", "/players", "/api/games/:path*"],
};
