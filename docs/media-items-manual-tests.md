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

Prérequis : avoir un compte customer vérifié (créé via `/register`).

### 7.1 Obtenir un token customer

```powershell
$loginCustomer = Invoke-RestMethod `
  -Uri "http://localhost:3001/api/customers/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"ton-email@test.com","password":"ton-mot-de-passe"}'

$customerToken = $loginCustomer.token
echo $customerToken   # doit afficher un JWT non vide
```

### 7.2 Customer -> POST import-tmdb -> 403 attendu

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/media-items/import-tmdb" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $customerToken" } `
  -ContentType "application/json" `
  -Body '{"tmdbId":438631,"mediaType":"movie"}' `
  -SkipHttpErrorCheck

echo $r.StatusCode          # attendu : 403
echo $r.Content             # attendu : {"error":"Unauthorized"}
```

### 7.3 Customer -> GET search-tmdb -> 403 attendu

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/media-items/search-tmdb?q=Dune" `
  -Headers @{ Authorization = "Bearer $customerToken" } `
  -SkipHttpErrorCheck

echo $r.StatusCode          # attendu : 403
```

### 7.4 Sans token -> GET /api/media-items -> 200 attendu (lecture publique)

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/media-items" `
  -SkipHttpErrorCheck

echo $r.StatusCode          # attendu : 200
```

---

## 8. Validation des entrées

Prérequis : token admin. Remplacer `email` et `password` par les identifiants du compte admin.

### 8.0 Obtenir un token admin

```powershell
$loginAdmin = Invoke-RestMethod `
  -Uri "http://localhost:3001/api/admins/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@collec-club.fr","password":"ton-mot-de-passe-admin"}'

$adminToken = $loginAdmin.token
echo $adminToken    # doit afficher un JWT non vide
```

### 8.1 Body vide -> 400 attendu

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/media-items/import-tmdb" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $adminToken" } `
  -ContentType "application/json" `
  -Body '{}' `
  -SkipHttpErrorCheck

echo $r.StatusCode          # attendu : 400
echo $r.Content             # attendu : message d'erreur sur tmdbId/mediaType
```

### 8.2 mediaType invalide -> 400 attendu

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/media-items/import-tmdb" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $adminToken" } `
  -ContentType "application/json" `
  -Body '{"tmdbId":438631,"mediaType":"livre"}' `
  -SkipHttpErrorCheck

echo $r.StatusCode          # attendu : 400
```

### 8.3 Query vide -> results vide, pas d'erreur 500

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/media-items/search-tmdb?q=" `
  -Headers @{ Authorization = "Bearer $adminToken" } `
  -SkipHttpErrorCheck

echo $r.StatusCode                                  # attendu : 200
($r.Content | ConvertFrom-Json).results.Count       # attendu : 0
```
