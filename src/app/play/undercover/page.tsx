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

interface GameSet {
  id: number;
  civilian: string;
  undercover: string;
  difficulty: string;
}

interface GameData {
  sets: GameSet[];
}

interface PlayerRole {
  player: SelectedPlayer;
  role: "civilian" | "undercover" | "mr-white";
  word: string;
  isAlive: boolean;
  votes: number;
}

interface GameConfig {
  civilians: number;
  undercover: number;
  mrWhite: number;
}

function UndercoverGame() {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<SelectedPlayer[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentGameSet, setCurrentGameSet] = useState<GameSet | null>(null);
  const [playerRoles, setPlayerRoles] = useState<PlayerRole[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gamePhase, setGamePhase] = useState<
    "description" | "voting" | "results" | "reveal"
  >("description");
  const [difficulty, setDifficulty] = useState<
    "facile" | "moyen" | "difficile"
  >("facile");
  const [votes, setVotes] = useState<{ [playerId: number]: number }>({});
  const [round, setRound] = useState(1);
  const [showWord, setShowWord] = useState(false);
  const [currentDescriptionPlayer, setCurrentDescriptionPlayer] = useState(0);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    civilians: 0,
    undercover: 1,
    mrWhite: 0,
  });
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);

  const router = useRouter();

  // Charger les données de jeu et les joueurs depuis l'API protégée
  useEffect(() => {
    const loadGameData = async () => {
      try {
        // Charger les données depuis l'API protégée
        const response = await fetch("/api/games/undercover");
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
          if (playersData.length >= 3) {
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

  // Update default config when players change
  useEffect(() => {
    if (players.length > 0) {
      const defaultUndercover = players.length >= 7 ? 2 : 1;
      const defaultMrWhite = players.length >= 5 ? 1 : 0;
      const defaultCivilians =
        players.length - defaultUndercover - defaultMrWhite;

      setGameConfig({
        civilians: defaultCivilians,
        undercover: defaultUndercover,
        mrWhite: defaultMrWhite,
      });
    }
  }, [players]);

  // Enregistrer une session de jeu
  const saveGameSession = async () => {
    try {
      const playerIds = players.map((p) => p.id);
      const response = await fetch("/api/games/undercover", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerIds,
          gameSetId: currentGameSet?.id,
          gameResult,
          winner: gameResult,
        }),
      });

      if (response.ok) {
        console.log("Session de jeu Undercover enregistrée avec succès");
      } else {
        console.error("Erreur lors de l'enregistrement de la session");
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la session:", error);
    }
  };

  const startGame = () => {
    if (!gameData || players.length < 3) return;

    // Validate configuration
    const totalConfigured =
      gameConfig.civilians + gameConfig.undercover + gameConfig.mrWhite;
    if (totalConfigured !== players.length) {
      alert(
        `Configuration invalide: ${totalConfigured} rôles configurés pour ${players.length} joueurs`,
      );
      return;
    }

    // Filter sets by difficulty
    const filteredSets = gameData.sets.filter(
      (set) => set.difficulty === difficulty,
    );
    const randomSet =
      filteredSets[Math.floor(Math.random() * filteredSets.length)];

    if (!randomSet) return;

    setCurrentGameSet(randomSet);

    // Assign roles based on configuration
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const roles: PlayerRole[] = [];

    shuffledPlayers.forEach((player, index) => {
      let role: "civilian" | "undercover" | "mr-white";
      let word: string;

      if (index < gameConfig.undercover) {
        role = "undercover";
        word = randomSet.undercover;
      } else if (index < gameConfig.undercover + gameConfig.mrWhite) {
        role = "mr-white";
        word = "???";
      } else {
        role = "civilian";
        word = randomSet.civilian;
      }

      roles.push({
        player,
        role,
        word,
        isAlive: true,
        votes: 0,
      });
    });

    setPlayerRoles(roles);
    setGameStarted(true);
    setGamePhase("description");
    setCurrentDescriptionPlayer(0);
    setRound(1);
  };

  const nextDescriptionTurn = () => {
    const alivePlayers = playerRoles.filter((p) => p.isAlive);
    if (currentDescriptionPlayer < alivePlayers.length - 1) {
      setCurrentDescriptionPlayer(currentDescriptionPlayer + 1);
    } else {
      setGamePhase("voting");
      // Reset votes
      const resetVotes: { [playerId: number]: number } = {};
      alivePlayers.forEach((p) => {
        resetVotes[p.player.id] = 0;
      });
      setVotes(resetVotes);
    }
  };

  const voteForPlayer = (playerId: number) => {
    setVotes((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + 1,
    }));
  };

  const endVoting = () => {
    // Find player with most votes
    const alivePlayers = playerRoles.filter((p) => p.isAlive);
    let maxVotes = 0;
    let eliminatedPlayerId = -1;

    Object.entries(votes).forEach(([playerId, voteCount]) => {
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
        eliminatedPlayerId = parseInt(playerId);
      }
    });

    // Eliminate player
    if (eliminatedPlayerId !== -1) {
      setPlayerRoles((prev) =>
        prev.map((p) =>
          p.player.id === eliminatedPlayerId ? { ...p, isAlive: false } : p,
        ),
      );
    }

    setGamePhase("results");
  };

  const checkGameEnd = () => {
    const aliveRoles = playerRoles.filter((p) => p.isAlive);
    const aliveCivilians = aliveRoles.filter((p) => p.role === "civilian");
    const aliveUndercover = aliveRoles.filter((p) => p.role === "undercover");
    const aliveMrWhite = aliveRoles.filter((p) => p.role === "mr-white");

    // Check win conditions
    if (aliveUndercover.length === 0 && aliveMrWhite.length === 0) {
      return { winner: "civilians", message: "Les civils ont gagné !" };
    }

    if (aliveUndercover.length >= aliveCivilians.length) {
      return {
        winner: "undercover",
        message: "Les agents undercover ont gagné !",
      };
    }

    if (aliveMrWhite.length > 0 && aliveRoles.length === 2) {
      return { winner: "mr-white", message: "Mr. White a gagné !" };
    }

    return null;
  };

  const nextRound = () => {
    const gameEnd = checkGameEnd();
    if (gameEnd) {
      setGameResult(gameEnd.winner); // Enregistrer le résultat du jeu
      setGamePhase("reveal");
      return;
    }

    setRound(round + 1);
    setGamePhase("description");
    setCurrentDescriptionPlayer(0);
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentGameSet(null);
    setPlayerRoles([]);
    setCurrentPlayerIndex(0);
    setGamePhase("description");
    setVotes({});
    setRound(1);
    setShowWord(false);
    setCurrentDescriptionPlayer(0);
    setShowAdvancedConfig(false);
  };

  const updateRoleCount = (role: keyof GameConfig, count: number) => {
    const newConfig = { ...gameConfig, [role]: Math.max(0, count) };

    // Ensure total doesn't exceed player count
    const total =
      newConfig.civilians + newConfig.undercover + newConfig.mrWhite;
    if (total <= players.length) {
      setGameConfig(newConfig);
    }
  };

  const getConfigValidation = () => {
    const total =
      gameConfig.civilians + gameConfig.undercover + gameConfig.mrWhite;
    const remaining = players.length - total;

    return {
      isValid: total === players.length,
      total,
      remaining,
      hasUndercover: gameConfig.undercover > 0,
      hasMinimumCivilians: gameConfig.civilians >= 1,
    };
  };

  const renderWordReveal = () => {
    const currentPlayer = playerRoles.filter((p) => p.isAlive)[
      currentDescriptionPlayer
    ];
    if (!currentPlayer) return null;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 text-white">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur-lg">
            <div className="mb-4 text-6xl">{currentPlayer.player.emoji}</div>
            <h2 className="mb-6 text-2xl font-bold">
              {currentPlayer.player.name}
            </h2>

            {!showWord ? (
              <div>
                <p className="mb-6 text-lg">
                  C'est votre tour ! Cliquez pour voir votre mot.
                </p>
                <button
                  onClick={() => setShowWord(true)}
                  className="rounded-lg bg-purple-600 px-8 py-3 font-bold transition-colors hover:bg-purple-700"
                >
                  Révéler mon mot
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6 rounded-lg bg-black/20 p-6">
                  <p className="mb-2 text-sm opacity-75">Votre mot :</p>
                  <p className="text-3xl font-bold text-yellow-300">
                    {currentPlayer.word}
                  </p>
                </div>
                <p className="mb-6 text-sm opacity-75">
                  Décrivez ce mot en une phrase sans le dire directement !
                </p>
                <button
                  onClick={() => {
                    setShowWord(false);
                    nextDescriptionTurn();
                  }}
                  className="rounded-lg bg-green-600 px-8 py-3 font-bold transition-colors hover:bg-green-700"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderVoting = () => {
    const alivePlayers = playerRoles.filter((p) => p.isAlive);

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-4 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold">
              🗳️ Phase de Vote - Round {round}
            </h2>
            <p className="text-lg">
              Votez pour éliminer le joueur le plus suspect !
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alivePlayers.map((playerRole) => (
              <div
                key={playerRole.player.id}
                className="rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-lg"
              >
                <div className="mb-3 text-4xl">{playerRole.player.emoji}</div>
                <h3 className="mb-3 text-lg font-bold">
                  {playerRole.player.name}
                </h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-red-400">
                    {votes[playerRole.player.id] || 0}
                  </span>
                  <span className="ml-2 text-sm">votes</span>
                </div>
                <button
                  onClick={() => voteForPlayer(playerRole.player.id)}
                  className="w-full rounded-lg bg-red-600 px-4 py-2 font-bold transition-colors hover:bg-red-700"
                >
                  Voter
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={endVoting}
              className="rounded-lg bg-orange-600 px-8 py-3 text-xl font-bold transition-colors hover:bg-orange-700"
            >
              Terminer le vote
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const eliminatedPlayer = playerRoles.find(
      (p) => !p.isAlive && Object.keys(votes).includes(p.player.id.toString()),
    );
    const gameEnd = checkGameEnd();

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4 text-white">
        <div className="w-full max-w-md text-center">
          <h2 className="mb-6 text-3xl font-bold">Résultats du Vote</h2>

          {eliminatedPlayer && (
            <div className="mb-6 rounded-xl border border-red-500 bg-red-500/20 p-6">
              <div className="mb-3 text-5xl">
                {eliminatedPlayer.player.emoji}
              </div>
              <h3 className="mb-2 text-xl font-bold">
                {eliminatedPlayer.player.name}
              </h3>
              <p className="mb-3 text-lg">a été éliminé !</p>
              <div className="rounded-lg bg-black/30 p-3">
                <p className="text-sm opacity-75">Rôle :</p>
                <p className="text-lg font-bold">
                  {eliminatedPlayer.role === "civilian" && "🏘️ Civil"}
                  {eliminatedPlayer.role === "undercover" &&
                    "🕵️ Agent Undercover"}
                  {eliminatedPlayer.role === "mr-white" && "👤 Mr. White"}
                </p>
                <p className="mt-2 text-sm opacity-75">Mot :</p>
                <p className="font-bold">{eliminatedPlayer.word}</p>
              </div>
            </div>
          )}

          {gameEnd ? (
            <div className="mb-6">
              <h3 className="mb-4 text-2xl font-bold text-green-400">
                {gameEnd.message}
              </h3>
              <button
                onClick={resetGame}
                className="rounded-lg bg-blue-600 px-8 py-3 font-bold transition-colors hover:bg-blue-700"
              >
                Nouvelle Partie
              </button>
            </div>
          ) : (
            <button
              onClick={nextRound}
              className="rounded-lg bg-purple-600 px-8 py-3 font-bold transition-colors hover:bg-purple-700"
            >
              Round Suivant
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderGameSetup = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold">🕵️ Undercover</h1>
          <p className="text-lg opacity-90">
            Trouvez qui sont les agents infiltrés !
          </p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-lg">
          <h2 className="mb-6 text-center text-2xl font-bold">Configuration</h2>

          <div className="mb-6">
            <h3 className="mb-3 text-lg font-bold">
              Joueurs sélectionnés ({players.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="rounded-lg bg-white/10 p-3 text-center"
                >
                  <div className="mb-1 text-2xl">{player.emoji}</div>
                  <div className="text-sm font-medium">{player.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-lg font-bold">Difficulté</h3>
            <div className="grid grid-cols-3 gap-3">
              {["facile", "moyen", "difficile"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff as any)}
                  className={`rounded-lg p-3 font-bold transition-colors ${
                    difficulty === diff
                      ? "bg-purple-600"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Configuration des rôles</h3>
              <button
                onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                className="rounded-lg bg-white/10 px-3 py-1 text-sm transition-colors hover:bg-white/20"
              >
                {showAdvancedConfig ? "Simple" : "Avancée"}
              </button>
            </div>

            {showAdvancedConfig ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-black/20 p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <label className="mb-2 block text-sm font-medium">
                        🏘️ Civils
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            updateRoleCount(
                              "civilians",
                              gameConfig.civilians - 1,
                            )
                          }
                          className="h-8 w-8 rounded-lg bg-red-500 font-bold transition-colors hover:bg-red-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">
                          {gameConfig.civilians}
                        </span>
                        <button
                          onClick={() =>
                            updateRoleCount(
                              "civilians",
                              gameConfig.civilians + 1,
                            )
                          }
                          className="h-8 w-8 rounded-lg bg-green-500 font-bold transition-colors hover:bg-green-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <label className="mb-2 block text-sm font-medium">
                        🕵️ Undercover
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            updateRoleCount(
                              "undercover",
                              gameConfig.undercover - 1,
                            )
                          }
                          className="h-8 w-8 rounded-lg bg-red-500 font-bold transition-colors hover:bg-red-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">
                          {gameConfig.undercover}
                        </span>
                        <button
                          onClick={() =>
                            updateRoleCount(
                              "undercover",
                              gameConfig.undercover + 1,
                            )
                          }
                          className="h-8 w-8 rounded-lg bg-green-500 font-bold transition-colors hover:bg-green-600"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-center">
                      <label className="mb-2 block text-sm font-medium">
                        👤 Mr. White
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            updateRoleCount("mrWhite", gameConfig.mrWhite - 1)
                          }
                          className="h-8 w-8 rounded-lg bg-red-500 font-bold transition-colors hover:bg-red-600"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold">
                          {gameConfig.mrWhite}
                        </span>
                        <button
                          onClick={() =>
                            updateRoleCount("mrWhite", gameConfig.mrWhite + 1)
                          }
                          className="h-8 w-8 rounded-lg bg-green-500 font-bold transition-colors hover:bg-green-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const validation = getConfigValidation();
                    return (
                      <div className="mt-4 text-center">
                        <div
                          className={`text-sm ${validation.isValid ? "text-green-400" : "text-red-400"}`}
                        >
                          Total: {validation.total}/{players.length} joueurs
                          {validation.remaining !== 0 && (
                            <span className="ml-2">
                              (
                              {validation.remaining > 0
                                ? `+${validation.remaining}`
                                : validation.remaining}{" "}
                              restants)
                            </span>
                          )}
                        </div>
                        {!validation.hasUndercover && (
                          <div className="mt-1 text-xs text-yellow-400">
                            ⚠️ Au moins 1 agent undercover requis
                          </div>
                        )}
                        {!validation.hasMinimumCivilians && (
                          <div className="mt-1 text-xs text-yellow-400">
                            ⚠️ Au moins 1 civil requis
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-black/20 p-4 text-center">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="mb-1 text-2xl">🏘️</div>
                    <div className="font-bold">{gameConfig.civilians}</div>
                    <div className="opacity-75">Civils</div>
                  </div>
                  <div>
                    <div className="mb-1 text-2xl">🕵️</div>
                    <div className="font-bold">{gameConfig.undercover}</div>
                    <div className="opacity-75">Undercover</div>
                  </div>
                  <div>
                    <div className="mb-1 text-2xl">👤</div>
                    <div className="font-bold">{gameConfig.mrWhite}</div>
                    <div className="opacity-75">Mr. White</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 rounded-lg bg-blue-500/20 p-4">
            <h3 className="mb-2 text-lg font-bold">🎯 Règles du jeu</h3>
            <ul className="space-y-1 text-sm opacity-90">
              <li>• La majorité des joueurs ont le même mot (civils)</li>
              <li>• 1-2 joueurs ont un mot similaire (agents undercover)</li>
              <li>• Mr. White (5+ joueurs) ne connaît aucun mot</li>
              <li>• Chacun décrit son mot sans le dire</li>
              <li>• Votez pour éliminer les suspects</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              onClick={async () => {
                if (gameStarted) {
                  await saveGameSession();
                }
                router.push(`/players?gameId=${2}`);
              }}
              className="flex-1 rounded-lg bg-gray-600 py-3 font-bold transition-colors hover:bg-gray-700"
            >
              Modifier Joueurs
            </button>
            <button
              onClick={startGame}
              disabled={
                players.length < 3 ||
                !gameData ||
                !getConfigValidation().isValid ||
                !getConfigValidation().hasUndercover ||
                !getConfigValidation().hasMinimumCivilians
              }
              className="flex-1 rounded-lg bg-purple-600 py-3 font-bold transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              Commencer
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render game reveal
  const renderReveal = () => {
    const gameEnd = checkGameEnd();

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-4xl font-bold">🎉 Fin de Partie</h2>
            {gameEnd && (
              <p className="text-2xl text-yellow-300">{gameEnd.message}</p>
            )}
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {playerRoles.map((playerRole) => (
              <div
                key={playerRole.player.id}
                className={`rounded-xl border-2 p-6 text-center ${
                  playerRole.isAlive
                    ? "border-green-500 bg-green-500/20"
                    : "border-red-500 bg-red-500/20"
                }`}
              >
                <div className="mb-3 text-4xl">{playerRole.player.emoji}</div>
                <h3 className="mb-2 text-lg font-bold">
                  {playerRole.player.name}
                </h3>
                <div className="space-y-2">
                  <div className="rounded bg-black/30 p-2">
                    <p className="text-xs opacity-75">Rôle</p>
                    <p className="font-bold">
                      {playerRole.role === "civilian" && "🏘️ Civil"}
                      {playerRole.role === "undercover" && "🕵️ Undercover"}
                      {playerRole.role === "mr-white" && "👤 Mr. White"}
                    </p>
                  </div>
                  <div className="rounded bg-black/30 p-2">
                    <p className="text-xs opacity-75">Mot</p>
                    <p className="font-bold">{playerRole.word}</p>
                  </div>
                  <div className="text-sm">
                    {playerRole.isAlive ? "✅ Vivant" : "💀 Éliminé"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={resetGame}
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold transition-colors hover:bg-blue-700"
            >
              Nouvelle Partie
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!gameStarted) {
    return renderGameSetup();
  }

  if (gamePhase === "description") {
    return renderWordReveal();
  }

  if (gamePhase === "voting") {
    return renderVoting();
  }

  if (gamePhase === "results") {
    return renderResults();
  }

  if (gamePhase === "reveal") {
    return renderReveal();
  }

  return null;
}

// Composant principal avec protection d'authentification
export default function UndercoverPage() {
  return (
    <AuthGuard gameType="undercover" requiredPlayers={3}>
      <UndercoverGame />
    </AuthGuard>
  );
}
