# Tests manuels — Étape 19 : Analytics (Umami)

**Environnement** : PowerShell 5.1, Windows  
**Prérequis** : Docker Desktop actif, projet démarré via `pnpm dev`

---

## Note sur les fichiers d'environnement

| Fichier | Lu par | Contenu requis |
|---------|--------|----------------|
| `.env` | Docker Compose | `POSTGRES_PASSWORD`, `UMAMI_POSTGRES_PASSWORD`, `UMAMI_APP_SECRET` |
| `.env.local` | Next.js | Toutes les variables, dont `NEXT_PUBLIC_UMAMI_SCRIPT_URL`, `NEXT_PUBLIC_UMAMI_WEBSITE_ID` |

Les variables `NEXT_PUBLIC_*` dans `.env` ne sont pas lues par Next.js — elles peuvent y rester vides.

---

## Test 1 — Script non injecté sans configuration

**Objectif** : vérifier que le composant `Analytics` ne produit aucun script quand les variables d'environnement sont absentes.

```powershell
# Vérifier que NEXT_PUBLIC_UMAMI_SCRIPT_URL est absent de .env.local
Select-String -Path ".env.local" -Pattern "NEXT_PUBLIC_UMAMI_SCRIPT_URL"
```

1. Ouvrir `http://localhost:3001` dans le navigateur.
2. Menu > **Afficher le source de la page** (`Ctrl+U`).
3. Chercher `umami` dans le source.

**Résultat attendu** : aucun script Umami dans le DOM. Pas d'erreur en console.

---

## Test 2 — Script injecté avec configuration

**Objectif** : vérifier que le script Umami est bien injecté quand les variables sont définies.

```powershell
# Dans .env.local, ajouter :
# NEXT_PUBLIC_UMAMI_SCRIPT_URL=http://localhost:3002/script.js
# NEXT_PUBLIC_UMAMI_WEBSITE_ID=test-website-id-placeholder

# Redémarrer le serveur (Ctrl+C, puis pnpm dev)
pnpm dev
```

1. Ouvrir `http://localhost:3001`.
2. Afficher la source (`Ctrl+U`), chercher `umami`.

**Résultat attendu** :
```html
<script src="http://localhost:3002/script.js" async="" data-website-id="test-website-id-placeholder" data-nscript="afterInteractive"></script>
```
L'attribut `data-nscript="afterInteractive"` est ajouté automatiquement par Next.js — c'est normal.

---

## Test 3 — Pas d'erreur JS sans instance Umami active

**Objectif** : confirmer que les appels `window.umami?.track()` ne génèrent aucune erreur JS.

1. Ouvrir `http://localhost:3001/collections/<slug>` avec `.env.local` configuré (Test 2).
2. Ouvrir les outils de développement > onglet **Console**.
3. Vérifier :
   ```js
   window.umami
   // -> undefined (Umami non chargé : le script est en ERR_CONNECTION_REFUSED)
   ```
4. Simuler manuellement :
   ```js
   window.umami?.track('test_event', { context: 'manual' })
   // -> undefined, aucune erreur
   ```

**Note** : l'erreur `GET http://localhost:3002/script.js net::ERR_CONNECTION_REFUSED` dans la console est attendue tant qu'Umami n'est pas démarré. Ce n'est pas une erreur applicative.

**Résultat attendu** : `window.umami` est `undefined`, aucune erreur JS levée.

---

## Test 4 — Événements `parcours_start` et `parcours_complete` (à réaliser avec le contenu V1)

**Prérequis** : au moins un parcours créé dans l'admin Payload avec des étapes.

**Méthode** : injecter un espion Umami dans la console **avant** d'interagir.

1. Ouvrir `http://localhost:3001/parcours/<slug>`.
2. S'assurer d'être connecté avec un compte sans progression sur ce parcours.
3. Ouvrir la console et injecter l'espion :
   ```js
   window.umami = { track: (event, data) => console.log('[UMAMI]', event, JSON.stringify(data)) }
   ```
4. Cliquer "Marquer comme vu" sur la première étape.

**Résultat attendu** :
```
[UMAMI] item_mark {"context":"parcours","slug":"<slug>"}
[UMAMI] parcours_start {"slug":"<slug>"}
```

5. Marquer toutes les étapes restantes. Sur la dernière :
```
[UMAMI] item_mark {"context":"parcours","slug":"<slug>"}
[UMAMI] parcours_complete {"slug":"<slug>"}
```

---

## Test 5 — Événement `item_mark` depuis la fiche film

**Prérequis** : au moins un film importé depuis TMDB.

1. Ouvrir `http://localhost:3001/films/<slug>`.
2. Ouvrir la console et injecter l'espion **avant de cliquer** :
   ```js
   window.umami = { track: (event, data) => console.log('[UMAMI]', event, JSON.stringify(data)) }
   ```
3. Cliquer "Marquer comme vu" et confirmer la date.

**Résultat attendu** :
```
[UMAMI] item_mark {"context":"film"}
```

---

## Test 6 — Démarrage Docker Compose avec Umami

**Objectif** : vérifier que les services `umami` et `umami-db` démarrent correctement.

```powershell
# Dans .env, ajouter (valeurs de dev) :
# UMAMI_POSTGRES_PASSWORD=umamidevpass
# UMAMI_APP_SECRET=une_chaine_aleatoire_suffisamment_longue

# Démarrer les services Umami
docker compose up -d umami-db umami

# Vérifier le statut
docker compose ps
```

**Résultat attendu** : services `umami` et `umami-db` en état `running`.

```powershell
# Vérifier les logs
docker compose logs umami --tail 20
```

**Note** : Umami écoute sur le port 3000 **à l'intérieur du conteneur**, mappé sur 3002 **sur la machine hôte**. Accéder à `http://localhost:3002` — c'est le comportement Docker normal.

---

## Test 7 — Réception des événements dans Umami (test complet)

**Prérequis** : Test 6 réussi (Umami accessible sur http://localhost:3002).

### Étape A — Créer un site dans Umami

1. Ouvrir `http://localhost:3002` dans le navigateur.
2. Se connecter avec les identifiants par défaut : **admin / umami** (changer le mot de passe ensuite).
3. Cliquer sur **Settings** (icône engrenage) > **Websites** > **Add website**.
4. Renseigner un nom (ex. "Collec Club dev") et le domaine `localhost`.
5. Après création, cliquer sur le site > **Edit** > onglet **Tracking code**.
6. Copier le **Website ID** (format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

### Étape B — Configurer Next.js

```powershell
# Dans .env.local, mettre à jour :
# NEXT_PUBLIC_UMAMI_SCRIPT_URL=http://localhost:3002/script.js
# NEXT_PUBLIC_UMAMI_WEBSITE_ID=<id-copie-depuis-umami>

# Redémarrer le serveur
pnpm dev
```

### Étape C — Vérifier la réception des events

1. Ouvrir `http://localhost:3001/collections/<slug>` dans un **second onglet**.
2. Dans le dashboard Umami (`http://localhost:3002`), ouvrir le site créé.
3. Attendre quelques secondes — la page vue doit apparaître dans le tableau de bord.
4. Marquer une oeuvre comme vue depuis la page collection.
5. Dans Umami > onglet **Events** : les événements `collection_view` et `item_mark` doivent apparaître.

**Résultat attendu** : events listés dans Umami avec le nom, le slug, et l'horodatage.

---

## Checklist finale

| Test | Attendu | Résultat |
|------|---------|----------|
| 1. Pas de script sans config | Aucun tag script Umami dans le DOM | ✅ |
| 2. Script injecté avec config | Tag script avec `data-website-id` présent | ✅ |
| 3. Pas d'erreur JS sans Umami | `window.umami` = undefined, aucune erreur | ✅ |
| 4. `parcours_start` au 1er marquage | Log UMAMI parcours_start (à tester avec le contenu) | En attente étape 20 |
| 4. `parcours_complete` à la fin | Log UMAMI parcours_complete (à tester avec le contenu) | En attente étape 20 |
| 5. `item_mark` depuis fiche film | Log UMAMI item_mark context film | À tester |
| 6. Docker Umami démarre | Services healthy sur `docker compose ps` | ✅ |
| 7. Events reçus dans Umami | Events visibles dans dashboard Umami | À tester |
