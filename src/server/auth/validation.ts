import { db } from "~/server/db";

/**
 * Valide que l'utilisateur a suffisamment de joueurs pour un jeu donné
 */
export async function validateGameAccess(
  userId: string,
  gameType: "action-ou-verite" | "undercover",
) {
  const minimumPlayers = gameType === "undercover" ? 3 : 1;

  const playerCount = await db.gamePlayer.count({
    where: {
      ownerId: userId,
    },
  });

  return {
    hasAccess: playerCount >= minimumPlayers,
    playerCount,
    minimumPlayers,
    message:
      playerCount >= minimumPlayers
        ? "Accès autorisé"
        : `Vous devez avoir au moins ${minimumPlayers} joueur(s) pour jouer à ce jeu. Vous en avez actuellement ${playerCount}.`,
  };
}

/**
 * Valide que tous les joueurs spécifiés appartiennent à l'utilisateur
 */
export async function validatePlayerOwnership(
  userId: string,
  playerIds: number[],
) {
  const ownedPlayers = await db.gamePlayer.findMany({
    where: {
      id: { in: playerIds },
      ownerId: userId,
    },
  });

  const unauthorizedPlayers = playerIds.filter(
    (id) => !ownedPlayers.some((player) => player.id === id),
  );

  return {
    isValid: unauthorizedPlayers.length === 0,
    ownedPlayers,
    unauthorizedPlayers,
    message:
      unauthorizedPlayers.length === 0
        ? "Tous les joueurs sont autorisés"
        : `Joueurs non autorisés: ${unauthorizedPlayers.join(", ")}`,
  };
}

/**
 * Types pour les résultats de validation
 */
export interface GameAccessValidation {
  hasAccess: boolean;
  playerCount: number;
  minimumPlayers: number;
  message: string;
}

export interface PlayerOwnershipValidation {
  isValid: boolean;
  ownedPlayers: any[];
  unauthorizedPlayers: number[];
  message: string;
}
