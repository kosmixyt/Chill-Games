"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Navigation, Pagination } from "swiper/modules";
import AuthGuard from "~/components/AuthGuard";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Types
interface SelectedPlayer {
  id: number;
  name: string;
  emoji: string;
}

interface Challenge {
  id: number;
  text: string;
}

interface GameData {
  facile: {
    actions: Challenge[];
    verites: Challenge[];
  };
  moyen: {
    actions: Challenge[];
    verites: Challenge[];
  };
  difficile: {
    actions: Challenge[];
    verites: Challenge[];
  };
}

function ActionOuVeriteGame() {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<SelectedPlayer[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<
    | (Challenge & {
        type: "action" | "verite";
        difficulty: "facile" | "moyen" | "difficile";
      })
    | null
  >(null);
  const [difficulty, setDifficulty] = useState<
    "facile" | "moyen" | "difficile"
  >("facile");
  const [usedChallenges, setUsedChallenges] = useState<{
    [key: string]: number[];
  }>({
    facile_actions: [],
    facile_verites: [],
    moyen_actions: [],
    moyen_verites: [],
    difficile_actions: [],
    difficile_verites: [],
  });
  const [waitingForChoice, setWaitingForChoice] = useState(false);
  const [challengesPlayed, setChallengesPlayed] = useState(0);
  const router = useRouter();

  // Charger les données de jeu et les joueurs depuis l'API protégée
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Charger les données depuis l'API protégée
        const response = await fetch("/api/games/action-ou-verite");
        if (response.ok) {
          const data = await response.json();
          setGameData(data.gameData);
        } else {
          console.error("Erreur lors du chargement des données de jeu");
          const errorData = await response.json();
          console.error("Détails de l'erreur:", errorData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données de jeu:", error);
      }
    };

    const loadPlayers = async () => {
      try {
        // Charger les joueurs depuis l'API
        const response = await fetch("/api/players");
        if (response.ok) {
          const playersData = await response.json();
          if (playersData.length >= 1) {
            setPlayers(playersData);
          } else {
            router.push("/players/manage");
          }
        } else {
          console.error("Erreur lors du chargement des joueurs");
          router.push("/players/manage");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des joueurs:", error);
        router.push("/players/manage");
      }
    };

    if (session) {
      loadGameData();
      loadPlayers();
    }
  }, [session, router]);

  // Enregistrer une session de jeu
  const saveGameSession = async () => {
    try {
      const playerIds = players.map((p) => p.id);
      const response = await fetch("/api/games/action-ou-verite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty,
          playerIds,
          challengesPlayed,
        }),
      });

      if (response.ok) {
        console.log("Session de jeu enregistrée avec succès");
      } else {
        console.error("Erreur lors de l'enregistrement de la session");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la session:", error);
    }
  };

  // Générer un défi selon le type choisi
  const generateChallenge = (type: "action" | "verite") => {
    if (!gameData) {
      console.error("Les données de jeu ne sont pas encore chargées");
      return;
    }

    const key = `${difficulty}_${type}s` as keyof typeof usedChallenges;
    const availableChallenges =
      gameData[difficulty][type === "action" ? "actions" : "verites"];
    const usedIds = usedChallenges[key] || [];

    const unusedChallenges = availableChallenges.filter(
      (challenge) => !usedIds.includes(challenge.id),
    );

    let selectedChallenge: Challenge;
    let newUsedChallenges = { ...usedChallenges };

    if (unusedChallenges.length === 0) {
      // Réinitialiser si tous les défis ont été utilisés
      newUsedChallenges[key] = [];
      selectedChallenge =
        availableChallenges[
          Math.floor(Math.random() * availableChallenges.length)
        ]!;
    } else {
      selectedChallenge =
        unusedChallenges[Math.floor(Math.random() * unusedChallenges.length)]!;
    }

    // Ajouter le défi aux utilisés
    newUsedChallenges[key] = [
      ...(newUsedChallenges[key] || []),
      selectedChallenge.id,
    ];
    setUsedChallenges(newUsedChallenges);

    setCurrentChallenge({
      ...selectedChallenge,
      type,
      difficulty,
    });
    setWaitingForChoice(false);
    setChallengesPlayed((prev) => prev + 1);
  };

  // Démarrer le jeu
  const startGame = () => {
    setGameStarted(true);
    setWaitingForChoice(true);
  };

  // Passer au joueur suivant
  const nextPlayer = () => {
    setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    setWaitingForChoice(true);
    setCurrentChallenge(null);
  };

  // Obtenir le prochain joueur
  const getNextPlayer = () => {
    return players[(currentPlayerIndex + 1) % players.length];
  };

  // Calculer le nombre total de défis utilisés
  const getTotalUsedChallenges = () => {
    return Object.values(usedChallenges).reduce(
      (total, arr) => total + arr.length,
      0,
    );
  };

  // Couleurs par difficulté
  const difficultyColors = {
    facile: "from-green-500 to-emerald-600",
    moyen: "from-yellow-500 to-orange-500",
    difficile: "from-red-500 to-pink-600",
  };

  // Couleurs par type
  const typeColors = {
    action: "from-purple-500 to-indigo-600",
    verite: "from-blue-500 to-cyan-600",
  };

  if (players.length === 0 || !gameData) {
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

  if (!gameStarted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-6xl font-extrabold text-transparent">
              🎭 Action ou Vérité
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-gray-300">
              Préparez-vous pour une partie mémorable !
            </p>
          </div>

          {/* Joueurs */}
          <div className="mb-12">
            <h2 className="mb-6 text-center text-2xl font-bold text-white">
              Joueurs ({players.length})
            </h2>
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`rounded-xl bg-white/10 p-4 text-center transition-all duration-300 ${
                    index === currentPlayerIndex ? "ring-2 ring-purple-400" : ""
                  }`}
                >
                  <div className="mb-2 text-3xl">{player.emoji}</div>
                  <div className="font-semibold text-white">{player.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Paramètres */}
          <div className="mx-auto max-w-2xl space-y-8">
            {/* Difficulté */}
            <div>
              <h3 className="mb-4 text-center text-xl font-bold text-white">
                Difficulté
              </h3>
              <div className="flex gap-3">
                {(["facile", "moyen", "difficile"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 rounded-xl px-6 py-3 font-semibold transition-all duration-200 ${
                      difficulty === diff
                        ? `bg-gradient-to-r ${difficultyColors[diff]} text-white`
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Type de défi - Supprimé car maintenant choisi à chaque tour */}

            {/* Bouton démarrer */}
            <div className="text-center">
              <button
                onClick={startGame}
                className="transform rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-12 py-4 text-xl font-bold shadow-xl transition-all duration-200 hover:scale-105 hover:from-purple-600 hover:to-pink-600"
              >
                🚀 Commencer la partie
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white">
      {/* Bouton accueil en haut à gauche */}
      <button
        onClick={async () => {
          if (challengesPlayed > 0) {
            await saveGameSession();
          }
          router.push("/");
        }}
        className="absolute top-4 left-4 z-10 rounded-lg bg-gradient-to-r from-gray-500 to-gray-600 px-3 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
      >
        🏠
      </button>

      <div className="container mx-auto px-4 py-4">
        {/* Header compact */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-3xl">
            {players[currentPlayerIndex]?.emoji}
          </div>
          <h2 className="text-xl font-bold text-white">
            {players[currentPlayerIndex]?.name}
          </h2>
        </div>

        {/* Sélection Action ou Vérité pour démarrer */}
        {waitingForChoice && !currentChallenge && (
          <div className="mx-auto mb-6 max-w-sm">
            <h3 className="mb-4 text-center text-lg font-bold text-white">
              Choisis ton défi :
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => generateChallenge("action")}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 font-semibold transition-all duration-200 hover:scale-105"
              >
                🎭 Action
              </button>
              <button
                onClick={() => generateChallenge("verite")}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3 font-semibold transition-all duration-200 hover:scale-105"
              >
                ❓ Vérité
              </button>
            </div>
          </div>
        )}

        {/* Carte du défi - plus compacte */}
        {currentChallenge && (
          <div className="mx-auto mb-6 max-w-sm">
            <div
              className={`w-full rounded-2xl bg-gradient-to-br ${
                currentChallenge.type === "action"
                  ? typeColors.action
                  : typeColors.verite
              } flex min-h-[280px] flex-col items-center justify-center p-6 text-center shadow-2xl`}
            >
              <div className="mb-4 text-5xl">
                {currentChallenge.type === "action" ? "🎭" : "❓"}
              </div>

              <div className="mb-3">
                <span
                  className={`rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wider uppercase`}
                >
                  {currentChallenge.type === "action" ? "Action" : "Vérité"}
                </span>
              </div>

              <h3 className="mb-4 text-lg leading-relaxed font-bold text-white">
                {currentChallenge.text}
              </h3>

              <div
                className={`rounded-full bg-white/20 px-2 py-1 text-xs font-medium ${
                  currentChallenge.difficulty === "facile"
                    ? "text-green-200"
                    : currentChallenge.difficulty === "moyen"
                      ? "text-yellow-200"
                      : "text-red-200"
                }`}
              >
                {currentChallenge.difficulty.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {/* Choix pour le prochain joueur - compact sur une ligne */}
        {currentChallenge && (
          <div className="border-t border-white/20 pt-6">
            <div className="mx-auto max-w-sm text-center">
              {/* Prochain joueur sur une ligne */}
              <div className="mb-4 flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-xl">
                  {getNextPlayer()?.emoji}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {getNextPlayer()?.name}
                </h3>
                <p className="text-sm text-gray-300">choisis :</p>
              </div>

              {/* Boutons de choix */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    nextPlayer();
                    setTimeout(() => generateChallenge("action"), 100);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 font-semibold transition-all duration-200 hover:scale-105"
                >
                  🎭 Action
                </button>
                <button
                  onClick={() => {
                    nextPlayer();
                    setTimeout(() => generateChallenge("verite"), 100);
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-3 font-semibold transition-all duration-200 hover:scale-105"
                >
                  ❓ Vérité
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Composant principal avec protection d'authentification
export default function ActionOuVeritePage() {
  return (
    <AuthGuard gameType="action-ou-verite" requiredPlayers={1}>
      <ActionOuVeriteGame />
    </AuthGuard>
  );
}
