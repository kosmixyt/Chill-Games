import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// GET - Récupérer tous les joueurs de l'utilisateur
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const players = await db.gamePlayer.findMany({
      where: {
        ownerId: session.user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau joueur
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Le nom du joueur est requis" },
        { status: 400 },
      );
    }

    // Vérifier si un joueur avec ce nom existe déjà pour cet utilisateur
    const existingPlayer = await db.gamePlayer.findFirst({
      where: {
        name: name.trim(),
        ownerId: session.user.id,
      },
    });

    if (existingPlayer) {
      return NextResponse.json(
        { error: "Un joueur avec ce nom existe déjà" },
        { status: 409 },
      );
    }

    const player = await db.gamePlayer.create({
      data: {
        name: name.trim(),
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du joueur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
