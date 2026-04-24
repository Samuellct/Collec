# Tests manuels - Étape 08 Progression

Prérequis : `docker-compose up -d` + `pnpm dev` + au moins un customer créé et vérifié + au moins une collection avec des items et un media_item importé depuis TMDB.

## 1. Marquer un média depuis l'admin Payload

1. Ouvrir `/admin` → Collection "User Watched Items" → Create.
2. Renseigner un customer, un media_item, une date de visionnage.
3. Sauvegarder.
4. Ouvrir "User Collection Progress" → vérifier qu'une entrée a été créée pour le customer et la collection contenant ce media_item.
   - `items_seen` doit valoir 1, `items_total` doit correspondre au nombre d'items de la collection.
   - `percentage` doit être calculé correctement.

## 2. Modifier la date de visionnage (correction)

1. Éditer l'entrée "User Watched Items" créée à l'étape 1.
2. Changer la valeur de `watched_at`.
3. Sauvegarder.
4. Vérifier dans "User Collection Progress" que `items_seen` et `percentage` n'ont PAS changé (la modification de date ne change pas l'état "vu").

## 3. Supprimer un marquage

1. Supprimer l'entrée "User Watched Items" de l'étape 1.
2. Ouvrir "User Collection Progress" → vérifier que `items_seen` a diminué d'une unité et que `percentage` a été recalculé.
3. Si la collection était marquée `is_completed: true`, vérifier qu'elle repasse à `false` et que `completed_at` est `null`.

## 4. Complétion d'une collection

1. Marquer tous les items d'une collection via "User Watched Items".
2. Ouvrir "User Collection Progress" → vérifier `is_completed: true` et `completed_at` renseigné.
3. Supprimer un marquage → vérifier que `is_completed` repasse à `false` et `completed_at` est `null`.

## 5. Access control

```bash
# S'authentifier comme customer A
TOKEN_A=$(curl -s -X POST http://localhost:3001/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@example.com","password":"testpass"}' | jq -r '.token')

# Lire ses propres entrées user-collection-progress (doit fonctionner)
curl -s http://localhost:3001/api/user-collection-progress \
  -H "Authorization: Bearer $TOKEN_A" | jq '.totalDocs'

# S'authentifier comme customer B
TOKEN_B=$(curl -s -X POST http://localhost:3001/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"b@example.com","password":"testpass"}' | jq -r '.token')

# Tenter de lire la progression de A avec le token de B (doit renvoyer 0 docs)
curl -s http://localhost:3001/api/user-collection-progress \
  -H "Authorization: Bearer $TOKEN_B" | jq '.totalDocs'
```

## 6. Progression d'un parcours

1. Créer un parcours dans l'admin avec au moins 3 étapes (pathway-steps).
2. Marquer le media_item de la première étape via "User Watched Items".
3. Vérifier dans "User Pathway Progress" qu'une entrée est créée : `steps_completed: 1`, `steps_total: 3`, `percentage: 33`.
4. Marquer les deux autres étapes.
5. Vérifier `is_completed: true`, `percentage: 100`, `completed_at` renseigné.
