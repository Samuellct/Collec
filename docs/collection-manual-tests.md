# Tests manuels — Étape 12 : Page d'une collection

Prérequis : Docker Compose lancé, `pnpm dev` en cours, une collection publiée avec des films importés depuis TMDB.

---

## 1. Accès à une collection publiée

```powershell
# Remplacer [slug] par le slug d'une collection publiée (ex: kubrick-integrale)
$slug = "kubrick-integrale"
Invoke-WebRequest -Uri "http://localhost:3001/collections/$slug" -UseBasicParsing | Select-Object StatusCode
```

Résultat attendu : `StatusCode : 200`

Vérification manuelle dans le navigateur :
- Titre de la collection affiché en Fraunces (grande taille)
- Tag d'accessibilité visible en cuivre (ex: "Cinéphile")
- Nombre d'oeuvres affiché (ex: "13 oeuvres")
- Grille d'affiches visible sous la section "Oeuvres"

---

## 2. Slug invalide → 404

```powershell
Invoke-WebRequest -Uri "http://localhost:3001/collections/slug-inexistant" -UseBasicParsing | Select-Object StatusCode
```

Résultat attendu : `StatusCode : 404`

---

## 3. Grille d'affiches — structure visuelle

Vérification manuelle dans le navigateur :
- Chaque carte affiche un poster en aspect ratio 2/3 (portrait)
- L'image est nette, centrée, pas déformée
- Sous chaque poster : titre en Source Serif 4, année en Source Sans 3
- Bouton "Vu" visible sous chaque carte (non connecté ou connecté sans marquage)
- Aucun overlay sur les items non vus

---

## 4. Badge "Prochain" (connecté uniquement)

Prérequis : connecté avec un compte ayant quelques films vus.

Vérification manuelle :
- Un seul badge laiton "PROCHAIN" visible sur la carte du prochain item non vu
- Badge positionné en haut à gauche du poster

---

## 5. Tri chronologique (défaut)

Vérification manuelle :
- À l'ouverture, les films sont triés par date de sortie croissante (le plus ancien en premier)
- Le bouton "Chronologique" apparaît actif (fond cuivre soft)

---

## 6. Tri antéchronologique

Vérification manuelle :
- Cliquer "Antéchronologique" → films triés par date de sortie décroissante (le plus récent en premier)
- Le bouton "Antéchronologique" apparaît actif

---

## 7. Tri alphabétique

Vérification manuelle :
- Cliquer "Alphabétique" → films triés A-Z par titre
- Le bouton "Alphabétique" apparaît actif

---

## 8. Filtre "Non vus seulement"

Prérequis : connecté, au moins un film marqué "Vu".

Vérification manuelle :
- Cliquer "Non vus seulement" → seuls les films non vus s'affichent
- Le bouton "Non vus seulement" apparaît actif (fond cuivre soft)
- Re-cliquer → tous les films reviennent
- Le filtre se remet à zéro en quittant la page (session-only)

---

## 9. Marquage "Vu" — modal de date

Prérequis : connecté.

Vérification manuelle :
1. Cliquer "Vu" sur un item → la modal "Quand as-tu vu ce film ?" s'ouvre
2. "Aujourd'hui" est pré-sélectionné
3. Sélectionner "Hier" → option active
4. Sélectionner "Une autre date" → un champ date apparaît
5. Cliquer "Confirmer" → la modal se ferme
6. L'item affiche l'overlay cuivre + checkmark immédiatement (optimistic update)
7. Fermer la modal via Échap ou clic backdrop → applique la date du jour automatiquement

---

## 10. Optimistic update

Prérequis : connecté.

Vérification manuelle :
- Au clic "Vu" + "Confirmer" : l'overlay cuivre apparaît instantanément sans attendre le serveur
- Le bouton "Retirer" apparaît sous la carte marquée
- Quelques secondes plus tard (revalidatePath) : la jauge de progression se met à jour

---

## 11. Bouton "Retirer"

Prérequis : connecté, au moins un film marqué "Vu".

Vérification manuelle :
- Le bouton "Retirer" est visible sous chaque item marqué "Vu"
- Cliquer "Retirer" → l'overlay disparaît instantanément (optimistic)
- La jauge se met à jour après le re-render serveur

---

## 12. Jauge de progression

Prérequis : connecté, au moins un film marqué "Vu".

Vérification manuelle :
- La barre de progression est visible dans le hero (barre 5px, cuivre)
- Le label "X vus · Y restants" est correct
- Le pourcentage en Fraunces est affiché à droite
- Après marquage ou retrait : la jauge se met à jour

---

## 13. État "Collection complétée"

Prérequis : connecté, tous les films de la collection marqués "Vu".

Vérification manuelle :
- La barre est remplie à 100%
- Le message "Collection complétée !" avec une icône trophée apparaît en laiton au-dessus de la barre

---

## 14. CTA "Prochain" (NextItemCard)

Prérequis : connecté, pas encore vu tous les films.

Vérification manuelle :
- La carte "Prochain" apparaît entre la note éditoriale et la grille
- Elle affiche le titre et l'année du prochain item non vu
- Le lien pointe vers `/films/[id]` (404 temporaire, normal à ce stade)

---

## 15. Utilisateur non connecté

Vérification manuelle :
- La collection est accessible (200) sans connexion
- La grille d'affiches s'affiche avec tous les posters
- Aucune jauge de progression n'est affichée
- Aucun badge "Prochain" n'est affiché
- Les boutons "Vu" sont présents sur chaque carte
- Cliquer "Vu" → un banner "Connecte-toi pour suivre ta progression. Se connecter" apparaît sous la grille

---

## 16. Note éditoriale (si présente)

Vérification manuelle (sur une collection avec `editorial_note`) :
- Section "Note éditoriale" visible avec le label cuivre en majuscules
- Texte en Source Serif 4, max-width 660px, line-height 1.78

---

## 17. Responsive mobile

Vérification dans les DevTools (ou redimensionner la fenêtre) :
- À 680px et moins : 3 colonnes de posters
- À 400px et moins : 2 colonnes de posters
- Le titre (clamp) diminue de taille sur mobile

---

## 18. Vérifications techniques

```powershell
# Type-check
pnpm type-check

# Lint
pnpm lint

# Tests Vitest
pnpm test
```

Résultats attendus :
- `type-check` : 0 erreur
- `lint` : 0 avertissement
- `test` : 82+ tests passent
