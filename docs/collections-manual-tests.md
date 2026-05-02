# Tests manuels - Étape 06 : Collections et CollectionItems

**Statut : TOUS LES TESTS PASSENT - 19 avril 2026**

Prérequis : `docker compose up -d postgres` + `pnpm dev` démarrés.

## 0. Appliquer les migrations

```powershell
# Depuis 03_Developpement/
pnpm payload migrate
```

Vérifier que les 3 nouvelles migrations s'appliquent sans erreur :
- `20260419_165648_add_release_date_to_media_items`
- `20260419_180857_add_collections`
- `20260419_180940_add_collection_items`

- [x] Les 3 migrations s'appliquent sans erreur.

## 1. Structure des tables

```powershell
docker exec -it 03_developpement-postgres-1 psql -U collec -d collec_club
```

```sql
-- Tables présentes
\dt collections
\dt collection_items

-- Colonnes de collections
\d collections

-- Index unique sur collection_items
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'collection_items';
-- Attendu : collection_media_item_idx UNIQUE sur (collection_id, media_item_id)

-- Colonne release_date sur media_items
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'media_items' AND column_name = 'release_date';
```

- [x] Tables `collections` et `collection_items` présentes.
- [x] Index unique `collection_media_item_idx` sur `collection_items`.
- [x] Colonne `release_date` (timestamp) présente sur `media_items`.

## 2. Obtenir un token admin

```powershell
$loginAdmin = Invoke-RestMethod `
  -Uri "http://localhost:3001/api/admins/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@collec-club.fr","password":"ton-mot-de-passe-admin"}'

$adminToken = $loginAdmin.token
echo $adminToken   # doit afficher un JWT non vide
```

- [x] `$adminToken` non vide.

## 3. Re-sync TMDB pour populer release_date

Re-importer Dune et Breaking Bad depuis le panel TMDB dans l'admin.

- [x] Naviguer vers `/admin/collections/media-items`.
- [x] Importer "Dune: Part One (2021)" -> champ `release_date` renseigné.
  - Note : l'admin Payload affiche la date au format MM/JJ/AAAA (locale US). La valeur stockée en base est ISO 8601.
- [x] Importer "Breaking Bad" -> champ `release_date` renseigné.

## 4. Création d'une collection

- [x] Naviguer vers `/admin/collections/collections` -> bouton "Create New".
- [x] Remplir : `slug` = `filmographie-denis-villeneuve`, `title` = "La filmographie de Denis Villeneuve", `short_description` = "Toutes les réalisations du cinéaste québécois, de Maelström à Dune." (< 140 chars), `type` = "Filmographie complète", `accessibility_level` = "Accessible", `is_published` = false.
- [x] Sauvegarder -> "Updated successfully."
- [x] Tester la validation : `short_description` de 141+ caractères -> "Maximum 140 caractères (actuel : 415)."

## 5. Ajout d'items via l'onglet Items

- [x] Dans l'edit view de la collection, l'onglet "Items" s'affiche (join field).
- [x] Cliquer "Create New" dans l'onglet Items -> sélectionner "Dune" comme `media_item`, ajouter une note "Chef-d'oeuvre SF.", sauvegarder.
- [x] Ajouter un 2e item : "Breaking Bad" (ou un autre media_item disponible).

## 6. Test unicité (doublon refusé)

Récupérer les ids réels depuis l'admin (URL de l'edit view) et remplacer ci-dessous.

```powershell
$collectionId = 1   # adapter selon l'id réel
$mediaItemId  = 1   # adapter selon l'id réel (Dune)

try {
    $r = Invoke-WebRequest `
      -Uri "http://localhost:3001/api/collection-items" `
      -Method POST `
      -Headers @{ Authorization = "Bearer $adminToken" } `
      -ContentType "application/json" `
      -Body "{`"collection`":$collectionId,`"media_item`":$mediaItemId}"
} catch {
    $r = $_.Exception.Response
}
[int]$r.StatusCode   # attendu : 400 ou 500 (violation contrainte unique)
```

- [x] Résultat : `400` (violation de l'index unique `collection_media_item_idx`).

## 7. Lecture publique conditionnelle

### 7.1 Collection non publiée -> 0 docs pour le public

```powershell
$slug = "filmographie-denis-villeneuve"

$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/collections?where[slug][equals]=$slug"

echo $r.StatusCode                          # attendu : 200
($r.Content | ConvertFrom-Json).totalDocs   # attendu : 0
```

- [x] Résultat : `200`, `totalDocs = 0` (collection non publiée invisible au public).

### 7.2 Publier la collection

- [x] Dans l'edit view, cocher `is_published = true`, sauvegarder.

### 7.3 Collection publiée -> visible publiquement

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/collections?where[slug][equals]=$slug"

echo $r.StatusCode                          # attendu : 200
($r.Content | ConvertFrom-Json).totalDocs   # attendu : 1
```

- [x] Résultat : `200`, `totalDocs = 1`.

### 7.4 Admin voit tout (publiée ou non)

Dépublier la collection (décocher `is_published`, sauvegarder) puis :

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/collections?where[slug][equals]=$slug" `
  -Headers @{ Authorization = "Bearer $adminToken" }

echo $r.StatusCode                          # attendu : 200
($r.Content | ConvertFrom-Json).totalDocs   # attendu : 1
```

- [x] Résultat : `totalDocs = 1` même avec `is_published = false`.

## 8. Sécurité : customer ne peut pas créer une collection

Prérequis : token customer (`$customerToken`) obtenu comme à l'étape 05 (section 7.1 de `media-items-manual-tests.md`).

```powershell
try {
    $r = Invoke-WebRequest `
      -Uri "http://localhost:3001/api/collections" `
      -Method POST `
      -Headers @{ Authorization = "Bearer $customerToken" } `
      -ContentType "application/json" `
      -Body '{"slug":"test","title":"Test","short_description":"Test","type":"thematic","accessibility_level":"accessible"}'
} catch {
    $r = $_.Exception.Response
}
[int]$r.StatusCode   # attendu : 403
```

- [x] Résultat : 403.
