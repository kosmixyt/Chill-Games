# Dockerfile multi-stage pour Next.js avec Prisma
FROM node:20-alpine AS base

# Installer les dépendances nécessaires pour Prisma
RUN apk add --no-cache libc6-compat openssl

# Définir le répertoire de travail
WORKDIR /app

# Installer pnpm globalement
RUN npm install -g pnpm

# Stage pour installer les dépendances
FROM base AS deps
# Copier les fichiers de gestion des packages dans deps
COPY package.json pnpm-lock.yaml* ./
# Installer sans exécuter les scripts postinstall
RUN pnpm install --frozen-lockfile --ignore-scripts

# Stage pour build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copier d'abord le schema Prisma
COPY prisma ./prisma

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste des fichiers
COPY . .

# Build de l'application Next.js avec validation d'environnement désactivée
ENV SKIP_ENV_VALIDATION=1
RUN pnpm build

# Stage de production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires pour la production
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copier les fichiers de build Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copier les fichiers Prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Commande de démarrage
CMD ["node", "server.js"]