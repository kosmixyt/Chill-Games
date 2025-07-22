import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthenticated } from "~/server/auth/middleware";
import {
  validateGameAccess,
  validatePlayerOwnership,
} from "~/server/auth/validation";
import { db } from "~/server/db";
import { readFile } from "fs/promises";
import { join } from "path";

// GET - Vérifier l'accès au jeu Action ou Vérité
export async function GET() {
  try {
    const authResult = await requireAuth();

    if (!isAuthenticated(authResult)) {
      return authResult; // Retourne la réponse d'erreur 401
    }

    const { user } = authResult;

    // Valider l'accès au jeu
    const validation = await validateGameAccess(user.id, "action-ou-verite");

    if (!validation.hasAccess) {
      return NextResponse.json(
        {
          error: validation.message,
          requiresPlayers: true,
          minimumPlayers: validation.minimumPlayers,
          currentPlayers: validation.playerCount,
        },
        { status: 403 },
      );
    }

    // Charger les données du jeu
    try {
      const filePath = join(
        process.cwd(),
        "public",
        "data",
        "actionouverite.json",
      );
      const fileContent = await readFile(filePath, "utf-8");
      const gameData = JSON.parse(fileContent);

      return NextResponse.json({
        success: true,
        gameData,
        playerCount: validation.playerCount,
        message: "Accès autorisé au jeu Action ou Vérité",
      });
    } catch (fileError) {
      console.error("Erreur lors du chargement des données du jeu:", fileError);
      return NextResponse.json(
        { error: "Impossible de charger les données du jeu" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Erreur lors de la vérification d'accès au jeu:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Enregistrer une session de jeu Action ou Vérité
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();

    if (!isAuthenticated(authResult)) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { difficulty, playerIds, challengesPlayed } = body;

    // Valider les données
    if (
      !difficulty ||
      !playerIds ||
      !Array.isArray(playerIds) ||
      playerIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Données de jeu invalides" },
        { status: 400 },
      );
    }

    // Valider que tous les joueurs appartiennent à l'utilisateur
    const ownershipValidation = await validatePlayerOwnership(
      user.id,
      playerIds,
    );

    if (!ownershipValidation.isValid) {
      return NextResponse.json(
        { error: ownershipValidation.message },
        { status: 403 },
      );
    }

    // Ici, vous pourriez enregistrer la session de jeu dans la base de données
    // Pour l'instant, nous retournons simplement une confirmation

    return NextResponse.json({
      success: true,
      message: "Session de jeu enregistrée",
      sessionData: {
        gameType: "action-ou-verite",
        difficulty,
        playersCount: playerIds.length,
        challengesPlayed: challengesPlayed || 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la session:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
