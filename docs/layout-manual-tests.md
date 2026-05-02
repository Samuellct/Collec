# Tests manuels - Étape 11 : Layout principal et navigation

Prérequis : `docker compose up -d` + `pnpm dev` démarrés.

---

## 1. Structure du layout

Ouvrir `http://localhost:3001` dans le navigateur.

- [ ] Un header est visible en haut de page avec une bordure inférieure.
- [ ] Un footer est visible en bas de page avec une bordure supérieure.
- [ ] Le contenu principal est centré avec un max-width visible (1080px). Sur écran large, les marges latérales apparaissent clairement.
- [ ] Sur une page courte (ex. page d'accueil), le footer est collé en bas de fenêtre (pas de blanc en dessous).

---

## 2. Header - contenu et style

- [ ] Le logo "Collec Club" est affiché à gauche en Fraunces.
- [ ] Le logo est un lien cliquable vers `/`.
- [ ] Le lien "Découvrir" est affiché au centre.
- [ ] Le lien "Découvrir" pointe vers `/explorer` (URL vérifiable au survol).
- [ ] La bordure inférieure du header est présente (`1px solid rgba(26,28,30,0.10)`).

---

## 3. Header mobile - lien "Découvrir" masqué

Réduire la fenêtre du navigateur sous 640px de largeur (DevTools → mode responsive).

- [ ] Le lien "Découvrir" disparaît.
- [ ] Le logo et la zone utilisateur restent visibles.

---

## 4. Footer - contenu et style

- [ ] "Collec Club" est affiché en Fraunces dans le footer.
- [ ] La tagline "La culture à compléter." est affichée sous le nom.
- [ ] Le texte d'attribution TMDB est présent : "This product uses the TMDB API but is not endorsed or certified by TMDB."
- [ ] La mention JustWatch est présente : "Données de streaming fournies par JustWatch."
- [ ] Le lien "Mentions légales" est présent et pointe vers `/mentions-legales`.
- [ ] Le lien "Politique de confidentialité" est présent et pointe vers `/politique-confidentialite`.

---

## 5. État déconnecté - zone utilisateur

Se déconnecter si connecté, puis vérifier sur `http://localhost:3001`.

- [ ] Le lien "Se connecter" est visible à droite du header.
- [ ] Le lien "S'inscrire" est visible à droite du header.
- [ ] "Se connecter" pointe vers `/login`.
- [ ] "S'inscrire" pointe vers `/register`.

---

## 6. État connecté - zone utilisateur

Se connecter avec un compte existant (`/login`), puis vérifier.

- [ ] Le pseudo du compte est affiché (pas l'email).
- [ ] Le pseudo est un lien vers `/profil`.
- [ ] Le bouton de déconnexion est visible.
- [ ] Cliquer sur "Se déconnecter" déconnecte et redirige (comportement identique à avant cette étape).

---

## 7. Présence du header sur les pages auth

Naviguer manuellement vers les pages suivantes et vérifier que le header est présent sur chacune.

```powershell
# Ouvrir les URLs dans le navigateur
Start-Process "http://localhost:3001/login"
Start-Process "http://localhost:3001/register"
Start-Process "http://localhost:3001/forgot-password"
Start-Process "http://localhost:3001/settings"
```

- [ ] `/login` : header visible.
- [ ] `/register` : header visible.
- [ ] `/forgot-password` : header visible.
- [ ] `/settings` : header visible (ou redirection `/login` si déconnecté - comportement attendu).

---

## 8. Variables CSS sémantiques

Ouvrir les DevTools du navigateur (F12) → onglet "Éléments" → inspecter `<html>` ou `<body>`.

Dans la section "Styles calculés", vérifier que les variables suivantes sont définies sur `:root` :

- [ ] `--line` : `rgba(26, 28, 30, 0.10)`
- [ ] `--line-strong` : `rgba(26, 28, 30, 0.16)`
- [ ] `--accent` : `#B85C38`
- [ ] `--accent-h` : `#9A4C2E`
- [ ] `--surface` : `rgba(255, 255, 255, 0.55)`
- [ ] `--muted` : `#6B665F`

---

## 9. Vérifications techniques

```powershell
# Depuis 03_Developpement/
pnpm type-check
pnpm lint
pnpm test
```

- [ ] `pnpm type-check` : 0 erreur TypeScript.
- [ ] `pnpm lint` : 0 avertissement ESLint.
- [ ] `pnpm test` : 82 tests passent, 0 échec.
