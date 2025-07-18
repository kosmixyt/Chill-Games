"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGameById } from "~/server/util";
import { useRouter } from "next/navigation";

// Types pour les joueurs
interface Player {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

interface SelectedPlayer extends Player {
  emoji: string;
}

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

function SelectedPlayerCard({
  player,
  onRemove,
}: {
  player: SelectedPlayer;
  onRemove: (id: number) => void;
}) {
  return (
    <div className="relative rounded-xl bg-white/10 p-6 transition-all duration-300 hover:bg-white/20">
      <div className="absolute -top-2 -right-2 text-4xl">{player.emoji}</div>

      <div className="mb-4">
        <h3 className="mb-2 text-xl font-bold text-white">{player.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => onRemove(player.id)}
            className="rounded-lg bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/30"
          >
            ➖ Retirer
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerSelectionModal({
  availablePlayers,
  isOpen,
  onClose,
  onSelect,
  onCreateNew,
  isCreating,
}: {
  availablePlayers: Player[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (player: Player) => void;
  onCreateNew: (name: string) => void;
  isCreating: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredPlayers = availablePlayers.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateNew = () => {
    if (newPlayerName.trim()) {
      onCreateNew(newPlayerName.trim());
      setNewPlayerName("");
      setShowCreateForm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-2xl rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Ajouter un joueur</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:bg-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        {/* Liste des joueurs */}
        <div className="mb-4 max-h-60 overflow-y-auto">
          {filteredPlayers.length > 0 ? (
            <div className="grid gap-2">
              {filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => onSelect(player)}
                  className="rounded-lg bg-white/10 p-3 text-left text-white transition-colors hover:bg-white/20"
                >
                  {player.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-gray-400">
              {searchTerm ? "Aucun joueur trouvé" : "Aucun joueur disponible"}
            </p>
          )}
        </div>

        {/* Créer nouveau joueur */}
        <div className="border-t border-white/10 pt-4">
          {showCreateForm ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom du nouveau joueur"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="w-full rounded-lg bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:bg-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNew();
                  if (e.key === "Escape") setShowCreateForm(false);
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateNew}
                  disabled={isCreating}
                  className="flex-1 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600 disabled:opacity-50"
                >
                  {isCreating ? "Création..." : "Créer"}
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 rounded-lg bg-gray-500 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full rounded-lg bg-purple-500 px-4 py-2 font-medium text-white transition-colors hover:bg-purple-600"
            >
              ➕ Créer un nouveau joueur
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const { data: session, status } = useSession();
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [savedPlayers, setSavedPlayers] = useState<SelectedPlayer[]>([]);
  const router = useRouter();

  // Charger tous les joueurs
  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/players");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const players = await response.json();
      setAllPlayers(players);
    } catch (err) {
      setError("Erreur lors du chargement des joueurs");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier s'il y a des joueurs sauvegardés
  const checkSavedPlayers = () => {
    try {
      const saved = localStorage.getItem("selectedPlayers");
      if (saved) {
        const parsedPlayers = JSON.parse(saved) as SelectedPlayer[];
        if (parsedPlayers.length > 0) {
          setSavedPlayers(parsedPlayers);
          setShowRestoreModal(true);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la lecture du localStorage:", error);
    }
  };

  // Sauvegarder les joueurs dans localStorage
  const savePlayersToLocalStorage = (players: SelectedPlayer[]) => {
    try {
      localStorage.setItem("selectedPlayers", JSON.stringify(players));
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde dans le localStorage:",
        error,
      );
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPlayers();
      checkSavedPlayers();
    }
  }, [status]);

  try {
    var Game = getGameById(
      parseInt(
        new URLSearchParams(window.location.search).get("gameId") ?? "0",
      ),
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du jeu :", error);
  }

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

  // Ajouter un joueur à la sélection
  const addPlayerToSelection = (player: Player) => {
    const randomEmoji =
      playerEmojis[Math.floor(Math.random() * playerEmojis.length)]!;
    const selectedPlayer: SelectedPlayer = { ...player, emoji: randomEmoji };
    const newSelection = [...selectedPlayers, selectedPlayer];
    setSelectedPlayers(newSelection);
    savePlayersToLocalStorage(newSelection);
    setIsModalOpen(false);
  };

  // Retirer un joueur de la sélection
  const removePlayerFromSelection = (playerId: number) => {
    const newSelection = selectedPlayers.filter((p) => p.id !== playerId);
    setSelectedPlayers(newSelection);
    savePlayersToLocalStorage(newSelection);
  };

  // Vider la sélection
  const clearSelection = () => {
    setSelectedPlayers([]);
    savePlayersToLocalStorage([]);
  };

  // Restaurer les joueurs sauvegardés
  const restoreSavedPlayers = () => {
    setSelectedPlayers(savedPlayers);
    setShowRestoreModal(false);
  };

  // Ignorer les joueurs sauvegardés
  const ignoreSavedPlayers = () => {
    localStorage.removeItem("selectedPlayers");
    setShowRestoreModal(false);
  };

  // Filtrer les joueurs disponibles (non sélectionnés)
  const availablePlayers = allPlayers.filter(
    (player) => !selectedPlayers.some((selected) => selected.id === player.id),
  );

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
          <div className="text-center">
            <div className="mb-4 text-4xl">🔒</div>
            <p className="text-xl text-gray-300">Connexion requise</p>
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
            👥 Sélection de Joueurs
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Sélectionnez les joueurs pour votre partie
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
                  {selectedPlayers.length}
                </div>
                <div className="text-sm text-gray-400">Sélectionnés</div>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 px-6 py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {allPlayers.length}
                </div>
                <div className="text-sm text-gray-400">Total disponible</div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:from-purple-600 hover:to-pink-600"
            >
              ➕ Ajouter un joueur
            </button>

            {selectedPlayers.length > 0 && (
              <button
                onClick={clearSelection}
                className="rounded-xl bg-red-500/20 px-6 py-3 font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/30 hover:text-red-200"
              >
                🗑️ Vider la sélection
              </button>
            )}
          </div>
        </div>

        {/* Grille des joueurs sélectionnés */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {selectedPlayers.map((player) => (
            <SelectedPlayerCard
              key={player.id}
              player={player}
              onRemove={removePlayerFromSelection}
            />
          ))}
        </div>

        {selectedPlayers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-2xl text-gray-400">
              Aucun joueur sélectionné pour le moment
            </p>
            <p className="mt-2 text-gray-500">
              Cliquez sur "Ajouter un joueur" pour commencer
            </p>
          </div>
        )}

        {/* Bouton Lancer la partie */}
        {selectedPlayers.length >= 2 && (
          <div className="mt-12 text-center">
            <button
              onClick={() => {
                router.push(Game!.href);
              }}
              className="cursor-pointer rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-12 py-4 text-xl font-bold shadow-xl transition-all duration-200 hover:scale-105 hover:from-green-600 hover:to-blue-600"
            >
              🎮 Lancer la partie ({selectedPlayers.length} joueurs)
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t border-white/10 pt-8 text-center">
          <p className="text-gray-400">Prêt pour une partie ! 🎮</p>
        </div>
      </div>

      {/* Modal de sélection */}
      <PlayerSelectionModal
        availablePlayers={availablePlayers}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={addPlayerToSelection}
        onCreateNew={createPlayer}
        isCreating={isCreating}
      />

      {/* Modal de restauration */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6">
            <div className="mb-6 text-center">
              <div className="mb-4 text-4xl">🎮</div>
              <h2 className="mb-2 text-2xl font-bold text-white">
                Joueurs sauvegardés trouvés !
              </h2>
              <p className="text-gray-300">
                Nous avons trouvé {savedPlayers.length} joueur
                {savedPlayers.length > 1 ? "s" : ""} sauvegardé
                {savedPlayers.length > 1 ? "s" : ""} de votre dernière partie.
              </p>
            </div>

            <div className="mb-6 max-h-40 overflow-y-auto rounded-lg bg-white/10 p-4">
              <div className="space-y-2">
                {savedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 text-white"
                  >
                    <span className="text-xl">{player.emoji}</span>
                    <span>{player.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={restoreSavedPlayers}
                className="flex-1 rounded-lg bg-green-500 px-4 py-3 font-medium text-white transition-colors hover:bg-green-600"
              >
                ✅ Réutiliser
              </button>
              <button
                onClick={ignoreSavedPlayers}
                className="flex-1 rounded-lg bg-gray-500 px-4 py-3 font-medium text-white transition-colors hover:bg-gray-600"
              >
                🆕 Recommencer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
