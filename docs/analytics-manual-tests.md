# Tests manuels — Étape 19 : Analytics (Umami)

**Environnement** : PowerShell 5.1, Windows  
**Prérequis** : Docker Desktop actif, projet démarré via `pnpm dev`

---

## Préparation

```powershell
# Démarrer la base de données applicative (si pas déjà lancée)
docker compose up -d postgres

# Démarrer le serveur Next.js
pnpm dev
# -> http://localhost:3001
```

---

## Test 1 — Script non injecté sans configuration

**Objectif** : vérifier que le composant `Analytics` ne produit aucun script quand les variables d'environnement sont absentes.

```powershell
# Vérifier que NEXT_PUBLIC_UMAMI_SCRIPT_URL est vide dans .env.local
Select-String -Path ".env.local" -Pattern "NEXT_PUBLIC_UMAMI_SCRIPT_URL"
```

1. Ouvrir `http://localhost:3001` dans le navigateur.
2. Ouvrir les outils de développement (F12) > onglet **Sources** ou **Éléments**.
3. Chercher `umami` dans le HTML source (`Ctrl+U`).

**Résultat attendu** : aucun script Umami dans le DOM. Pas d'erreur en console.

---

## Test 2 — Script injecté avec configuration

**Objectif** : vérifier que le script Umami est bien injecté quand les variables sont définies.

```powershell
# Ajouter les variables dans .env.local
# NEXT_PUBLIC_UMAMI_SCRIPT_URL=http://localhost:3002/script.js
# NEXT_PUBLIC_UMAMI_WEBSITE_ID=test-website-id-placeholder

# Redémarrer le serveur pour prendre en compte les nouvelles variables
# Ctrl+C pour stopper, puis :
pnpm dev
```

1. Ouvrir `http://localhost:3001`.
2. Ouvrir les outils de développement > onglet **Éléments** > chercher `<script`.

**Résultat attendu** : un tag `<script async src="http://localhost:3002/script.js" data-website-id="test-website-id-placeholder">` présent dans le DOM.

---

## Test 3 — Vérification des événements dans la console

**Objectif** : confirmer que les appels `window.umami?.track()` ne génèrent aucune erreur (Umami non disponible = appel silencieux grâce à `?.`).

1. Ouvrir `http://localhost:3001/collections/<slug-d-une-collection>` (remplacer par un slug réel).
2. Ouvrir les outils de développement > onglet **Console**.
3. Taper dans la console :
   ```js
   window.umami
   ```
   **Résultat attendu** : `undefined` (Umami non chargé car l'URL de script n'est pas réelle). Aucune erreur levée.

4. Simuler le tracking manuellement :
   ```js
   window.umami?.track('test_event', { context: 'manual' })
   ```
   **Résultat attendu** : aucune erreur, appel silencieux.

5. Tester `collection_view` : recharger la page collection. Aucune erreur en console.

6. Tester `item_mark` : si une collection avec des oeuvres est disponible, cliquer sur "Marquer comme vu". Aucune erreur en console.

---

## Test 4 — Événements `parcours_start` et `parcours_complete`

**Objectif** : valider le déclenchement sur premier marquage et sur complétion.

1. Ouvrir `http://localhost:3001/parcours/<slug-d-un-parcours>`.
2. S'assurer d'être connecté avec un compte dont le parcours n'a aucune progression.
3. Ouvrir la Console navigateur.
4. Injecter un espion temporaire :
   ```js
   window.umami = { track: (event, data) => console.log('[UMAMI]', event, data) }
   ```
5. Cliquer sur "Marquer comme vu" sur la première étape du parcours.

**Résultat attendu en console** :
```
[UMAMI] item_mark { context: 'parcours', slug: '<slug>' }
[UMAMI] parcours_start { slug: '<slug>' }
```

6. Marquer toutes les étapes restantes.

**Résultat attendu sur la dernière étape** :
```
[UMAMI] item_mark { context: 'parcours', slug: '<slug>' }
[UMAMI] parcours_complete { slug: '<slug>' }
```

---

## Test 5 — Événement `item_mark` depuis la fiche film

1. Ouvrir `http://localhost:3001/films/<slug-d-un-film>`.
2. Injecter l'espion Umami dans la console (voir Test 4).
3. Cliquer sur "Marquer comme vu" et confirmer la date.

**Résultat attendu** :
```
[UMAMI] item_mark { context: 'film' }
```

---

## Test 6 — Démarrage Docker Compose avec Umami (optionnel en local)

**Objectif** : vérifier que les services `umami` et `umami-db` démarrent correctement.

```powershell
# Ajouter dans .env les variables Umami Docker
# UMAMI_POSTGRES_PASSWORD=umamidevpass
# UMAMI_APP_SECRET=random_secret_string_32_chars_min

# Démarrer les services Umami
docker compose up -d umami-db umami

# Vérifier le statut
docker compose ps
```

**Résultat attendu** : services `umami` et `umami-db` en état `running` (healthy).

```powershell
# Vérifier les logs Umami
docker compose logs umami --tail 20
```

**Résultat attendu** : message indiquant que le serveur Umami écoute sur le port 3000 (accessible sur http://localhost:3002).

1. Ouvrir `http://localhost:3002` dans le navigateur.
2. **Résultat attendu** : interface de connexion Umami (identifiants par défaut : admin / umami).

---

## Test 7 — Réception des événements dans Umami (test complet)

**Prérequis** : Umami démarré (Test 6 réussi), NEXT_PUBLIC_UMAMI_SCRIPT_URL et NEXT_PUBLIC_UMAMI_WEBSITE_ID configurés.

1. Se connecter à `http://localhost:3002`.
2. Créer un site ("Add website"), récupérer le **Website ID** et l'URL du script.
3. Mettre à jour `.env.local` avec les valeurs réelles :
   ```
   NEXT_PUBLIC_UMAMI_SCRIPT_URL=http://localhost:3002/script.js
   NEXT_PUBLIC_UMAMI_WEBSITE_ID=<id-copie-depuis-umami>
   ```
4. Redémarrer `pnpm dev`.
5. Naviguer sur `http://localhost:3001/collections/<slug>`.
6. Marquer une oeuvre comme vue.
7. Revenir sur le dashboard Umami > **Events**.

**Résultat attendu** : les événements `collection_view` et `item_mark` apparaissent dans le tableau des événements Umami.

---

## Checklist finale

| Test | Attendu | OK ? |
|------|---------|------|
| 1. Pas de script sans config | Aucun tag script Umami dans le DOM | |
| 2. Script injecté avec config | Tag script présent dans le DOM | |
| 3. Pas d'erreur sans Umami | `window.umami` = undefined, aucune erreur | |
| 4. `parcours_start` au 1er marquage | Log UMAMI parcours_start au 1er clic | |
| 4. `parcours_complete` à la fin | Log UMAMI parcours_complete sur dernière étape | |
| 5. `item_mark` depuis fiche film | Log UMAMI item_mark context film | |
| 6. Docker Umami démarre | Services healthy sur docker compose ps | |
| 7. Events reçus dans Umami | Events visibles dans dashboard Umami | |
