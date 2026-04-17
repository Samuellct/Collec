# Collec Club

Plateforme culturelle de progression par collections et parcours éditoriaux.

## Stack

- Next.js 15+ (App Router) + TypeScript
- Payload CMS 3 (auth, admin panel, API REST)
- PostgreSQL
- Docker Compose

## Démarrage local

```bash
# Copier les variables d'environnement
cp .env.example .env.local

# Lancer la base de données
docker compose up postgres -d

# Installer les dépendances
pnpm install

# Lancer en développement
pnpm dev
```

## Structure

```
src/
  app/           - Next.js App Router
  collections/   - Collections Payload CMS
  modules/       - Modules métier (auth, users, media-items, collections, pathways, progress)
  components/    - Composants React partagés
  lib/           - Utilitaires
public/          - Fichiers statiques
.github/         - Workflows CI/CD
```

## Contribution

Voir `.github/CONTRIBUTING.md` pour les conventions de commit et le workflow de développement.
