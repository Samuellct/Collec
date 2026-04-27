# Tests manuels — Étape 10 : Recherche (PostgreSQL FTS)

**Statut : TOUS LES TESTS PASSENT — 27 avril 2026**

Prérequis : `docker compose up -d` + `pnpm dev` démarrés. Au moins 2-3 films importés depuis l'admin TMDB.

---

## 1. Structure des index FTS

```powershell
# Via psql dans le conteneur Docker
docker compose exec postgres psql -U collec -d collec_club -c "\di media_items*"
```

- [x] `media_items_fts_idx` présent (GIN, tsvector sur title + original_title + synopsis + director + cast)
- [x] `media_items_title_trgm_idx` présent (GIN, gin_trgm_ops)
- [x] `media_items_original_title_trgm_idx` présent (GIN, gin_trgm_ops)
- [x] Extension `pg_trgm` active.

---

## 2. Champs director et cast sur les imports TMDB

Importer un film et une série depuis l'admin (`/admin/collections/media-items`).

- [x] Après import d'un film, les champs `director` et `cast` sont bien remplis.
- [x] Après import d'une série, `director` correspond au `created_by` TMDB.
- [x] Re-importer un média déjà en base -> `director` et `cast` mis à jour (upsert idempotent).

---

## 3. Validation de l'endpoint — cas limites

```powershell
# Trop court (1 caractère)
Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=a"

# Trop long (101 caractères)
Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=$('a' * 101)"

# Paramètre absent
Invoke-RestMethod -Uri "http://localhost:3001/api/search"
```

- [x] `q` de 1 caractère -> HTTP 400, `"Query must be between 2 and 100 characters"`
- [x] `q` de 101 caractères -> HTTP 400, même message
- [x] `q` absent -> HTTP 400, même message

---

## 4. SEARCH-01 — Recherche par titre

Tests réalisés avec le film "Incendies" (2010, Denis Villeneuve).

```powershell
# Recherche exacte
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=incendies").results | Select-Object title, director, fts_rank

# Titre partiel
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=incendie").results | Select-Object title, director, fts_rank

# Titre original
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=incendies").results | Select-Object title, original_title
```

- [x] Recherche exacte -> film retourné, `fts_rank ≈ 0.076`.
- [x] Titre partiel ("Incendie") -> film "Incendies" retourné, `fts_rank = 0` (match trigram, pas FTS car mot incomplet).
- [x] Titre original -> film retourné avec `original_title` correct.
- [x] Réponse contient : `id`, `title`, `original_title`, `year`, `poster_url`, `director`, `cast`, `media_type_slug`, `media_type_label`.

---

## 5. SEARCH-01 — Tolérance aux fautes (pg_trgm)

```powershell
# 1 faute sur le titre
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=icendies").results | Select-Object title, trgm_rank

# 2 fautes
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=insendie").results | Select-Object title, trgm_rank
```

- [x] 1 faute ("icendies") -> "Incendies" retourné, `trgm_rank ≈ 0.58`.
- [x] 2 fautes ("insendie") -> "Incendies" retourné, `trgm_rank ≈ 0.36`.

---

## 6. SEARCH-02 — Recherche par réalisateur

Tests réalisés avec Denis Villeneuve.

```powershell
# Nom exact
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=villeneuve").results | Select-Object title, director

# Faute sur le nom (1 lettre manquante)
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=villeneve").results | Select-Object title, director

# Prénom seul
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=denis").results | Select-Object title, director
```

- [x] Nom exact -> films du réalisateur retournés.
- [x] Faute d'1 lettre ("Villeneve") -> films retournés via `word_similarity`.
- [x] Prénom seul ("Denis") -> films retournés (prénom indexé dans le tsvector).

---

## 7. SEARCH-02 — Recherche par acteur

```powershell
# Acteur principal (nom seul)
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=<nom-acteur>").results | Select-Object title, cast

# Prénom et nom
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=<prenom+nom>").results | Select-Object title, cast
```

- [x] Nom d'un acteur principal -> film retourné via FTS sur le champ `cast`.
- [x] Prénom + nom -> film retourné.

---

## 8. Rate limiting

```powershell
1..31 | ForEach-Object {
    $status = (Invoke-WebRequest -Uri "http://localhost:3001/api/search?q=test" -UseBasicParsing).StatusCode
    "Req $_ : HTTP $status"
}
```

- [x] Requêtes 1 à 30 -> HTTP 200.
- [x] Requête 31 -> HTTP 429.
- [x] Attente 60 secondes -> HTTP 200 à nouveau (fenêtre réinitialisée).

---

## 9. Sécurité

```powershell
# Caractères spéciaux
(Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=<script>alert(1)</script>")

# Quote simple (injection SQL minimale)
curl.exe -s "http://localhost:3001/api/search?q='"
```

- [x] Caractères spéciaux -> HTTP 200, `{"results":[]}` (pas d'erreur 500).
- [x] Quote simple seule -> HTTP 400 (1 caractère, trop court — paramètre jamais atteint le SQL).
- Note : l'injection SQL est impossible par construction — le paramètre `q` est transmis via le template `sql\`...\${q}...\`` de drizzle-orm, qui paramétrise automatiquement toutes les valeurs interpolées.

---

## 10. Performance

```powershell
Measure-Command { Invoke-RestMethod -Uri "http://localhost:3001/api/search?q=incendies" } | Select-Object TotalMilliseconds
```

- [x] Temps de réponse entre 50 et 60 ms (bien en dessous de la cible de 500 ms — SEARCH-01 validé).
