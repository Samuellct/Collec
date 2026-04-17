# Collec Club

Plateforme culturelle de progression par collections et parcours editoriaux.

## Stack

- Next.js 16+ (App Router) + TypeScript
- Payload CMS 3 (auth, admin panel, API REST)
- PostgreSQL 16
- Docker Compose

## Demarrage local

```bash
# Copier les variables d'environnement
cp .env.example .env.local
# Editer .env.local avec vos valeurs

# Lancer la base de donnees
docker compose up -d postgres

# Installer les dependances
pnpm install

# Lancer en developpement
pnpm dev
```

Panel admin : http://localhost:3000/admin
API REST : http://localhost:3000/api

## Scripts

```bash
pnpm dev                  # Serveur de developpement
pnpm build                # Build de production
pnpm start                # Serveur de production
pnpm lint                 # ESLint
pnpm type-check           # Verification TypeScript
pnpm generate:types       # Generer src/payload-types.ts
pnpm generate:importmap   # Generer importMap Payload
```

## Structure

```
src/
  app/
    (frontend)/           - Pages publiques Next.js
    (payload)/            - Routes Payload CMS (admin + API)
  modules/                - Modules metier
    auth/
    users/
    media-items/
    collections/
    pathways/
    progress/
    billing/
    admin/
  lib/                    - Utilitaires partages
  payload.config.ts       - Configuration Payload CMS
public/                   - Fichiers statiques
migrations/               - Migrations PostgreSQL (Payload)
docker-compose.yml        - Services locaux (PostgreSQL)
```

## Contribution

Voir `.github/CONTRIBUTING.md` pour les conventions de commit et le workflow de developpement.
