# Tests manuels - Étape 14 : Fiche film/série

## Environnement

PowerShell 5.1 uniquement. Serveur de développement actif sur `http://localhost:3000`.

```powershell
$BASE = "http://localhost:3000"
$VALID_ID = 1   # Remplacer par un ID existant dans la base
$SERIES_ID = 2  # Remplacer par l'ID d'une série (media_type.slug = 'series')
```

---

## 1. Accès et 404

```powershell
# 1.1 Film valide - doit retourner 200
Invoke-WebRequest "$BASE/films/$VALID_ID" -UseBasicParsing | Select-Object StatusCode

# 1.2 ID inexistant - doit retourner 404
Invoke-WebRequest "$BASE/films/99999" -UseBasicParsing -ErrorAction SilentlyContinue | Select-Object StatusCode

# 1.3 ID non numérique - doit retourner 404
Invoke-WebRequest "$BASE/films/abc" -UseBasicParsing -ErrorAction SilentlyContinue | Select-Object StatusCode
```

---

## 2. Hero - contenu

Vérifier manuellement dans le navigateur :

- Breadcrumb : "Explorer / {titre du film}", lien Explorer actif
- Poster : image chargée (ou fond gris si pas de poster_url)
- Titre `<h1>` en Fraunces, taille clamp 1.8rem à 2.8rem
- `original_title` affiché en italique muted si différent du titre FR ; absent si identique
- Tag media_type (ex. "Film" ou "Série") en cuivre sur fond accent-soft
- Director · year · durée dans la meta row (séparés par `·`, pas de tiret long)
- Synopsis affiché sous label "Synopsis" en cuivre uppercase
- Bouton "Marquer comme vu" en cuivre sous le poster

---

## 3. Formatage de la durée

Tester avec différents media items :

| Durée en base | media_type | Attendu |
|---|---|---|
| 98 minutes | film | `1h38` |
| 120 minutes | film | `2h` |
| 45 minutes | film | `45min` |
| 2 saisons | series (slug=series) | `2 saisons` |
| 1 saison | series | `1 saison` |
| null | film | durée absente |

---

## 4. FilmWatchButton - non connecté

1. Ouvrir `/films/$VALID_ID` sans être connecté
2. Cliquer sur "Marquer comme vu"
3. Vérifier qu'un prompt "Connecte-toi pour suivre ta progression." apparaît sous le bouton
4. Vérifier le lien "Connecte-toi" pointe vers `/login`
5. Aucune modal ne s'ouvre

---

## 5. FilmWatchButton - connecté

1. Se connecter avec un compte test
2. Ouvrir `/films/$VALID_ID` (film non vu)
3. Cliquer "Marquer comme vu" → DatePickerModal apparaît
4. Sélectionner "Aujourd'hui" → Confirmer
5. Vérifier que le bouton passe instantanément (optimistic) à "Vu · Retirer"
6. Après revalidation serveur, le bouton reste "Vu · Retirer"
7. Recharger la page → bouton toujours "Vu · Retirer"

---

## 6. FilmWatchButton - retirer

1. Film déjà marqué vu, bouton affiche "Vu · Retirer"
2. Cliquer "Vu · Retirer"
3. Bouton passe instantanément (optimistic) à "Marquer comme vu"
4. Recharger → film n'est plus dans les vus

---

## 7. DatePickerModal

1. Cliquer "Marquer comme vu" (connecté)
2. Modal ouverte : vérifier les 3 options radio (Aujourd'hui, Hier, Une autre date)
3. Sélectionner "Une autre date" → champ date apparaît
4. Bouton "Confirmer" désactivé tant que pas de date sélectionnée en mode custom
5. Cliquer backdrop (fond sombre) → modal se ferme, marquage se fait (comportement onClose)
6. Touche Echap → même comportement
7. Cliquer "Annuler" → modal se ferme sans marquer

---

## 8. Watch providers

Si le film a un `tmdb_id` valide et des providers en France :

- Section "Disponible sur" visible dans la sidebar
- Sous-section "Inclus" avec logos + noms (si flatrate disponible)
- Sous-section "Location" avec au maximum 4 providers (si rent disponible)
- Logo : image 28x28px depuis image.tmdb.org
- Attribution "Données JustWatch" visible

Si aucun provider pour ce film/pays :
- Section "Disponible sur" absente

---

## 9. Collections

Si le film appartient à des collections publiées :

- Section "Dans les collections" visible
- Chaque carte : mini-cover (ou fond gris), titre tronqué, lien vers `/collections/{slug}`
- Utilisateur connecté avec progress : "N/M oeuvres complétées" + pourcentage en cuivre
- Utilisateur sans progress sur cette collection : "Pas commencée" en muted
- Hover sur la carte : bordure passe en cuivre

Si le film n'appartient à aucune collection :
- Section absente

---

## 10. Parcours

Si le film appartient à des parcours publiés :

- Section "Dans les parcours" visible
- Chaque carte : icône laiton "◎", titre, "Étape N" + progress si connecté
- Progress affiché : "N/M complétées" + pourcentage en cuivre
- Sans progress : "À faire" en muted
- Lien vers `/parcours/{slug}` fonctionnel

Si le film n'appartient à aucun parcours :
- Section absente

---

## 11. Fallback aucun contexte

Pour un film sans collection ni parcours :
- Message "Ce film ne fait pas encore partie d'une collection ou d'un parcours." affiché en muted

---

## 12. Fiche technique (sidebar)

Vérifier dans la sidebar :

- Section "Fiche technique" toujours visible
- Lignes affichées uniquement si valeur non nulle :
  - Réalisation (director)
  - Avec (cast, comma-separated)
  - Année (year)
  - Durée (formatée)
- Lignes absentes si champ null en base

---

## 13. Responsive mobile

```
Largeur < 760px (ouvrir DevTools → 750px) :
- Hero : poster 140px | info column
- Body : 1 colonne (sidebar en dessous de la colonne principale)

Largeur < 640px (ouvrir DevTools → 390px) :
- Hero : poster 120px + bouton à droite du poster (flexbox horizontal)
- Info column en dessous
- Body : 1 colonne
```

---

## 14. Vérifications qualité

```powershell
# Type-check - 0 erreur attendue
pnpm type-check

# Lint - 0 warning attendu
pnpm lint

# Tests - 0 régression
pnpm test
```

---

## 15. Contrôle tirets longs

Inspecter le DOM : aucun caractère `-` (U+2014) ne doit apparaître dans les textes UI.
Utiliser la recherche navigateur (Ctrl+F, coller `-`) sur la page film.
