"use client";
import { useState } from "react";
import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { games } from "~/server/util";

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
