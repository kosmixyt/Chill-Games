# 🎲 Chill Games - Guide d'ajout de jeux

## Comment ajouter un nouveau jeu

Pour ajouter un nouveau jeu à l'application, vous devez modifier le fichier `src/server/util.ts`.

### 1. Structure d'un jeu

Chaque jeu doit respecter l'interface `Game` suivante :

```typescript
interface Game {
  id: number;                                              // ID unique du jeu
  name: string;                                           // Nom du jeu
  description: string;                                    // Description courte
  players: string;                                        // Nombre de joueurs (ex: "3-6")
  duration: string;                                       // Durée (ex: "30 min")
  difficulty: "Facile" | "Moyen" | "Difficile";         // Niveau de difficulté
  category: "Ambiance" | "Stratégie" | "Party" | "Coopératif" | "Bluff"; // Catégorie
  emoji: string;                                          // Emoji représentatif
  rules?: string;                                         // Règles détaillées (optionnel)
  materials?: string[];                                   // Matériel nécessaire (optionnel)
  tips?: string[];                                        // Conseils (optionnel)
}
```

### 2. Ajouter un jeu

Dans le fichier `src/server/util.ts`, ajoutez votre jeu dans le tableau `games` :

```typescript
export const games: Game[] = [
  // ... jeux existants ...
  
  {
    id: 7, // Utilisez l'ID suivant disponible
    name: "Nom du jeu",
    description: "Description courte et attrayante du jeu",
    players: "4-8",
    duration: "45 min",
    difficulty: "Moyen",
    category: "Stratégie",
    emoji: "🎯",
    rules: "Explication détaillée des règles du jeu...",
    materials: [
      "Cartes de jeu",
      "Dés",
      "Plateau de jeu"
    ],
    tips: [
      "Conseil numéro 1",
      "Conseil numéro 2",
      "Conseil numéro 3"
    ]
  }
];
```

### 3. Catégories disponibles

- **Ambiance** : Jeux légers et amusants
- **Stratégie** : Jeux nécessitant réflexion et planification
- **Party** : Jeux pour animer les soirées
- **Coopératif** : Jeux où tous les joueurs collaborent
- **Bluff** : Jeux basés sur la duperie et la déduction

### 4. Conseils pour une bonne fiche jeu

#### Description
- Soyez concis mais attractif
- Mettez en avant l'aspect fun du jeu
- Mentionnez le public cible si nécessaire

#### Règles
- Expliquez l'objectif principal
- Décrivez le déroulement type d'une partie
- Restez clair et accessible

#### Matériel
- Listez tout ce qui est nécessaire pour jouer
- Mentionnez si des éléments peuvent être improvisés

#### Conseils
- Donnez des astuces pour bien jouer
- Mentionnez les pièges à éviter
- Ajoutez des variantes si applicable

### 5. Exemple complet

```typescript
{
  id: 8,
  name: "Jungle Speed",
  description: "Jeu de reflexes et d'observation où la rapidité prime",
  players: "3-8",
  duration: "15 min",
  difficulty: "Facile",
  category: "Ambiance",
  emoji: "🐆",
  rules: "Retournez vos cartes une à une. Dès que deux symboles identiques apparaissent, les joueurs concernés doivent attraper le totem le plus vite possible. Le perdant récupère les cartes de l'autre.",
  materials: [
    "Jeu de cartes Jungle Speed",
    "Totem en bois"
  ],
  tips: [
    "Gardez toujours une main près du totem",
    "Attention aux cartes spéciales qui changent les règles",
    "Restez concentré même quand ce n'est pas votre tour"
  ]
}
```

### 6. Après l'ajout

Une fois votre jeu ajouté dans `util.ts` :

1. ✅ Il apparaîtra automatiquement dans la liste des jeux
2. ✅ Il sera filtrable par catégorie
3. ✅ Il pourra être sélectionné aléatoirement
4. ✅ Il aura sa propre page de détails avec toutes les informations

Aucune autre modification de code n'est nécessaire ! 🎉

### 7. Validation

Assurez-vous que :
- [ ] L'ID est unique
- [ ] Tous les champs obligatoires sont remplis
- [ ] La catégorie est l'une des 5 disponibles
- [ ] La difficulté est l'une des 3 disponibles
- [ ] L'emoji est approprié et unique si possible
- [ ] La description est accrocheuse
- [ ] Les règles sont claires et complètes
