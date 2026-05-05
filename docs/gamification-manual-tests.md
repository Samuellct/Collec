# Tests manuels — Étape 18 : Gamification et badges

---

## 0. Préparer les icônes de badges

### 0.1 Catalogue des 7 badges V1

Chaque badge correspond à un `condition_type` défini dans la collection `Badges`. Les 7 badges à créer sont :

| Slug | Titre | Description | condition_type |
|---|---|---|---|
| `premiere-collection` | Première collection | Tu as complété ta toute première collection. C'est parti. | `first_collection` |
| `premier-parcours` | Premier parcours | Tu as suivi ton premier parcours éditorial de bout en bout. | `first_pathway` |
| `dix-vus` | L'habitude commence | 10 œuvres au compteur. Le cinéma devient une routine. | `milestone_10` |
| `cinquante-vus` | Cinéphile débutant | 50 œuvres vues. Tu sais ce que tu cherches. | `milestone_50` |
| `cent-vus` | Amateur éclairé | 100 œuvres. Tu navigues dans le cinéma avec aisance. | `milestone_100` |
| `grande-cinematheque` | Cinéphile confirmé | 250 œuvres vues. Une culture construite film après film. | `milestone_250` |
| `encyclopediste` | Encyclopédiste | 500 œuvres. Une mémoire du cinéma que peu partagent. | `milestone_500` |

### 0.2 Spécifications des fichiers SVG

**Format :** SVG uniquement. Pas de PNG, pas de WebP.

**ViewBox :** `0 0 80 80`. Taille d'affichage dans l'UI : `48px` (profil) et `32px` (toast).

**Structure recommandée :** un cercle de fond (`r="40"`) + une icône centrée dessinée en traits (`stroke`). Pas de dégradé vif. Pas de filtre CSS. Pas de texte embarqué dans le SVG (le titre est géré par le champ `title` du badge).

**Palette par catégorie :**

Trois familles de couleurs, chacune dérivée de la charte sans s'en écarter.

| Catégorie | Fond doux | Stroke du cercle | Stroke de l'icône |
|---|---|---|---|
| **Collections** | `#ECF2ED` | Vert sauge `#4E7A5A` | `#1A1C1E` |
| **Parcours** | `#EAEEF3` | Bleu ardoise `#4A6B8C` | `#1A1C1E` |
| **Films — 10** | `#F9EDE7` | Cuivre `#B85C38` | `#B85C38` |
| **Films — 50** | `#F9EEE3` | Cuivre orangé `#B86838` | `#B86838` |
| **Films — 100** | `#F8EFE0` | Ambre `#B58040` | `#B58040` |
| **Films — 250** | `#F6EFD8` | Laiton `#B5964D` | `#B5964D` |
| **Films — 500** | `#F5EDD0` | Doré `#B8A450` | `#B8A450` |

Le vert sauge et le bleu ardoise sont des teintes dessaturées, dans les mêmes valeurs de luminosité que le cuivre et le laiton. Ils s'intègrent sans rupture sur le fond `#F4EFE6`. Les badges films suivent une progression chromatique continue : le rouge-cuivre du premier jalon vire progressivement vers le doré du dernier.

`stroke-width` entre `1.8` et `2.2` sur toutes les icônes. Pas de `fill` sur les icônes (traits uniquement).

**Attribution des couleurs par badge :**

| Slug | Fond | Stroke cercle | Stroke icône |
|---|---|---|---|
| `premiere-collection` | `#ECF2ED` | `#4E7A5A` | `#1A1C1E` |
| `premier-parcours` | `#EAEEF3` | `#4A6B8C` | `#1A1C1E` |
| `dix-vus` | `#F9EDE7` | `#B85C38` | `#B85C38` |
| `cinquante-vus` | `#F9EEE3` | `#B86838` | `#B86838` |
| `cent-vus` | `#F8EFE0` | `#B58040` | `#B58040` |
| `grande-cinematheque` | `#F6EFD8` | `#B5964D` | `#B5964D` |
| `encyclopediste` | `#F5EDD0` | `#B8A450` | `#B8A450` |

**Motifs d'icônes suggérés (à dessiner en SVG) :**

| Slug | Motif |
|---|---|
| `premiere-collection` | Étagère minimaliste (3 livres verticaux) |
| `premier-parcours` | Flèche courbe vers la droite |
| `dix-vus` | Chiffre `10` en Fraunces, ou pellicule à 10 cases |
| `cinquante-vus` | Pellicule de cinéma (bobine vue de dessus) |
| `cent-vus` | Étoile à 5 branches (trait, pas remplie) |
| `grande-cinematheque` | Colonnade minimaliste (3 colonnes) |
| `encyclopediste` | Couronne ouverte (3 pointes) |

### 0.3 Où déposer les fichiers

```
03_Developpement/
  public/
    badges/
      premiere-collection.svg
      premier-parcours.svg
      dix-vus.svg
      cinquante-vus.svg
      cent-vus.svg
      grande-cinematheque.svg
      encyclopediste.svg
```

Le dossier `public/` de Next.js est servi statiquement à la racine. Un fichier déposé dans `public/badges/foo.svg` est accessible via `http://localhost:3000/badges/foo.svg`.

### 0.4 Comment renseigner l'icône dans l'admin

Dans `/admin` > **Gamification** > **Badges** > ouvrir un badge > champ **icon_url** :

Saisir le chemin public sans le domaine, par exemple :

```
/badges/premiere-collection.svg
```

L'UI lit ce champ via le composant `<BadgeIcon>` et affiche le SVG dans une balise `<img>`. Si le champ est vide, un trophée par défaut est affiché.

---

## Prérequis

- Docker en cours d'exécution : `docker compose up -d`
- Application démarrée : `pnpm dev`
- Un compte administrateur et au moins deux comptes customer créés
- URL locale : `http://localhost:3000`
- Panel admin : `http://localhost:3000/admin`

---

## 1. Création de badges en admin

### 1.1 Créer les badges de test

Dans l'admin (`/admin`) > section **Gamification** > **Badges** :

Créer les badges suivants (un par un). Les slugs, titres et descriptions sont définis en section 0.1. Le champ `icon_url` doit pointer vers `/badges/[slug].svg` (voir section 0.3).

| Slug | Titre | condition_type | icon_url |
|---|---|---|---|
| `premiere-collection` | Première collection | `first_collection` | `/badges/premiere-collection.svg` |
| `premier-parcours` | Premier parcours | `first_pathway` | `/badges/premier-parcours.svg` |
| `dix-vus` | L'habitude commence | `milestone_10` | `/badges/dix-vus.svg` |
| `cinquante-vus` | Cinéphile débutant | `milestone_50` | `/badges/cinquante-vus.svg` |
| `cent-vus` | Amateur éclairé | `milestone_100` | `/badges/cent-vus.svg` |
| `grande-cinematheque` | Cinéphile confirmé | `milestone_250` | `/badges/grande-cinematheque.svg` |
| `encyclopediste` | Encyclopédiste | `milestone_500` | `/badges/encyclopediste.svg` |

**Vérifications :**
- [ ] Le champ `slug` est en lecture seule (readOnly) — impossible de le modifier après création
- [ ] Le champ `condition_type` affiche les 7 options du menu déroulant
- [ ] Les badges sont listés dans la colonne "Gamification" du menu admin

---

## 2. Attribution automatique — `first_collection`

### 2.1 Préparer une collection courte (2-3 films max)

Dans `/admin` > **Catalogue** > **Collections**, vérifier qu'il existe une collection avec 2 films seulement.

### 2.2 Marquer les films comme vus

Connecté avec un compte customer :
1. Aller sur la page `/collections/[slug]` de cette petite collection
2. Marquer le premier film comme vu
3. Marquer le deuxième film comme vu (dernier de la collection)

**Vérification via l'admin :**

```powershell
# Vérifier dans l'admin > Gamification > UserBadges
# Un enregistrement doit apparaître pour ce customer avec le badge "premiere-collection"
```

**Vérification via l'API REST Payload :**

```powershell
# Remplacer <JWT> par le token JWT du customer (récupérable depuis les cookies du navigateur)
$headers = @{ Authorization = "JWT <JWT>" }
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/user-badges?depth=1" -Headers $headers
$response.Content
```

**Attendu :** Un document UserBadge avec `badge.condition_type = "first_collection"` et un champ `earned_at`.

---

## 3. Attribution automatique — `first_pathway`

### 3.1 Préparer un parcours court

Dans `/admin` > **Editorial** > **Parcours**, vérifier qu'il existe un parcours avec 2 étapes seulement.

### 3.2 Marquer les étapes comme vues

Connecté avec le même compte customer :
1. Aller sur la page `/parcours/[slug]`
2. Marquer la première étape comme vue
3. Marquer la deuxième étape (dernière) comme vue

**Vérification admin :** Un deuxième UserBadge avec `condition_type = "first_pathway"` doit apparaître.

---

## 4. Attribution automatique — milestones

### 4.1 Test du jalon 10 œuvres

Avec un compte customer qui a déjà des films vus :

```powershell
# Compter les UserWatchedItems de ce customer dans l'admin
# Admin > Progression > Éléments vus
```

Marquer des films supplémentaires jusqu'à atteindre exactement 10 au total.

**Vérification :** Un UserBadge avec `condition_type = "milestone_10"` doit exister dans l'admin.

### 4.2 Test idempotence milestone

Marquer un 11e film comme vu.

**Vérification :** Un seul badge `milestone_10` doit exister (pas de doublon).

```powershell
$headers = @{ Authorization = "JWT <JWT>" }
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/user-badges?where[badge][condition_type][equals]=milestone_10&depth=0" -Headers $headers
($response.Content | ConvertFrom-Json).totalDocs
# Attendu : 1
```

---

## 5. Idempotence générale

### 5.1 Marquer / démarquer un film dans une collection complétée

Avec la collection de test déjà à 100% :
1. Retirer un film (clic "Retirer")
2. Re-marquer ce film comme vu

**Vérification :** Le badge `premiere-collection` ne doit PAS avoir de doublon dans l'admin.

```powershell
$headers = @{ Authorization = "JWT <JWT>" }
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/user-badges?depth=1" -Headers $headers
$data = $response.Content | ConvertFrom-Json
$data.totalDocs
# Attendu : même nombre qu'avant (pas de badge créé en double)
```

---

## 6. Toast de félicitations

### 6.1 Vérifier l'apparition du toast

Avec un compte customer qui n'a pas encore gagné le badge `premiere-collection` :
1. Sur la page de la petite collection, marquer le dernier film manquant
2. Observer le bas-droit de l'écran

**Attendu :**
- [ ] Un toast apparaît en bas à droite avec le titre du badge
- [ ] Le toast disparaît automatiquement après 6 secondes
- [ ] Le toast peut être fermé en cliquant dessus ou sur le X

### 6.2 Animation (navigateur standard)

- [ ] Le toast entre en fondu + glissement vers le haut (opacity + translateY)
- [ ] La transition dure environ 300ms

### 6.3 Test prefers-reduced-motion

Dans le navigateur (Chrome/Edge) :
1. Ouvrir DevTools > Rendering > Emulate CSS media feature `prefers-reduced-motion: reduce`
2. Déclencher l'apparition d'un toast

**Attendu :** Le toast apparaît immédiatement sans animation.

### 6.4 Toast depuis la fiche film

1. Aller sur `/films/[slug]` d'un film appartenant à une collection presque terminée
2. Cliquer "Marquer comme vu"

**Attendu :** Si le film complète la collection, le toast badge apparaît.

### 6.5 Toast depuis un parcours

1. Aller sur `/parcours/[slug]` d'un parcours presque terminé
2. Marquer la dernière étape

**Attendu :** Si le parcours est complété (premier parcours du compte), le toast badge apparaît.

---

## 7. Affichage des badges sur le profil

### 7.1 Section "Mes badges" visible

Connecté avec le compte customer ayant gagné des badges :
1. Aller sur `/profil`

**Attendu :**
- [ ] Une section "Mes badges" apparaît en bas de la page
- [ ] Les badges sont affichés en grille (3 colonnes mobile, 4-5 colonnes desktop)
- [ ] Chaque badge affiche : icône (ou trophée par défaut), titre, date d'obtention

### 7.2 Tri par date décroissante

**Attendu :** Le badge le plus récemment obtenu apparaît en premier.

### 7.3 État vide

Avec un nouveau compte customer sans badges :
1. Aller sur `/profil`

**Attendu :** Le message "Aucun badge pour l'instant. Continue à explorer !" est affiché.

### 7.4 Responsive mobile

Réduire la fenêtre à moins de 640px.

**Attendu :** La grille passe à 3 colonnes.

---

## 8. Contrôle d'accès

### 8.1 Endpoint `/api/badges/recent` — non authentifié

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/badges/recent?since=2025-01-01T00:00:00Z" -UseBasicParsing
$response.StatusCode
# Attendu : 401
```

### 8.2 Un customer ne peut pas lire les badges d'un autre

Via l'API REST Payload :

```powershell
# Connecté avec Customer A (JWT du customer A)
$headersA = @{ Authorization = "JWT <JWT_CUSTOMER_A>" }
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/user-badges?depth=1" -Headers $headersA
$data = $response.Content | ConvertFrom-Json
# Vérifier que seuls les badges du Customer A sont retournés
# Les badges du Customer B ne doivent PAS apparaître
```

### 8.3 Endpoint `/api/badges/recent` — paramètre manquant

```powershell
$headers = @{ Authorization = "JWT <JWT>" }
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/badges/recent" -Headers $headers -UseBasicParsing
$response.StatusCode
# Attendu : 400
```

---

## 9. Test ESLint

```powershell
pnpm lint
# Attendu : aucune erreur
```

---

## 10. Test TypeScript

```powershell
pnpm tsc --noEmit
# Attendu : aucune erreur
```
