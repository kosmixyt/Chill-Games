"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { Game } from "~/server/util";
import { getGameById } from "~/server/util";

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = parseInt(params.id as string);
  const game = getGameById(gameId);

  const [showRules, setShowRules] = useState(false);

  if (!game) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">Jeu non trouvé</h1>
          <button
            onClick={() => router.back()}
            className="rounded-xl bg-purple-500 px-6 py-3 font-semibold transition-all duration-200 hover:bg-purple-600"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    Facile: "bg-green-500/20 text-green-300 border-green-500/30",
    Moyen: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    Difficile: "bg-red-500/20 text-red-300 border-red-500/30",
  };

  const categoryColors = {
    Ambiance: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    Stratégie: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    Party: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    Coopératif: "bg-green-500/20 text-green-300 border-green-500/30",
    Bluff: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="mb-6 flex cursor-pointer items-center gap-2 text-gray-300 transition-colors duration-200 hover:text-white"
          >
            <span className="text-xl">←</span>
            <span className="">Retour à la sélection</span>
          </button>
        </div>

        {/* Carte principale du jeu */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-white/10 p-8">
          {/* Emoji en arrière-plan */}
          <div className="absolute top-4 right-4 text-8xl opacity-20">
            {game.emoji}
          </div>

          {/* Contenu principal */}
          <div className="relative z-10">
            <div className="mb-6 flex items-start gap-4">
              <span className="text-6xl">{game.emoji}</span>
              <div className="flex-1">
                <h1 className="mb-2 text-4xl font-bold text-white">
                  {game.name}
                </h1>
                <p className="text-xl leading-relaxed text-gray-300">
                  {game.description}
                </p>
              </div>
            </div>

            {/* Informations du jeu */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="mb-2 text-3xl">👥</div>
                <div className="mb-1 text-sm text-gray-400">Joueurs</div>
                <div className="text-lg font-semibold text-white">
                  {game.players}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="mb-2 text-3xl">⏱️</div>
                <div className="mb-1 text-sm text-gray-400">Durée</div>
                <div className="text-lg font-semibold text-white">
                  {game.duration}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 p-4 text-center">
                <div className="mb-2 text-3xl">🎯</div>
                <div className="mb-1 text-sm text-gray-400">Difficulté</div>
                <div className="text-lg font-semibold text-white">
                  {game.difficulty}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-8 flex gap-3">
              <span
                className={`rounded-full border px-4 py-2 text-sm font-medium ${difficultyColors[game.difficulty]}`}
              >
                {game.difficulty}
              </span>
              <span
                className={`rounded-full border px-4 py-2 text-sm font-medium ${categoryColors[game.category]}`}
              >
                {game.category}
              </span>
            </div>
          </div>
        </div>

        {/* Règles du jeu */}
        {game.rules && (
          <div className="mb-6 rounded-2xl bg-white/10 p-6">
            <button
              onClick={() => setShowRules(!showRules)}
              className="flex w-full cursor-pointer items-center justify-between text-left"
            >
              <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
                📋 Règles du jeu
              </h2>
              <span
                className={`text-2xl transition-transform duration-200 ${showRules ? "rotate-180" : ""}`}
              >
                ⌄
              </span>
            </button>

            {showRules && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-lg leading-relaxed text-gray-300">
                  {game.rules}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Matériel nécessaire */}
        {game.materials && (
          <div className="mb-6 rounded-2xl bg-white/10 p-6">
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-white">
              🎒 Matériel nécessaire
            </h2>
            <ul className="space-y-2">
              {game.materials.map((material, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <span className="text-purple-400">•</span>
                  <span className="text-lg">{material}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conseils */}
        {game.tips && (
          <div className="mb-8 rounded-2xl bg-white/10 p-6">
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-white">
              💡 Conseils pour bien jouer
            </h2>
            <ul className="space-y-3">
              {game.tips.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-300"
                >
                  <span className="mt-1 text-yellow-400">💡</span>
                  <span className="text-lg leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer rounded-xl bg-gray-600 px-8 py-3 font-semibold transition-all duration-200 hover:bg-gray-700"
          >
            ← Retour
          </button>
          <button
            onClick={() => router.push("/players?gameId=" + gameId)}
            className="cursor-pointer rounded-xl bg-purple-600 px-8 py-3 font-semibold transition-all duration-200 hover:bg-purple-700"
          >
            ▶️ Jouer
          </button>
        </div>
      </div>
    </div>
  );
}
