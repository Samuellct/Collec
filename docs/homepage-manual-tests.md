# Guide de tests manuels — Étape 17 : Page d'accueil

## Prérequis

```powershell
# Démarrer PostgreSQL
docker-compose up -d

# Démarrer le serveur de dev
pnpm dev
```

Ouvrir le navigateur sur `http://localhost:3000`.

---

## Test 1 — Hero non-connecté : headline V1

**Objectif** : la headline principale est affichée pour les visiteurs non connectés.

1. Se déconnecter (ou ouvrir une fenêtre privée).
2. Naviguer vers `http://localhost:3000`.
3. Vérifier : le titre "Construis ta culture, film après film." est visible en grand (Fraunces, bold).
4. Vérifier : le sous-titre "Complète des collections de films et de séries..." est visible.

**Résultat attendu** : headline V1 affichée, police Fraunces.

---

## Test 2 — CTAs non-connecté

**Objectif** : les boutons d'action redirigent correctement.

1. En mode non-connecté sur `http://localhost:3000`.
2. Vérifier : bouton "Commence ta collec" présent (fond cuivre).
3. Cliquer "Commence ta collec" → redirige vers `/inscription`.
4. Revenir, cliquer "Découvrir" → redirige vers `/explorer`.

**Résultat attendu** : CTAs fonctionnels, couleur cuivre pour le bouton principal.

---

## Test 3 — Collections visibles (non-connecté)

**Objectif** : affichage des 6 premières collections publiées.

1. Sur `http://localhost:3000` non-connecté.
2. Vérifier : section "Collections" présente avec titre.
3. Lien "Voir toutes" à droite → redirige vers `/explorer`.
4. Pour chaque carte visible :
   - Titre de la collection affiché.
   - Description courte visible (2 lignes max).
   - Badge d'accessibilité ("Accessible", "Curieux" ou "Cinéphile").
   - Nombre d'oeuvres affiché.
   - Image de couverture ou bande de posters.
5. Cliquer une carte → redirige vers `/collections/[slug]`.

**Résultat attendu** : jusqu'à 6 cartes, grille responsive.

---

## Test 4 — Parcours visibles (non-connecté)

**Objectif** : affichage des 3 premiers parcours publiés.

1. Sur `http://localhost:3000` non-connecté.
2. Vérifier : section "Parcours" présente avec titre.
3. Pour chaque carte visible :
   - Icône ◎ laiton à gauche.
   - Titre du parcours en Fraunces.
   - Sous-titre si renseigné.
   - Badge d'accessibilité.
   - Nombre d'étapes.
   - Durée estimée ("~Xh") si renseignée.
4. Cliquer une carte → redirige vers `/parcours/[slug]`.

**Résultat attendu** : jusqu'à 3 cartes parcours.

---

## Test 5 — Hero connecté : salutation et stats

**Objectif** : le hero change pour l'utilisateur connecté.

1. Se connecter avec un compte ayant des oeuvres vues.
2. Naviguer vers `http://localhost:3000`.
3. Vérifier : "Bonjour, [pseudo]." affiché (pas la headline V1).
4. Vérifier : stat "X oeuvres vues" affichée en cuivre.
5. Vérifier : bouton "Découvrir de nouvelles collections" → `/explorer`.

**Résultat attendu** : hero personnalisé avec pseudo et count.

---

## Test 6 — Collections en cours (connecté)

**Objectif** : section de progression pour les collections démarrées.

**Prérequis** : compte avec au moins une collection en cours (percentage > 0, non terminée).

1. Se connecter.
2. Sur `http://localhost:3000`, vérifier : section "Tes collections en cours" présente.
3. Pour chaque ligne :
   - Fan de posters (jusqu'à 3 posters superposés + compteur "+N restants").
   - Titre de la collection.
   - Compteur "X sur Y oeuvres vues".
   - Barre de progression cuivre.
4. Cliquer une ligne → redirige vers `/collections/[slug]`.
5. Lien "Voir tout" → `/profil`.

**Résultat attendu** : jusqu'à 3 collections en cours, fan de posters fonctionnel.

---

## Test 7 — Vus récemment (connecté)

**Objectif** : grille des dernières oeuvres vues.

**Prérequis** : compte avec au moins une oeuvre marquée comme vue.

1. Se connecter.
2. Sur `http://localhost:3000`, vérifier : section "Vus récemment" présente.
3. Vérifier : affiche (ratio 2/3) + titre + année pour chaque item.
4. Hover sur une affiche → léger mouvement vers le haut.
5. Cliquer une affiche → redirige vers `/films/[slug]`.

**Résultat attendu** : jusqu'à 8 affiches en grille auto-fill.

---

## Test 8 — Connecté sans progression

**Objectif** : section utilisateur absente si aucune progression.

**Prérequis** : compte sans aucune oeuvre vue ni collection démarrée.

1. Se connecter avec un compte vierge.
2. Sur `http://localhost:3000`, vérifier : pas de section "Tes collections en cours" ni "Vus récemment".
3. Vérifier : sections "Collections" et "Parcours" toujours présentes.

**Résultat attendu** : page affiche uniquement le hero (connecté) + sections publiques.

---

## Test 9 — Responsive mobile (360px)

**Objectif** : mise en page mobile fonctionnelle.

1. Ouvrir les DevTools → vue mobile 360px.
2. Vérifier :
   - Hero : texte pleine largeur, boutons empilés si besoin.
   - Grille collections : 1 colonne.
   - Cartes parcours : pleine largeur.
   - Fan de posters (si connecté) : visible sans débordement horizontal.
   - Grille "Vus récemment" : au moins 3 colonnes (minmax 80px).

---

## Test 10 — Metadata

**Objectif** : titre et description corrects pour le SEO.

1. Naviguer vers `http://localhost:3000`.
2. Vérifier dans les DevTools (onglet Elements → `<head>`) :
   - `<title>` : "Collec Club — La culture à compléter."
   - `<meta name="description">` : contient "Construis ta culture film après film."
