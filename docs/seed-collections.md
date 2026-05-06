# Guide — Seed des collections V1

Script d'import automatique des 18 collections (~200 films/séries) depuis TMDB.

**Prérequis** : PostgreSQL démarré, `pnpm dev` actif (le script pilote l'API REST du serveur).

---

## Configuration

Dans `.env.local`, ajouter :

```
SEED_ADMIN_EMAIL=<email du compte admin Payload>
SEED_ADMIN_PASSWORD=<mot de passe admin>
SEED_BASE_URL=http://localhost:3001     # optionnel, valeur par défaut
```

Le compte admin doit exister (créé au premier démarrage ou via l'admin Payload).

---

## Exécution

```powershell
# Terminal 1 : serveur Next.js (s'il n'est pas déjà lancé)
pnpm dev

# Terminal 2 : seed
pnpm seed:collections
```

Sortie attendue :

```
Connecting to http://localhost:3001...
Authenticated.

[1/18] Kubrick intégrale — ++++++++++++. — 13 added, 0 already linked, 0 errors
[2/18] Scorsese intégrale — ++++++++++++++++++++++++++ — 26 added, 0 already linked, 0 errors
...
[18/18] Cinéma et mèmes, le panthéon — .............................. — 0 added, 30 already linked, 0 errors

Done. 487 items across 18 collections.
  287 added, 200 already linked, 0 errors/skipped.
```

Légende des caractères :
- `+` : item ajouté (media-item créé ou mis à jour, lien collection créé)
- `.` : item déjà lié (idempotence)
- `?` : item non trouvé sur TMDB via la recherche
- `E` : erreur (détail sur la ligne suivante)

---

## Idempotence

Le script est conçu pour être relancé sans risque de doublons.

- Un second run affiche uniquement `.` (already linked).
- Les media-items existants sont mis à jour (poster, titre, synopsis).
- Les liens collection déjà présents sont ignorés.

---

## Dépannage

**401 Unauthorized**
Vérifier `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD` dans `.env.local`.

**ECONNREFUSED / fetch failed**
Le serveur n'est pas démarré. Lancer `pnpm dev` dans un autre terminal.

**502 sur import-tmdb**
La clé TMDB est invalide ou le rate-limit TMDB est atteint (40 req/10 s). Attendre 30 secondes et relancer — le script est idempotent.

**Item marqué `?` (non trouvé par recherche)**
Ajouter le `tmdbId` en dur dans `src/scripts/data/collections-seed.ts` pour cet item, puis relancer.

```ts
{ title: 'Titre ambigu', year: 1962, mediaType: 'movie', tmdbId: 12345 }
```

**Item importé avec le mauvais film**
Un `tmdbId` incorrect dans le dataset a importé un autre film. Corriger l'ID dans le dataset, puis dans l'admin Payload supprimer le media-item erroné et relancer.

---

## Architecture

Le script utilise exclusivement les endpoints REST de Payload :

| Endpoint | Usage |
|---|---|
| `POST /api/admins/login` | Authentification admin |
| `GET /api/collections?where[slug][equals]=...` | Vérification existence collection |
| `POST /api/collections` | Création collection |
| `PATCH /api/collections/:id` | Mise à jour collection |
| `GET /api/media-items/search-tmdb?q=...` | Recherche TMDB (fallback si tmdbId absent) |
| `POST /api/media-items/import-tmdb` | Import/mise à jour media-item complet |
| `GET /api/collection-items?where[and][0]...` | Vérification lien existant |
| `POST /api/collection-items` | Création lien collection ↔ media-item |

La logique métier (slug auto-généré, upsert `external-ids`, hooks Payload) reste entièrement dans Payload. Le script ne connaît pas le schéma SQL.
