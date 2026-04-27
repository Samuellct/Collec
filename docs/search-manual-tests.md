# Tests manuels — Étape 10 : Recherche (PostgreSQL FTS)

Prérequis : `docker compose up -d` + `pnpm dev` démarrés. Au moins 2-3 films importés depuis l'admin TMDB.

---

## 1. Structure des index FTS

Vérifier que les index GIN existent bien sur `media_items` :

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'media_items'
AND indexname IN (
  'media_items_fts_idx',
  'media_items_title_trgm_idx',
  'media_items_original_title_trgm_idx'
);
```

Commande rapide via Docker :

```bash
docker compose exec postgres psql -U collec -d collec_club -c "\di media_items*"
```

- [ ] `media_items_fts_idx` présent (GIN, tsvector sur title + original_title + synopsis + director + cast)
- [ ] `media_items_title_trgm_idx` présent (GIN, gin_trgm_ops)
- [ ] `media_items_original_title_trgm_idx` présent (GIN, gin_trgm_ops)
- [ ] Extension `pg_trgm` active : `SELECT * FROM pg_extension WHERE extname = 'pg_trgm';`

---

## 2. Champs director et cast sur les imports TMDB

Importer un film avec réalisateur et casting connus depuis l'admin (`/admin/collections/media-items`).
Exemple recommandé : "The Godfather" ou "Dune (2021)".

- [ ] Après import, l'edit view affiche un champ `director` rempli (ex. "Francis Ford Coppola").
- [ ] Le champ `cast` est rempli avec les acteurs principaux séparés par virgule (max 10).
- [ ] Pour une série, `director` correspond au `created_by` TMDB (ex. "Vince Gilligan" pour Breaking Bad).
- [ ] Re-importer un film déjà en base -> `director` et `cast` mis à jour (upsert idempotent).

---

## 3. Validation de l'endpoint — cas limites

```bash
# Trop court (1 caractère) -> 400
curl -s "http://localhost:3001/api/search?q=a" | jq .

# Trop long (101 caractères) -> 400
curl -s "http://localhost:3001/api/search?q=$(python3 -c 'print("a"*101)')" | jq .

# Absent -> 400
curl -s "http://localhost:3001/api/search" | jq .
```

- [ ] `q` de 1 caractère -> HTTP 400, message `"Query must be between 2 and 100 characters"`
- [ ] `q` de 101 caractères -> HTTP 400
- [ ] `q` absent -> HTTP 400

---

## 4. SEARCH-01 — Recherche par titre

Adapter les exemples selon les films effectivement importés.

```bash
# Recherche exacte
curl -s "http://localhost:3001/api/search?q=godfather" | jq '.results[] | {title, director, fts_rank}'

# Titre partiel
curl -s "http://localhost:3001/api/search?q=father" | jq '.results[] | {title, fts_rank}'

# Titre original (anglais)
curl -s "http://localhost:3001/api/search?q=space+odyssey" | jq '.results[] | {title, original_title}'
```

- [ ] Recherche exacte sur le titre FR retourne le film avec `fts_rank > 0`.
- [ ] Recherche sur le titre original (anglais) retourne le film.
- [ ] Recherche partielle sur un mot du titre retourne le film.
- [ ] Réponse contient les champs : `id`, `title`, `original_title`, `year`, `poster_url`, `director`, `cast`, `media_type_slug`, `media_type_label`.

---

## 5. SEARCH-01 — Tolérance aux fautes (pg_trgm)

```bash
# 1 faute sur le titre
curl -s "http://localhost:3001/api/search?q=godfater" | jq '.results[] | {title, trgm_rank}'

# 2 fautes
curl -s "http://localhost:3001/api/search?q=godfahter" | jq '.results[] | {title, trgm_rank}'
```

- [ ] 1 caractère manquant ou transposé -> film retourné via trigram (`trgm_rank > 0`, `fts_rank = 0`).
- [ ] 2 caractères incorrects -> film toujours retourné.
- [ ] Requête sans rapport (ex. "xyz") -> `{"results":[]}`.

---

## 6. SEARCH-02 — Recherche par réalisateur

```bash
# Nom exact
curl -s "http://localhost:3001/api/search?q=kubrick" | jq '.results[] | {title, director}'

# Faute sur le nom (1 lettre)
curl -s "http://localhost:3001/api/search?q=kubrik" | jq '.results[] | {title, director}'

# Prénom seul
curl -s "http://localhost:3001/api/search?q=stanley" | jq '.results[] | {title, director}'
```

- [ ] Nom exact du réalisateur -> tous ses films retournés.
- [ ] Faute d'1 lettre sur le nom -> films retournés via `word_similarity`.
- [ ] Prénom seul -> films retournés (le prénom est dans le tsvector).

---

## 7. SEARCH-02 — Recherche par acteur

```bash
# Acteur principal
curl -s "http://localhost:3001/api/search?q=pacino" | jq '.results[] | {title, cast}'

# Prénom et nom
curl -s "http://localhost:3001/api/search?q=al+pacino" | jq '.results[] | {title, cast}'
```

- [ ] Nom d'un acteur présent dans `cast` -> film retourné.
- [ ] Prénom + nom -> film retourné.

---

## 8. Rate limiting

Envoyer 31 requêtes rapides depuis la même IP :

```bash
for i in $(seq 1 31); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/search?q=test")
  echo "Req $i: HTTP $STATUS"
done
```

- [ ] Requêtes 1 à 30 -> HTTP 200.
- [ ] Requête 31 -> HTTP 429.
- [ ] Attendre 60 secondes et relancer -> HTTP 200 à nouveau (fenêtre réinitialisée).

---

## 9. Sécurité

```bash
# Tentative d'injection SQL via le paramètre q
curl -s "http://localhost:3001/api/search?q='; DROP TABLE media_items; --" | jq .

# Caractères spéciaux
curl -s "http://localhost:3001/api/search?q=<script>alert(1)</script>" | jq .
```

- [ ] Injection SQL -> retourne `{"results":[]}` ou HTTP 400 sans erreur serveur (paramètre bien échappé via drizzle sql template).
- [ ] Caractères spéciaux -> pas d'erreur 500, réponse JSON valide.
- [ ] Vérifier les logs serveur : aucune trace du paramètre `q` en clair dans les logs.

---

## 10. Performance

```bash
# Mesurer le temps de réponse
time curl -s "http://localhost:3001/api/search?q=godfather" > /dev/null
```

- [ ] Temps de réponse < 500 ms sur le catalogue de test.
- [ ] Même ordre de grandeur sur une requête sans résultats.
