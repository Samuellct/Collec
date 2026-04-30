# Guide de tests manuels — Étape 16 : Page d'exploration

## Prérequis

```powershell
# Démarrer PostgreSQL
docker-compose up -d

# Démarrer le serveur de dev
pnpm dev
```

Ouvrir le navigateur sur `http://localhost:3000`.

---

## Test 1 — Accès non connecté

**Objectif** : la page est publique, aucun redirect.

1. Se déconnecter (ou ouvrir une fenêtre privée).
2. Naviguer vers `http://localhost:3000/explorer`.
3. Vérifier : la page se charge sans redirect vers `/login`.
4. Vérifier : aucun badge "En cours" ou "Terminée" sur les cartes de collection.

**Résultat attendu** : page visible, cartes sans distinction de progression.

---

## Test 2 — Structure de la page

**Objectif** : titre, barre de recherche, deux sections.

1. Naviguer vers `http://localhost:3000/explorer`.
2. Vérifier :
   - Titre "Découvrir" en Fraunces.
   - Sous-titre "Collections et parcours à compléter."
   - Barre de recherche avec placeholder "Rechercher une collection ou un parcours…"
   - Section "Collections" avec titre h2.
   - Section "Parcours" avec titre h2.

---

## Test 3 — Cartes de collection

**Objectif** : affichage correct des données de collection.

Pour chaque carte de collection visible :

1. Vérifier : titre de la collection affiché en Fraunces.
2. Vérifier : `short_description` affichée (max 2 lignes).
3. Vérifier : badge d'accessibilité présent ("Accessible", "Curieux" ou "Cinéphile").
4. Vérifier : compteur d'oeuvres affiché ("N oeuvres").
5. Vérifier : si `cover_image_url` renseignée → image affichée en haut de la carte.
6. Vérifier : si pas de cover → bande de posters (jusqu'à 4 affiches).
7. Cliquer sur une carte → redirige vers `/collections/[slug]`.

---

## Test 4 — Cartes de parcours

**Objectif** : affichage correct des données de parcours.

Pour chaque carte de parcours visible :

1. Vérifier : icône ◎ laiton à gauche.
2. Vérifier : titre en Fraunces.
3. Vérifier : `subtitle` affiché si renseigné.
4. Vérifier : badge d'accessibilité présent.
5. Vérifier : nombre d'étapes affiché ("N étapes").
6. Vérifier : durée estimée affichée si renseignée ("~Xh").
7. Cliquer sur une carte → redirige vers `/parcours/[slug]`.

---

## Test 5 — Recherche avec résultats

**Objectif** : filtre en temps réel sur titre et description.

1. Taper au moins 2 caractères correspondant à un titre de collection connu (ex : "villa").
2. Vérifier : les cartes se filtrent immédiatement.
3. Effacer → toutes les cartes réapparaissent.
4. Taper le nom d'un parcours → la section Parcours filtre correctement.

---

## Test 6 — Recherche sans résultat

**Objectif** : message approprié quand aucun résultat.

1. Taper une chaîne qui ne correspond à aucune collection ni parcours (ex : "zzzxxx").
2. Vérifier : le message "Aucune collection ni parcours ne correspond à «zzzxxx»." est affiché.
3. Vérifier : les deux sections (Collections, Parcours) sont masquées.

---

## Test 7 — COLL-06 : distinction visuelle (utilisateur connecté)

**Objectif** : badges de progression sur les collections.

**Prérequis** : être connecté avec un compte ayant au moins une collection en cours et une terminée.

1. Connecter le compte.
2. Naviguer vers `http://localhost:3000/explorer`.
3. Collection non démarrée : carte normale, aucun badge.
4. Collection en cours (progression > 0, non terminée) :
   - Badge "En cours · X %" affiché (texte cuivre).
   - Barre de progression cuivre visible sous la cover/posters.
5. Collection terminée :
   - Badge "✓ Terminée" affiché (texte laiton).
   - Bordure de la carte en laiton.
   - Barre de progression laiton pleine.

---

## Test 8 — Ordre d'affichage

**Objectif** : respect du `display_order` défini en admin.

1. Dans l'admin Payload (`http://localhost:3000/admin`), vérifier l'ordre `display_order` des collections publiées.
2. Sur `/explorer`, vérifier que les collections apparaissent dans le même ordre.

---

## Test 9 — Responsive mobile

**Objectif** : mise en page mobile fonctionnelle.

1. Ouvrir les DevTools → passer en vue mobile (360px de large).
2. Vérifier :
   - Barre de recherche pleine largeur.
   - Cartes de collection en colonne unique (1 carte par ligne).
   - Cartes de parcours empilées verticalement.
   - Texte lisible, pas de débordement horizontal.

---

## Test 10 — État vide

**Objectif** : message approprié si aucune collection/parcours publiée.

> Ce test nécessite de passer temporairement toutes les collections à `is_published: false` dans l'admin.

1. Dans l'admin, dépublier toutes les collections.
2. Naviguer vers `/explorer`.
3. Vérifier : message "Aucune collection disponible pour le moment." dans la section Collections.
4. Republier les collections.
