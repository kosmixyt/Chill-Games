import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// PUT - Modifier un joueur
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const playerId = parseInt((await context.params).id);
    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: "ID de joueur invalide" },
        { status: 400 },
      );
    }

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Le nom du joueur est requis" },
        { status: 400 },
      );
    }

    // Vérifier que le joueur appartient à l'utilisateur
    const existingPlayer = await db.gamePlayer.findFirst({
      where: {
        id: playerId,
        ownerId: session.user.id,
      },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 });
    }

    // Vérifier si un autre joueur avec ce nom existe déjà
    const duplicatePlayer = await db.gamePlayer.findFirst({
      where: {
        name: name.trim(),
        ownerId: session.user.id,
        id: { not: playerId },
      },
    });

    if (duplicatePlayer) {
      return NextResponse.json(
        { error: "Un autre joueur avec ce nom existe déjà" },
        { status: 409 },
      );
    }

    const updatedPlayer = await db.gamePlayer.update({
      where: { id: playerId },
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedPlayer);
  } catch (error) {
    console.error("Erreur lors de la modification du joueur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un joueur
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const playerId = parseInt((await context.params).id);
    if (isNaN(playerId)) {
      return NextResponse.json(
        { error: "ID de joueur invalide" },
        { status: 400 },
      );
    }

    // Vérifier que le joueur appartient à l'utilisateur
    const existingPlayer = await db.gamePlayer.findFirst({
      where: {
        id: playerId,
        ownerId: session.user.id,
      },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Joueur non trouvé" }, { status: 404 });
    }

    await db.gamePlayer.delete({
      where: { id: playerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du joueur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
