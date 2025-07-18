# 🎲 Chill Games

Une application web moderne pour découvrir et sélectionner les meilleurs jeux de soirée entre amis.

![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.15-38B2AC?style=flat-square&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.5.0-2D3748?style=flat-square&logo=prisma)

## ✨ Fonctionnalités

### 🎮 Découverte de Jeux
- **Catalogue complet** : Collection soigneusement sélectionnée de jeux de soirée populaires
- **Informations détaillées** : Nombre de joueurs, durée, difficulté et catégorie pour chaque jeu
- **Design moderne** : Interface élégante avec animations et effets visuels

### 🔍 Navigation Intelligente
- **Filtrage par catégorie** : Ambiance, Stratégie, Party, Coopératif, Bluff
- **Interface responsive** : Optimisée pour desktop, tablette et mobile
- **Recherche visuelle** : Cartes interactives avec emojis thématiques

### 🎯 Sélection Interactive
- **Navigation vers détails** : Clic sur un jeu pour accéder à sa page dédiée
- **Animations fluides** : Effets hover et transitions élégantes
- **UX intuitive** : Interface simple et engageante

## 🎲 Jeux Disponibles

| Jeu | Catégorie | Joueurs | Durée | Difficulté |
|-----|-----------|---------|--------|------------|
| 🐺 Loup-Garou | Bluff | 6-20 | 30-60 min | Facile |
| ⏰ Time's Up | Ambiance | 4-12 | 30-45 min | Facile |
| 🕵️ Codenames | Stratégie | 4-8 | 15-30 min | Moyen |
| ✏️ Just One | Coopératif | 3-8 | 20 min | Facile |
| 🎨 Dixit | Ambiance | 3-6 | 30 min | Facile |
| 🃏 Blanc Manger Coco | Party | 3-10 | 30-60 min | Facile |

## 🛠️ Technologies

### Frontend
- **Next.js 15.2.3** - Framework React avec App Router
- **React 19** - Bibliothèque UI avec les dernières fonctionnalités
- **TypeScript** - Typage statique pour un code robuste
- **Tailwind CSS 4.0** - Framework CSS utilitaire moderne

### Backend & Database
- **Prisma** - ORM moderne pour la gestion de base de données
- **NextAuth.js** - Authentification complète et sécurisée
- **T3 Stack** - Stack TypeScript full-stack optimisée

### Outils de Développement
- **ESLint** - Linting du code JavaScript/TypeScript
- **Prettier** - Formatage automatique du code
- **Turbo** - Build system ultra-rapide

## 🚀 Installation et Lancement

### Prérequis
- Node.js 18+ 
- npm ou yarn ou bun
- Base de données (PostgreSQL recommandée)

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd chill

# Installer les dépendances
npm install
# ou
bun install

# Configurer la base de données
cp .env.example .env
# Modifier les variables d'environnement dans .env

# Initialiser la base de données
npm run db:push

# Lancer en mode développement
npm run dev
```

### Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrer avec Turbo
npm run dev:regular  # Démarrer sans Turbo

# Production
npm run build        # Construire l'application
npm run start        # Démarrer en production
npm run preview      # Build + start

# Base de données
npm run db:push      # Synchroniser le schéma
npm run db:generate  # Générer le client Prisma
npm run db:studio    # Interface Prisma Studio

# Qualité du code
npm run lint         # Vérifier le code
npm run lint:fix     # Corriger automatiquement
npm run typecheck    # Vérification TypeScript
npm run format:check # Vérifier le formatage
npm run format:write # Formater le code
```

## 📁 Structure du Projet

```
chill/
├── src/
│   ├── app/                 # App Router Next.js
│   │   ├── page.tsx        # Page principale (sélecteur de jeux)
│   │   ├── layout.tsx      # Layout global
│   │   └── api/            # Routes API
│   ├── server/             # Code serveur
│   │   ├── auth/           # Configuration NextAuth
│   │   └── db.ts           # Client Prisma
│   └── styles/             # Styles globaux
├── prisma/
│   └── schema.prisma       # Schéma de base de données
├── public/                 # Assets statiques
└── package.json            # Dépendances et scripts
```

## 🎨 Design System

### Palette de Couleurs
- **Primary** : Dégradé violet/rose (`from-purple-500 to-pink-500`)
- **Background** : Dégradé bleu foncé (`from-[#1a1a2e] to-[#0f3460]`)
- **Cards** : Fond semi-transparent (`bg-white/10`)
- **Accents** : Couleurs par catégorie (vert, bleu, purple, etc.)

### Composants
- **GameCard** : Carte interactive pour chaque jeu
- **Filtres** : Boutons de catégorie avec états actifs
- **Animations** : Hover effects et transitions fluides

## 🔐 Authentification

L'application utilise NextAuth.js pour une authentification sécurisée :
- Support multi-providers (Google, GitHub, etc.)
- Sessions sécurisées
- Protection des routes
- Intégration Prisma pour la persistance

## 🌟 Fonctionnalités Futures

- [ ] Système de favoris personnalisés
- [ ] Recommandations basées sur les préférences
- [ ] Système de notation et avis
- [ ] Création de soirées avec amis
- [ ] Calendrier d'événements
- [ ] Statistiques de jeux joués
- [ ] Mode hors-ligne avec PWA

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Créé avec ❤️ pour animer vos soirées entre amis !

---

**Amusez-vous bien avec Chill Games ! 🎉**