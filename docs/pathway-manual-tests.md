# Tests manuels — Étape 13 : Page d'un parcours

Guide de test pour la page `/parcours/[slug]`. Tous les tests sont exécutables dans PowerShell 5.1.

**Prérequis** : Docker Compose actif, `pnpm dev` lancé sur `http://localhost:3001`, au moins un parcours publié dans l'admin Payload avec des étapes et des médias associés.

---

## 0. Préparer l'environnement

```powershell
# Vérifier que le serveur répond
Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing | Select-Object -ExpandProperty StatusCode
# Attendu : 200
```

---

## 1. Accès à un parcours publié

```powershell
# Remplacer [slug] par le slug d'un parcours publié (ex: nouvelle-vague-naissance-cinema)
$slug = "VOTRE_SLUG_ICI"
$response = Invoke-WebRequest -Uri "http://localhost:3001/parcours/$slug" -UseBasicParsing
$response.StatusCode
# Attendu : 200

# Vérifier la présence du titre
$response.Content -match "Parcours éditorial"
# Attendu : True
```

**Vérifications visuelles dans le navigateur :**
- Kicker "PARCOURS ÉDITORIAL" en cuivre, uppercase
- Titre en Fraunces, grand
- Sous-titre en Fraunces italic muted (si renseigné)
- Tag accessibility (Accessible / Curieux / Cinéphile) en fond cuivre doux
- Nombre d'étapes affiché
- Durée estimée affichée (si renseignée)
- Introduction en Source Serif 4, max-width 680px
- Breadcrumb : "Explorer / [Titre]"

---

## 2. Slug invalide ou parcours non publié → 404

```powershell
$response404 = Invoke-WebRequest -Uri "http://localhost:3001/parcours/slug-inexistant" -UseBasicParsing -ErrorAction SilentlyContinue
$response404.StatusCode
# Attendu : 404
```

---

## 3. Timeline — état des étapes (utilisateur non connecté)

Dans le navigateur, en mode déconnecté :
- Vérifier que la page est accessible et lisible
- Vérifier la présence du connecteur vertical entre les étapes (ligne 1px grise)
- Première étape : dot avec chiffre "1", bordure grise, label "Étape 1"
- Les étapes futures ont le texte en couleur subtle

---

## 4. États visuels des étapes (avec progression)

Connecter un compte ayant des étapes partiellement vues.

**Étape complétée :**
- Dot : fond cuivre + coche blanche
- Label : "Étape N — Complétée" en couleur subtle
- Titre : couleur muted
- Texte éditorial : couleur muted
- Carte film : badge "Vu" en cuivre
- Bouton "Retirer" visible sous la carte

**Étape en cours (première non-vue) :**
- Dot : bordure cuivre + numéro en cuivre, gras
- Label : "Étape N — En cours" en cuivre
- Titre : couleur ink normale
- Bloc éditorial avec bordure gauche 3px cuivre + fond surface-strong
- Carte film (48px de large, ratio 2/3)
- Bouton "Marquer comme vu" en fond cuivre

**Étapes à venir :**
- Dot : bordure grise + numéro en muted
- Label : "Étape N" en subtle
- Titre : ink (ou muted selon variation)
- Texte éditorial : couleur subtle

---

## 5. Connecteur vertical entre les étapes

Vérifier dans le navigateur :
- Une ligne verticale relie chaque étape à la suivante
- La dernière étape n'a pas de ligne en bas

---

## 6. Modal de date (étape en cours)

Cliquer sur "Marquer comme vu" dans l'étape en cours :
- La modal apparaît au centre de l'écran
- 3 options radio : "Aujourd'hui" (pré-sélectionnée), "Hier", "Une autre date"
- "Annuler" ferme la modal sans action
- Clic backdrop ferme et marque avec la date du jour
- Touche Échap ferme et marque avec la date du jour
- "Une autre date" : input date apparaît, bouton Confirmer désactivé jusqu'à saisie

---

## 7. Optimistic update — marquage

Cliquer "Marquer comme vu" > Confirmer :
- Instantanément : l'étape passe à l'état "done" (dot cuivre + coche)
- L'étape suivante passe immédiatement à "current" (dot bordure cuivre)
- Après re-render serveur : état confirmé avec le vrai watchedItemId

---

## 8. Bouton "Retirer" sur étape complétée

Sur une étape complétée :
- Bouton "Retirer" visible sous la carte film
- Cliquer "Retirer" : étape repasse à l'état "current" instantanément (optimistic)
- Le bouton "Marquer comme vu" réapparaît
- Après re-render serveur : état confirmé

---

## 9. Progression du parcours (utilisateur connecté)

```powershell
# Après avoir marqué N étapes, recharger la page et vérifier :
# - "N étapes complétées · M restantes"
# - Barre de progression avec fill proportionnel
# - Pourcentage en Fraunces 2.8rem
```

**Si `percentage = 100` :**
- Trophée laiton visible
- Texte "Parcours complété !" en laiton

---

## 10. Utilisateur non connecté — prompt au clic "Marquer comme vu"

En mode déconnecté, cliquer le bouton "Marquer comme vu" :
- Pas de modal de date
- Un banner apparaît en bas de timeline : "Connecte-toi pour suivre ta progression. Se connecter"
- Lien "Se connecter" pointe vers `/login`
- Le banner reste visible jusqu'à navigation

---

## 11. Carte film dans les étapes

Pour chaque étape, vérifier la carte film :
- Poster 48px, ratio 2/3, ombre
- Titre du film en Source Serif 4
- Réalisateur · Année (si renseignés)
- Badge "Vu" en cuivre sur les étapes complétées
- Lien vers `/films/[id]` (404 temporaire, normal à ce stade)
- Hover : bordure cuivre + ombre douce

---

## 12. Responsive mobile

Réduire la fenêtre à moins de 680px :
- Colonne spine réduite de 56px à 40px
- Espacement gap réduit
- Le contenu reste lisible
- Le bloc "current" ne dépasse pas la largeur de l'écran

---

## 13. Vérifications qualité

```powershell
# Depuis le dossier 03_Developpement
pnpm type-check
# Attendu : 0 erreur

pnpm lint
# Attendu : 0 avertissement, 0 erreur

pnpm test
# Attendu : 82 tests passent, 0 régression
```

---

## Checklist finale

| Test | Résultat |
|------|----------|
| Page 200 sur slug valide publié | |
| 404 sur slug invalide / non publié | |
| Hero : kicker, titre, sous-titre, méta | |
| Étape complétée : dot cuivre + coche + "Vu" + "Retirer" | |
| Étape en cours : dot cuivre bordure + bloc éditorial accent | |
| Étapes à venir : dot gris + texte subtle | |
| Connecteur vertical entre étapes | |
| Modal date : 3 options, confirmer, annuler, backdrop | |
| Optimistic update : état mis à jour immédiatement | |
| "Retirer" : retrait + retour à "en cours" | |
| Jauge : label + barre + pourcentage | |
| Complétion : trophée laiton + "Parcours complété !" | |
| Non connecté : prompt discret au clic "Marquer comme vu" | |
| Mobile < 680px : layout fonctionnel | |
| `pnpm type-check` : 0 erreur | |
| `pnpm lint` : 0 erreur | |
| `pnpm test` : 0 régression | |
