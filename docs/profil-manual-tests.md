# Tests manuels — Page de profil (`/profil`)

Étape 15 — Collec Club V1

## Pré-requis

```powershell
# Démarrer la base de données
docker-compose up -d

# Démarrer le serveur de développement
pnpm dev
```

L'application est accessible sur `http://localhost:3001`.

---

## Test 1 — Accès non connecté

**Objectif** : la page redirige vers `/login` si l'utilisateur n'est pas connecté.

```powershell
# Naviguer vers /profil sans être connecté
Start-Process "http://localhost:3001/profil"
```

**Résultat attendu** : redirection automatique vers `/login?next=/profil`.

---

## Test 2 — Structure de la page connecté

**Objectif** : la page charge correctement avec l'en-tête profil et le layout deux colonnes.

1. Se connecter avec un compte valide (`http://localhost:3001/login`)
2. Naviguer vers `http://localhost:3001/profil`

**Résultats attendus** :
- En-tête profil visible (avatar, pseudo, date d'inscription)
- Bandeau de statistiques (4 cellules)
- Colonne principale à gauche
- Sidebar à droite
- Titre de section "Activité récente" dans la sidebar

---

## Test 3 — Avatar et identité

**Objectif** : l'avatar affiche la première lettre du pseudo.

**Résultats attendus** :
- Cercle 56px avec gradient cuivre à bordeaux
- Initiale du pseudo en blanc, police Fraunces
- Pseudo en Fraunces 1.75rem sous l'avatar
- "Membre depuis [mois] [année]" en Source Sans 3 gris

---

## Test 4 — Statistiques films et séries

**Objectif** : les compteurs se mettent à jour après marquage.

1. Naviguer vers une collection contenant des films
2. Marquer 2 films comme vus
3. Retourner sur `/profil`

**Résultats attendus** :
- Compteur "Films vus" affiche 2
- Compteur "Séries vues" reste à 0

```powershell
# Vérifier les compteurs dans le DOM
$response = Invoke-WebRequest -Uri "http://localhost:3001/profil" -UseDefaultCredentials
$response.Content | Select-String "Films vus"
```

---

## Test 5 — Collection en cours

**Objectif** : une collection partiellement complétée apparaît dans "Collections en cours".

1. Naviguer vers une collection (ex. `/collections/kubrick-integrale`)
2. Marquer 3 films sur 10 comme vus
3. Retourner sur `/profil`

**Résultats attendus** :
- Section "Collections en cours" affiche la collection
- Pourcentage affiché en Fraunces cuivre (ex. "30 %")
- Meta "3 / 10 oeuvres"
- Barre de progression remplie à 30%
- La carte est cliquable (lien vers `/collections/[slug]`)

---

## Test 6 — Collection terminée

**Objectif** : une collection 100% complétée bascule dans "Collections terminées".

1. Compléter intégralement une collection courte (ex. une trilogie)
2. Retourner sur `/profil`

**Résultats attendus** :
- La collection n'apparaît plus dans "Collections en cours"
- Section "Collections terminées" visible avec la collection
- Barre de progression en laiton (couleur dorée)
- Icône trophée laiton à la place du pourcentage
- Meta "3 / 3 oeuvres"

---

## Test 7 — Parcours en cours et terminé

**Objectif** : les parcours suivent la même logique que les collections.

1. Naviguer vers un parcours, marquer quelques étapes
2. Retourner sur `/profil`

**Résultats attendus** :
- Section "Parcours en cours" affiche le parcours avec icône ◎ laiton
- Pourcentage affiché en cuivre
- Meta "N / Total étapes"

Compléter le parcours :

**Résultats attendus** :
- Le parcours bascule dans "Parcours terminés"
- Style fond cuivre doux, icône ✓ cuivre, bordure accent-soft

---

## Test 8 — Activité récente

**Objectif** : la sidebar affiche les actions récentes dans l'ordre chronologique.

1. Marquer 3 films en séquence (à quelques secondes d'intervalle)
2. Retourner sur `/profil`

**Résultats attendus** :
- Les 3 films apparaissent dans "Activité récente", le plus récent en premier
- Dot cuivre pour chaque film vu
- Label "Vu · [titre du film]"
- Date relative : "aujourd'hui"

Après avoir complété une collection :
- Entrée "Collection terminée · [titre]" avec dot laiton
- La collection apparaît avant les films si plus récente

---

## Test 9 — État vide (nouvel utilisateur)

**Objectif** : la page gère correctement un utilisateur sans aucune progression.

1. Créer un nouveau compte (`http://localhost:3001/register`)
2. Vérifier l'email et se connecter
3. Naviguer vers `/profil`

**Résultats attendus** :
- Bandeau statistiques : tous les compteurs à 0
- Section "Collections en cours" avec message :
  "Tu n'as pas encore démarré de collection. Explorer les collections" (lien cliquable)
- Sections "Collections terminées", "Parcours en cours", "Parcours terminés" : non affichées
- Sidebar "Activité récente" : "Aucune activité pour le moment."

---

## Test 10 — Responsive

**Objectif** : le layout passe en colonne unique sous 800px.

1. Ouvrir `/profil` dans le navigateur
2. Réduire la fenêtre en dessous de 800px de largeur

**Résultats attendus** :
- Colonne principale et sidebar empilées verticalement
- Sidebar "Activité récente" apparaît sous les sections principales
- Aucun débordement horizontal

```powershell
# Tester avec la DevTools (F12) en mode responsive
# Régler la largeur à 375px (iPhone SE)
```

---

## Test 11 — Vérification des liens

**Objectif** : chaque carte est un lien fonctionnel.

1. Cliquer sur une carte "Collection en cours"

**Résultat attendu** : navigation vers `/collections/[slug]` correspondant.

2. Cliquer sur une carte "Parcours en cours"

**Résultat attendu** : navigation vers `/parcours/[slug]` correspondant.

3. Cliquer sur "Explorer les collections" (état vide)

**Résultat attendu** : navigation vers `/explorer`.

---

## Checklist finale

| Test | Statut |
|------|--------|
| 1. Redirection non connecté | [ ] |
| 2. Structure page connecté | [ ] |
| 3. Avatar et identité | [ ] |
| 4. Compteurs films/séries | [ ] |
| 5. Collection en cours | [ ] |
| 6. Collection terminée | [ ] |
| 7. Parcours en cours et terminé | [ ] |
| 8. Activité récente | [ ] |
| 9. État vide | [ ] |
| 10. Responsive < 800px | [ ] |
| 11. Liens fonctionnels | [ ] |
