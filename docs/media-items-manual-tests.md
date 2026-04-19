# Tests manuels — Étape 05 : MediaItems + intégration TMDB

Prérequis : `docker compose up -d postgres` + `pnpm dev` démarrés. TMDB_API_KEY renseignée dans `.env.local`.

## 1. Structure des tables

- [ ] Tables `media_types`, `media_items`, `external_ids` présentes dans PostgreSQL.
- [ ] `media_types` contient 2 lignes après seed : `film` (Film) et `series` (Série).
  - Commande seed : `pnpm tsx src/modules/media-items/seed/media-types.ts`
- [ ] Index `tmdb_id_media_type_idx` (UNIQUE) existe sur `media_items`.
- [ ] Index `provider_external_id_idx` (UNIQUE) existe sur `external_ids`.

## 2. Panel TMDB dans l'admin

- [ ] Naviguer vers `/admin/collections/media-items` en tant qu'admin.
- [ ] Le panel "Importer depuis TMDB" s'affiche au-dessus du listing.
- [ ] Taper "Dune" dans le champ de recherche -> résultats apparaissent (titre, année, miniature poster, badge Film/Série).

## 3. Import d'un film

- [ ] Cliquer "Importer" sur "Dune (2021)" -> redirection vers l'edit view du document créé.
- [ ] Champs remplis : `title`, `original_title`, `year` (2021), `duration` (155), `synopsis`, `poster_url` (URL image.tmdb.org), `tmdb_id` (438631).
- [ ] `source_last_synced_at` et `source_expires_at` renseignés (expires_at ≈ now + 180 jours).
- [ ] `source_of_truth` = "tmdb".
- [ ] Dans `/admin/collections/external-ids` : une entrée `provider=tmdb, external_id=438631` liée au document.
- [ ] Si IMDb id disponible (tt1160419) : une entrée `provider=imdb, external_id=tt1160419` également créée.

## 4. Import d'une série

- [ ] Rechercher "Breaking Bad" -> résultats incluent des séries (badge "Série").
- [ ] Importer "Breaking Bad" -> `duration` = nombre de saisons (5), `imdb_id` absent (non fourni par endpoint /tv).

## 5. Idempotence (re-sync)

- [ ] Re-importer "Dune (2021)" depuis le panel -> le même document est mis à jour (pas de doublon).
- [ ] `source_last_synced_at` est mis à jour, `source_expires_at` recalculé.

## 6. Correction manuelle (ADMIN-05)

- [ ] Dans l'edit view d'un media-item, modifier manuellement `synopsis` -> sauvegarder -> synopsis persisté.
- [ ] Les champs `title`, `poster_url`, `synopsis` sont éditables (pas de readOnly sur ces champs).
- [ ] Les champs `source_last_synced_at` et `source_expires_at` sont en lecture seule dans l'admin.
- [ ] Re-importer depuis le panel -> le synopsis est écrasé par la valeur TMDB (comportement attendu et documenté).

## 7. Sécurité

- [ ] En tant que customer connecté (pas admin), appeler `POST /api/media-items/import-tmdb` -> réponse 403.
- [ ] En tant que customer, appeler `GET /api/media-items/search-tmdb?q=Dune` -> réponse 403.
- [ ] Sans être connecté, `GET /api/media-items` -> réponse 200 (lecture publique).

## 8. Validation des entrées

- [ ] `POST /api/media-items/import-tmdb` avec body `{}` (admin) -> réponse 400.
- [ ] `POST /api/media-items/import-tmdb` avec `mediaType: "livre"` (admin) -> réponse 400.
- [ ] `GET /api/media-items/search-tmdb?q=` (query vide) -> réponse `{ results: [] }` (pas d'erreur 500).
