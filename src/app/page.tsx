"use client";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { auth } from "~/server/auth";
import { games } from "~/server/util";
import { useAuth } from "~/hooks/useAuth";

// Types pour les jeux
interface Game {
  id: number;
  name: string;
  description: string;
  players: string;
  duration: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  category: "Ambiance" | "Stratégie" | "Party" | "Coopératif" | "Bluff";
  emoji: string;
}

function GameCard({
  game,
  isSelected,
  onSelect,
}: {
  game: Game;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const difficultyColors = {
    Facile: "bg-green-500/20 text-green-300",
    Moyen: "bg-yellow-500/20 text-yellow-300",
    Difficile: "bg-red-500/20 text-red-300",
  };

  const categoryColors = {
    Ambiance: "bg-pink-500/20 text-pink-300",
    Stratégie: "bg-blue-500/20 text-blue-300",
    Party: "bg-purple-500/20 text-purple-300",
    Coopératif: "bg-green-500/20 text-green-300",
    Bluff: "bg-orange-500/20 text-orange-300",
  };

  return (
    <div
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 hover:scale-105 ${
        isSelected
          ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30 ring-2 ring-purple-400"
          : "bg-white/10 hover:bg-white/20"
      } `}
    >
      <div className="absolute -top-2 -right-2 text-4xl">{game.emoji}</div>

      <div className="mb-4">
        <h3 className="mb-2 text-xl font-bold text-white">{game.name}</h3>
        <p className="text-sm leading-relaxed text-gray-300">
          {game.description}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2 text-sm">
          <span className="text-gray-400">👥</span>
          <span className="text-white">{game.players} joueurs</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-gray-400">⏱️</span>
          <span className="text-white">{game.duration}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${difficultyColors[game.difficulty]}`}
        >
          {game.difficulty}
        </span>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${categoryColors[game.category]}`}
        >
          {game.category}
        </span>
      </div>

      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
          <div className="rounded-full bg-white/20 p-2">
            <span className="text-2xl">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tous");
  const [authError, setAuthError] = useState<string | null>(null);
  const { isLoading, isAuthenticated, user } = useAuth();

  // Vérifier les paramètres d'URL pour les erreurs d'authentification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error === "auth_required") {
      setAuthError("Vous devez être connecté pour accéder aux jeux.");
      // Nettoyer l'URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());

      // Masquer l'erreur après 5 secondes
      setTimeout(() => setAuthError(null), 5000);
    }
  }, []);

  const categories = [
    "Tous",
    "Ambiance",
    "Stratégie",
    "Party",
    "Coopératif",
    "Bluff",
  ];

  const filteredGames =
    selectedCategory === "Tous"
      ? games
      : games.filter((game) => game.category === selectedCategory);

  const getRandomGame = () => {
    if (filteredGames.length === 0) return;
    const randomGame =
      filteredGames[Math.floor(Math.random() * filteredGames.length)];
    if (randomGame) {
      redirect(`/game/${randomGame.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Message d'erreur d'authentification */}
        {authError && (
          <div className="mx-auto mb-6 max-w-md">
            <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-center">
              <div className="text-sm font-medium text-red-400">
                🔒 {authError}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-6xl font-extrabold text-transparent">
            🎲 Chill Games
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-300">
            Découvrez et sélectionnez les meilleurs jeux pour animer vos soirées
            entre amis
          </p>
        </div>

        {/* Section d'authentification */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-xl bg-white/10 p-4">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent"></div>
                <span className="text-gray-300">Chargement...</span>
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name || "Avatar"}
                      className="h-8 w-8 rounded-full border-2 border-green-400"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-sm font-semibold text-white">
                      {user?.name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      Connecté en tant que {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      ✅ Accès à tous les jeux
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="cursor-pointer rounded-lg bg-red-500/20 px-3 py-1 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/30 hover:text-red-200"
                >
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-600"></div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Non connecté
                    </p>
                    <p className="text-xs text-gray-400">
                      🔒 Accès limité aux jeux
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => signIn("google")}
                    className="cursor-pointer rounded-lg bg-blue-500/20 px-3 py-1 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/30 hover:text-blue-200"
                  >
                    Google
                  </button>
                  <button
                    onClick={() => signIn("discord")}
                    className="cursor-pointer rounded-lg bg-indigo-500/20 px-3 py-1 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/30 hover:text-indigo-200"
                  >
                    Discord
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filtres et actions */}
        <div className="mb-8">
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`cursor-pointer rounded-full px-4 py-2 font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                } `}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mb-8 flex justify-center gap-4">
            <button
              onClick={getRandomGame}
              className="transform cursor-pointer rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl"
            >
              🎲 Jeu au hasard
            </button>
          </div>
        </div>

        {/* Sélection actuelle */}
        {/* Grille des jeux */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              isSelected={false}
              onSelect={() => {
                redirect(`/game/${game.id}`);
              }}
            />
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-2xl text-gray-400">
              Aucun jeu trouvé pour cette catégorie
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 border-t border-white/10 pt-8 text-center">
          <p className="text-gray-400">Amusez-vous bien ! 🎉</p>
        </div>
      </div>
    </main>
  );
}
