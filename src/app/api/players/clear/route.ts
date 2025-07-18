import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

// DELETE - Supprimer tous les joueurs de l'utilisateur
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await db.gamePlayer.deleteMany({
      where: {
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de tous les joueurs:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
