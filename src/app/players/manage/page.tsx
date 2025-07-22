"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import type { GamePlayer } from "@prisma/client";

// Types pour les joueurs
// interface Player {
//   id: number;
//   name: string;
//   createdAt: string;
//   updatedAt: string;
//   ownerId: string;
// }

// Emojis pour les joueurs
const playerEmojis = [
  "👤",
  "🧑",
  "👩",
  "🧔",
  "👨",
  "🙋",
  "🙎",
  "🙍",
  "👱",
  "🧓",
];

function PlayerCard({
  player,
  onEdit,
  onDelete,
  isEditing,
  isDeleting,
}: {
  player: GamePlayer;
  onEdit: (id: number, newName: string) => void;
  onDelete: (id: number) => void;
  isEditing: boolean;
  isDeleting: boolean;
}) {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [editName, setEditName] = useState(player.name);
  const randomEmoji = playerEmojis[player.id % playerEmojis.length];

  const handleSave = () => {
    if (editName.trim() && editName.trim() !== player.name) {
      onEdit(player.id, editName.trim());
    }
    setIsEditingLocal(false);
  };

  const handleCancel = () => {
    setEditName(player.name);
    setIsEditingLocal(false);
  };

  return (
    <div className="relative rounded-xl bg-white/10 p-6 transition-all duration-300 hover:bg-white/20">
      <div className="absolute -top-2 -right-2 text-4xl">{randomEmoji}</div>

      <div className="mb-4">
        {isEditingLocal ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:bg-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="Nom du joueur"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isEditing}
                className="flex-1 rounded-lg bg-green-500 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
              >
                {isEditing ? "Sauvegarde..." : "✓ Sauver"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isEditing}
                className="flex-1 rounded-lg bg-gray-500 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
              >
                ✕ Annuler
              </button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="mb-2 text-xl font-bold text-white">{player.name}</h3>
            <p className="mb-4 text-sm text-gray-400">
              Créé le {new Date(player.createdAt).toLocaleDateString("fr-FR")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingLocal(true)}
                disabled={isEditing || isDeleting}
                className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/30 disabled:opacity-50"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() => onDelete(player.id)}
                disabled={isEditing || isDeleting}
                className="rounded-lg bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/30 disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "🗑️ Supprimer"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AddPlayerCard({
  onAdd,
  isCreating,
}: {
  onAdd: (name: string) => void;
  isCreating: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim());
      setNewName("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewName("");
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="rounded-xl bg-white/10 p-6 transition-all duration-300">
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white">Nouveau joueur</h3>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-gray-400 focus:bg-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            placeholder="Nom du joueur"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={isCreating}
              className="flex-1 rounded-lg bg-green-500 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
            >
              {isCreating ? "Création..." : "✓ Ajouter"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isCreating}
              className="flex-1 rounded-lg bg-gray-500 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
            >
              ✕ Annuler
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsAdding(true)}
      className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/30 bg-white/5 p-6 transition-all duration-300 hover:border-white/50 hover:bg-white/10"
    >
      <div className="text-center">
        <div className="mb-2 text-4xl">➕</div>
        <h3 className="text-lg font-semibold text-white">Ajouter un joueur</h3>
        <p className="text-sm text-gray-400">Cliquez pour ajouter</p>
      </div>
    </div>
  );
}

export default function ManagePlayersPage() {
  const { data: session, status } = useSession();
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les joueurs
  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/players");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const players = await response.json();
      setPlayers(players);
    } catch (err) {
      setError("Erreur lors du chargement des joueurs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      // Rediriger vers la page de connexion avec un paramètre de redirection
      signIn(undefined, { callbackUrl: window.location.href });
      return;
    }

    if (status === "authenticated") {
      fetchPlayers();
    }
  }, [status]);

  // Créer un nouveau joueur
  const createPlayer = async (name: string) => {
    try {
      setIsCreating(true);
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création");
      }

      await fetchPlayers(); // Recharger la liste
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Modifier un joueur
  const editPlayer = async (id: number, newName: string) => {
    try {
      setEditingId(id);
      const response = await fetch(`/api/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la modification");
      }

      await fetchPlayers(); // Recharger la liste
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de modification");
      console.error(err);
    } finally {
      setEditingId(null);
    }
  };

  // Supprimer un joueur
  const deletePlayer = async (id: number) => {
    try {
      setDeletingId(id);
      const response = await fetch(`/api/players/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }

      await fetchPlayers(); // Recharger la liste
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de suppression");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Supprimer tous les joueurs
  const clearAllPlayers = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer tous les joueurs ?"))
      return;

    try {
      const response = await fetch("/api/players/clear", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la suppression");
      }

      await fetchPlayers(); // Recharger la liste
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de suppression");
      console.error(err);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-4xl">⏳</div>
            <p className="text-xl text-gray-300">Chargement...</p>
          </div>
        </div>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="mx-auto max-w-md p-8 text-center">
            <div className="mb-6 text-6xl">🔒</div>
            <h1 className="mb-4 text-3xl font-bold text-white">
              Connexion requise
            </h1>
            <p className="mb-6 text-gray-300">
              Vous devez être connecté pour gérer vos joueurs.
            </p>
            <p className="mb-4 text-sm text-gray-400">
              Redirection vers la page de connexion...
            </p>
            <button
              onClick={() =>
                signIn(undefined, { callbackUrl: window.location.href })
              }
              className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-700"
            >
              Se connecter maintenant
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-6xl font-extrabold text-transparent">
            👥 Gestionnaire de Joueurs
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Gérez votre liste de joueurs pour vos parties
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/20 p-4 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-200 hover:text-white"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Stats et actions */}
        <div className="mb-8">
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <div className="rounded-xl bg-white/10 px-6 py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {players.length}
                </div>
                <div className="text-sm text-gray-400">Joueurs</div>
              </div>
            </div>

            {players.length > 0 && (
              <button
                onClick={clearAllPlayers}
                className="rounded-xl bg-red-500/20 px-6 py-3 font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/30 hover:text-red-200"
              >
                🗑️ Supprimer tout
              </button>
            )}
          </div>
        </div>

        {/* Grille des joueurs */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onEdit={editPlayer}
              onDelete={deletePlayer}
              isEditing={editingId === player.id}
              isDeleting={deletingId === player.id}
            />
          ))}
          <AddPlayerCard onAdd={createPlayer} isCreating={isCreating} />
        </div>

        {players.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-2xl text-gray-400">
              Aucun joueur ajouté pour le moment
            </p>
            <p className="mt-2 text-gray-500">
              Cliquez sur "Ajouter un joueur" pour commencer
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t border-white/10 pt-8 text-center">
          <p className="text-gray-400">Prêt pour une partie ! 🎮</p>
        </div>
      </div>
    </main>
  );
}
