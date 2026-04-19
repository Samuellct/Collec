# Tests manuels - Étape 07 : Pathways et PathwaySteps

**Statut : A TESTER**

Prérequis : `docker compose up -d postgres` + `pnpm dev` démarrés.

## 0. Appliquer les migrations

```powershell
# Depuis 03_Developpement/
pnpm payload migrate
```

Vérifier que les 3 nouvelles migrations s'appliquent sans erreur :
- `20260419_190000_add_pathways`
- `20260419_190100_add_pathway_steps`
- `20260419_190200_add_linked_pathway_to_collections`

- [ ] Les 3 migrations s'appliquent sans erreur.

## 1. Structure des tables

```powershell
docker exec -it 03_developpement-postgres-1 psql -U collec -d collec_club
```

```sql
-- Tables présentes
\dt pathways
\dt pathway_steps

-- Index uniques sur pathway_steps
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'pathway_steps';
-- Attendu : pathway_position_idx UNIQUE sur (pathway_id, position)
-- Attendu : pathway_media_item_idx UNIQUE sur (pathway_id, media_item_id)

-- Colonne linked_pathway_id sur collections
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'collections' AND column_name = 'linked_pathway_id';
```

- [ ] Tables `pathways` et `pathway_steps` présentes.
- [ ] Index unique `pathway_position_idx` sur `pathway_steps`.
- [ ] Index unique `pathway_media_item_idx` sur `pathway_steps`.
- [ ] Colonne `linked_pathway_id` présente sur `collections`.

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

- [ ] `$adminToken` non vide.

## 3. Création d'un parcours

- [ ] Naviguer vers `/admin/collections/pathways` -> bouton "Create New".
- [ ] Remplir :
  - `slug` = `nouvelle-vague-naissance-cinema`
  - `title` = "La Nouvelle Vague, naissance d'un cinéma"
  - `type` = "Chronologie historique"
  - `accessibility_level` = "Curieux"
  - `estimated_duration_hours` = 13
  - `introduction` = (coller l'introduction du doc UX, section Parcours 1)
  - `is_published` = false
- [ ] Sauvegarder -> "Updated successfully."

## 4. Ajout d'étapes via l'onglet Steps

- [ ] Dans l'edit view du parcours, l'onglet "Steps" s'affiche (join field).
- [ ] Cliquer "Create New" -> sélectionner "Dune" comme `media_item`, position = 1, ajouter `step_editorial` (150+ mots). Sauvegarder.
- [ ] Ajouter une 2e étape : "Breaking Bad", position = 2.
- [ ] Ajouter une 3e étape : position = 3 (un autre media_item disponible).
- [ ] Les étapes s'affichent triées par position dans l'onglet.

## 5. Test unicité position

Récupérer les ids réels depuis l'admin (URL de l'edit view).

```powershell
$pathwayId = 1   # adapter selon l'id réel
$mediaItemId = 2   # adapter (un media_item différent de ceux déjà à position 1)

try {
    $r = Invoke-WebRequest `
      -Uri "http://localhost:3001/api/pathway-steps" `
      -Method POST `
      -Headers @{ Authorization = "Bearer $adminToken" } `
      -ContentType "application/json" `
      -Body "{`"pathway`":$pathwayId,`"media_item`":$mediaItemId,`"position`":1,`"step_editorial`":`"Test editorial avec suffisamment de contenu.`"}"
} catch {
    $r = $_.Exception.Response
}
[int]$r.StatusCode   # attendu : 400 ou 500 (violation index unique pathway_position_idx)
```

- [ ] Résultat : `400` (violation de l'index unique sur (pathway, position)).

## 6. Test unicité media_item

```powershell
$mediaItemId1 = 1   # adapter (Dune, déjà à position 1)

try {
    $r = Invoke-WebRequest `
      -Uri "http://localhost:3001/api/pathway-steps" `
      -Method POST `
      -Headers @{ Authorization = "Bearer $adminToken" } `
      -ContentType "application/json" `
      -Body "{`"pathway`":$pathwayId,`"media_item`":$mediaItemId1,`"position`":4,`"step_editorial`":`"Test doublon media_item dans le même parcours.`"}"
} catch {
    $r = $_.Exception.Response
}
[int]$r.StatusCode   # attendu : 400 ou 500 (violation index unique pathway_media_item_idx)
```

- [ ] Résultat : `400` (violation de l'index unique sur (pathway, media_item)).

## 7. Lecture publique conditionnelle

### 7.1 Parcours non publié -> 0 docs pour le public

```powershell
$slug = "nouvelle-vague-naissance-cinema"

$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/pathways?where[slug][equals]=$slug"

echo $r.StatusCode                          # attendu : 200
($r.Content | ConvertFrom-Json).totalDocs   # attendu : 0
```

- [ ] Résultat : `200`, `totalDocs = 0` (parcours non publié invisible au public).

### 7.2 Publier le parcours

- [ ] Dans l'edit view, cocher `is_published = true`, sauvegarder.

### 7.3 Parcours publié -> visible publiquement

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/pathways?where[slug][equals]=$slug"

echo $r.StatusCode                          # attendu : 200
($r.Content | ConvertFrom-Json).totalDocs   # attendu : 1
```

- [ ] Résultat : `200`, `totalDocs = 1`.

### 7.4 Admin voit tout (publié ou non)

Dépublier le parcours (décocher `is_published`, sauvegarder) puis :

```powershell
$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/pathways?where[slug][equals]=$slug" `
  -Headers @{ Authorization = "Bearer $adminToken" }

echo $r.StatusCode                          # attendu : 200
($r.Content | ConvertFrom-Json).totalDocs   # attendu : 1
```

- [ ] Résultat : `totalDocs = 1` même avec `is_published = false`.

## 8. Lien bidirectionnel Collections <-> Pathways

- [ ] Republier le parcours (cocher `is_published = true`, sauvegarder).
- [ ] Naviguer vers la collection "filmographie-denis-villeneuve" dans `/admin/collections/collections`.
- [ ] Dans le champ `linked_pathway`, sélectionner "La Nouvelle Vague, naissance d'un cinéma".
- [ ] Sauvegarder -> "Updated successfully."
- [ ] Via GET admin, vérifier que `linked_pathway_id` est non nul :

```powershell
$collectionSlug = "filmographie-denis-villeneuve"

$r = Invoke-WebRequest `
  -Uri "http://localhost:3001/api/collections?where[slug][equals]=$collectionSlug" `
  -Headers @{ Authorization = "Bearer $adminToken" }

$doc = ($r.Content | ConvertFrom-Json).docs[0]
$doc.linked_pathway   # attendu : id non nul du parcours lié
```

- [ ] `linked_pathway` non nul.

## 9. Sécurité : customer ne peut pas créer un parcours

Prérequis : token customer (`$customerToken`) obtenu comme dans `media-items-manual-tests.md` section 7.1.

```powershell
try {
    $r = Invoke-WebRequest `
      -Uri "http://localhost:3001/api/pathways" `
      -Method POST `
      -Headers @{ Authorization = "Bearer $customerToken" } `
      -ContentType "application/json" `
      -Body '{"slug":"test","title":"Test","introduction":"Test intro","type":"thematic","accessibility_level":"accessible","is_published":false}'
} catch {
    $r = $_.Exception.Response
}
[int]$r.StatusCode   # attendu : 403
```

- [ ] Résultat : 403.
