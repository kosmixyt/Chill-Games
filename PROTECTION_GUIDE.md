# Système de Protection des Jeux - Guide d'Utilisation

## 🎯 Objectif

Ce système assure que seuls les utilisateurs authentifiés peuvent accéder aux jeux, et que chaque utilisateur ne peut jouer qu'avec ses propres joueurs.

## 🚀 Fonctionnalités Implémentées

### ✅ Protection Complète

1. **Middleware de Sécurité** (`middleware.ts`)
   - Protège automatiquement toutes les routes `/play/*`
   - Protège toutes les APIs `/api/games/*`
   - Redirige les utilisateurs non connectés

2. **Composant AuthGuard** (`src/components/AuthGuard.tsx`)
   - Vérifie l'authentification en temps réel
   - Valide le nombre de joueurs requis
   - Affiche des messages d'erreur clairs
   - Redirige automatiquement vers les bonnes pages

3. **APIs Sécurisées**
   - `/api/games/action-ou-verite` - Action ou Vérité (min 1 joueur)
   - `/api/games/undercover` - Undercover (min 3 joueurs)
   - Validation des permissions sur chaque requête
   - Sauvegarde des sessions de jeu

4. **Validation Côté Serveur**
   - Vérification de l'ownership des joueurs
   - Validation du nombre minimum de joueurs
   - Messages d'erreur descriptifs

## 🎮 Jeux Protégés

### Action ou Vérité
- **Accès** : `/play/action-ou-verite`
- **Prérequis** : Utilisateur connecté + 1 joueur minimum
- **Protection** : AuthGuard + API validation

### Undercover
- **Accès** : `/play/undercover`
- **Prérequis** : Utilisateur connecté + 3 joueurs minimum
- **Protection** : AuthGuard + API validation

## 🔧 Comment ça fonctionne

### 1. Accès à un jeu sans être connecté
```
Utilisateur → /play/action-ou-verite
↓
Middleware détecte : pas de session
↓
Redirection → / (avec message d'erreur)
```

### 2. Accès à un jeu sans assez de joueurs
```
Utilisateur connecté → /play/undercover
↓
AuthGuard vérifie l'API → 403 (pas assez de joueurs)
↓
Écran d'erreur → Redirection vers /players/manage
```

### 3. Accès normal
```
Utilisateur connecté → /play/action-ou-verite
↓
AuthGuard vérifie l'API → 200 (OK)
↓
Chargement du jeu avec les joueurs de l'utilisateur
```

## 🛠️ Utilisation pour les Développeurs

### Protéger un nouveau jeu

1. **Créer l'API protégée** (`src/app/api/games/nouveau-jeu/route.ts`)
```typescript
import { requireAuth, isAuthenticated } from "~/server/auth/middleware";
import { validateGameAccess } from "~/server/auth/validation";

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

2. **Protéger la page** (`src/app/play/nouveau-jeu/page.tsx`)
```tsx
import AuthGuard from "~/components/AuthGuard";

function NouveauJeuComponent() {
  // Logique du jeu...
}

export default function NouveauJeuPage() {
  return (
    <AuthGuard gameType="nouveau-jeu" requiredPlayers={2}>
      <NouveauJeuComponent />
    </AuthGuard>
  );
}
```

3. **Ajouter la validation** (`src/server/auth/validation.ts`)
```typescript
// Mettre à jour la fonction validateGameAccess pour supporter le nouveau jeu
const minimumPlayers = gameType === "undercover" ? 3 
  : gameType === "nouveau-jeu" ? 2 
  : 1;
```

### Tester la sécurité

```bash
# Tester les APIs sans authentification
curl http://localhost:3000/api/games/action-ou-verite
# Devrait retourner 401

# Tester les routes protégées
curl -I http://localhost:3000/play/undercover
# Devrait rediriger vers /
```

## 📁 Structure des Fichiers

```
src/
├── server/auth/
│   ├── middleware.ts         # Middleware d'authentification API
│   └── validation.ts         # Validation des permissions
├── components/
│   └── AuthGuard.tsx        # Protection côté client
├── hooks/
│   └── useAuth.ts           # Hook d'authentification
├── app/
│   ├── api/games/           # APIs protégées
│   │   ├── action-ou-verite/
│   │   └── undercover/
│   └── play/                # Pages de jeux protégées
│       ├── action-ou-verite/
│       └── undercover/
└── middleware.ts            # Middleware global Next.js
```

## 🔍 Messages d'Erreur

### Non connecté
> 🔒 Vous devez être connecté pour accéder à ce jeu.

### Pas assez de joueurs (Action ou Vérité)
> Aucun joueur trouvé. Vous devez créer au moins un joueur pour jouer.

### Pas assez de joueurs (Undercover)
> Vous devez avoir au moins 3 joueurs pour jouer à Undercover.

### Joueurs non autorisés
> Certains joueurs ne vous appartiennent pas

## 🧪 Tests

Le système a été testé pour :
- ✅ Accès sans authentification
- ✅ Accès avec authentification mais sans joueurs
- ✅ Accès avec joueurs insuffisants
- ✅ Accès normal avec tous les prérequis
- ✅ Tentative d'utiliser les joueurs d'un autre utilisateur
- ✅ Sauvegarde des sessions de jeu

## 📈 Améliorations Futures

- Rate limiting pour éviter le spam
- Audit log des actions sensibles
- Protection CSRF renforcée
- Tests automatisés complets
- Monitoring des tentatives d'accès non autorisées

## 🚨 Notes de Sécurité

1. **Toujours valider côté serveur** : Le client peut être compromis
2. **Principe du moindre privilège** : Chaque utilisateur n'accède qu'à ses données
3. **Défense en profondeur** : Plusieurs couches de protection
4. **Messages d'erreur explicites** : Aide l'utilisateur à comprendre le problème

---

🎯 **Le système est maintenant entièrement sécurisé !** Chaque jeu vérifie l'authentification et les permissions avant de permettre l'accès.
