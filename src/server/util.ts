// Types pour les jeux
export interface Game {
  id: number;
  name: string;
  description: string;
  players: string;
  duration: string;
  difficulty: "Facile" | "Moyen" | "Difficile";
  category: "Ambiance" | "Stratégie" | "Party" | "Coopératif" | "Bluff";
  emoji: string;
  rules?: string;
  materials?: string[];
  tips?: string[];
  href: string;
  minPlayers: number;
}

// Base de données des jeux
export const games: Game[] = [
  {
    id: 1,
    name: "Action ou Vérité",
    description:
      "Un classique indémodable où les joueurs doivent choisir entre répondre à une question ou relever un défi.",
    players: "2+",
    duration: "10-60 min",
    difficulty: "Facile",
    category: "Ambiance",
    emoji: "🎲",
    rules:
      "Les joueurs s'assoient en cercle. À tour de rôle, un joueur demande à un autre : 'Action ou Vérité ?'. Si le joueur choisit 'Vérité', il doit répondre honnêtement à une question. S'il choisit 'Action', il doit relever un défi proposé. Si le joueur refuse, il reçoit un gage.",
    materials: ["Liste de questions", "Liste de défis (optionnel)"],
    tips: [
      "Adaptez les questions et défis à l'âge des joueurs",
      "Respectez les limites de chacun",
      "Favorisez la bonne humeur et l'inclusion",
    ],
    href: "/play/action-ou-verite",
    minPlayers: 2,
  },
  {
    id: 2,
    name: "Undercover",
    description:
      "Un jeu de déduction sociale où les joueurs doivent découvrir qui est l'Undercover tout en accomplissant des missions.",
    players: "4-12",
    duration: "30-60 min",
    difficulty: "Moyen",
    category: "Bluff",
    emoji: "🕵️‍♂️",
    rules:
      "Chaque joueur reçoit un rôle secret. Les joueurs doivent accomplir des missions sans se faire découvrir. L'Undercover doit semer la confusion et éviter d'être démasqué. À la fin, les joueurs votent pour éliminer un suspect.",
    materials: ["Cartes de rôles", "Liste de missions"],
    tips: [
      "Soyez attentif aux comportements des autres joueurs",
      "Utilisez des indices subtils pour communiquer avec votre équipe",
      "Ne soyez pas trop agressif dans vos accusations",
    ],
    href: "/play/undercover",
    minPlayers: 3,
  },
];

// Fonctions utilitaires pour les jeux
export const getGameById = (id: number): Game | undefined => {
  return games.find((game) => game.id === id);
};

export const getGamesByCategory = (category: string): Game[] => {
  if (category === "Tous") return games;
  return games.filter((game) => game.category === category);
};

export const getRandomGame = (filteredGames: Game[] = games): Game | null => {
  if (filteredGames.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * filteredGames.length);
  return filteredGames[randomIndex] || null;
};

export const getAllCategories = (): string[] => {
  const categories = Array.from(new Set(games.map((game) => game.category)));
  return ["Tous", ...categories];
};
