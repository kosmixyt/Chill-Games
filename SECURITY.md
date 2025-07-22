# Système de Sécurité des Jeux - Chill Games

## Vue d'ensemble

Ce document décrit le système de sécurité mis en place pour protéger l'accès aux jeux dans l'application Chill Games. Le système garantit que seuls les utilisateurs authentifiés peuvent accéder aux jeux et que chaque utilisateur ne peut jouer qu'avec ses propres joueurs.

## Architecture de Sécurité

### 1. Middleware de Protection (middleware.ts)

Le middleware Next.js protège automatiquement :
- **Routes de jeux** (`/play/*`) : Redirige vers l'accueil si non connecté
- **API de jeux** (`/api/games/*`) : Retourne 401 si non authentifié

### 2. Middleware d'Authentification API (src/server/auth/middleware.ts)

Fonction `requireAuth()` qui :
- Vérifie la session utilisateur
- Retourne un objet avec la session ou une réponse d'erreur 401
- Utilisé par toutes les routes API sensibles

### 3. Composant AuthGuard (src/components/AuthGuard.tsx)

Composant React qui :
- Vérifie l'authentification côté client
- Valide l'accès au jeu via l'API
- Affiche des écrans d'erreur informatifs
- Redirige automatiquement en cas de problème

### 4. Validation des Permissions (src/server/auth/validation.ts)

Fonctions utilitaires pour :
- `validateGameAccess()` : Vérifie que l'utilisateur a assez de joueurs
- `validatePlayerOwnership()` : Vérifie que les joueurs appartiennent à l'utilisateur

## Protection par Jeu

### Action ou Vérité
- **Minimum requis** : 1 joueur
- **Protection API** : `/api/games/action-ou-verite`
- **Protection Frontend** : `AuthGuard` avec `requiredPlayers={1}`

### Undercover
- **Minimum requis** : 3 joueurs
- **Protection API** : `/api/games/undercover`
- **Protection Frontend** : `AuthGuard` avec `requiredPlayers={3}`

## Flow de Protection

### 1. Accès à une page de jeu
1. L'utilisateur navigue vers `/play/action-ou-verite` ou `/play/undercover`
2. Le middleware vérifie l'authentification
3. Si non connecté → Redirection vers `/` avec paramètre d'erreur
4. Si connecté → Chargement de la page

### 2. Validation des permissions
1. Le composant `AuthGuard` s'affiche avec un écran de chargement
2. Appel API vers `/api/games/{game-type}` pour vérifier l'accès
3. L'API valide l'authentification et le nombre de joueurs
4. Si OK → Affichage du jeu
5. Si KO → Écran d'erreur avec redirection

### 3. Pendant le jeu
1. Les données de jeu sont chargées via l'API protégée
2. Les joueurs sont récupérés depuis la base de données
3. Toutes les actions utilisent les joueurs de l'utilisateur connecté
4. Sauvegarde automatique des sessions de jeu

## Messages d'Erreur

### Authentification Required
- **Trigger** : Utilisateur non connecté tentant d'accéder à un jeu
- **Action** : Redirection vers l'accueil avec message informatif

### Joueurs Insuffisants
- **Trigger** : Utilisateur avec moins de joueurs que requis
- **Action** : Redirection vers la gestion des joueurs

### Joueurs Non Autorisés
- **Trigger** : Tentative d'utiliser des joueurs d'un autre utilisateur
- **Action** : Erreur 403 avec message explicite

## Hooks et Utilitaires

### useAuth Hook (src/hooks/useAuth.ts)
```typescript
const { isLoading, isAuthenticated, user, error } = useAuth();
```

### Composants Réutilisables
- `AuthGuard` : Protection des pages de jeu
- Messages d'erreur automatiques sur la page d'accueil

## Sécurité des Données

### Base de Données
- Chaque joueur est lié à son propriétaire (`ownerId`)
- Toutes les requêtes filtrent par `ownerId`
- Validation stricte des permissions avant toute opération

### API
- Authentification obligatoire sur toutes les routes sensibles
- Validation des permissions pour chaque action
- Logs des erreurs de sécurité

## Exemples d'Utilisation

### Protéger une nouvelle page de jeu
```tsx
export default function NouveauJeu() {
  return (
    <AuthGuard gameType="nouveau-jeu" requiredPlayers={2}>
      <NouveauJeuComponent />
    </AuthGuard>
  );
}
```

### Créer une nouvelle API de jeu
```typescript
export async function GET() {
  const authResult = await requireAuth();
  if (!isAuthenticated(authResult)) {
    return authResult;
  }
  
  const validation = await validateGameAccess(authResult.user.id, "nouveau-jeu");
  if (!validation.hasAccess) {
    return NextResponse.json({ error: validation.message }, { status: 403 });
  }
  
  // Logique du jeu...
}
```

## Tests de Sécurité

Pour tester la sécurité :

1. **Test sans authentification** : Accéder à `/play/action-ou-verite` sans être connecté
2. **Test avec joueurs insuffisants** : Connecté mais sans joueurs créés
3. **Test de l'API directement** : Appeler `/api/games/undercover` sans session

## Améliorations Futures

- Rate limiting sur les APIs
- Logs de sécurité plus détaillés
- Audit trail des actions utilisateurs
- Protection CSRF supplémentaire
