# Tests manuels - Etape 09 : Gestion des utilisateurs (admin)

Prerequis : `docker compose up postgres -d` + `pnpm payload migrate` + `pnpm dev` en cours.

---

## 0. Migrations

Verifier que les migrations sont bien appliquees avant tout test :

```bash
pnpm payload migrate
```

Attendu : les deux nouvelles migrations apparaissent comme appliquees :
- `20260426_100000_add_disabled_to_customers`
- `20260426_100100_add_pseudo_to_customers`

---

## 1. Inscription avec pseudo (champ obligatoire)

### 1.1 Inscription valide

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"securepass","pseudo":"alice42","turnstileToken":"1x00000000000000000000BB"}'
```

Attendu : HTTP 201. Verifier dans le panneau admin (`/admin` > Utilisateurs > Customers) que :
- Le compte `alice@example.com` est cree avec le pseudo `alice42`.
- `_verified` est `false` (non verifie).
- `disabled` est decoché.

### 1.2 Pseudo deja utilise

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"securepass","pseudo":"alice42","turnstileToken":"1x00000000000000000000BB"}'
```

Attendu : HTTP 409.

### 1.3 Pseudo trop court (< 3 chars)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"securepass","pseudo":"ab","turnstileToken":"1x00000000000000000000BB"}'
```

Attendu : HTTP 400.

### 1.4 Pseudo absent

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com","password":"securepass","turnstileToken":"1x00000000000000000000BB"}'
```

Attendu : HTTP 400.

### 1.5 Formulaire `/register` dans le navigateur

- Ouvrir `/register`.
- Verifier que le champ "Pseudo" est present entre l'email et le mot de passe.
- Soumettre avec un pseudo valide -> redirect vers `/verify-email-sent`.
- Recommencer avec un pseudo deja pris -> message d'erreur "Ce pseudo est deja utilise."

---

## 2. Vue liste admin des customers

- Connecte en admin : ouvrir `/admin` > Utilisateurs > Customers.
- Verifier que les colonnes affichees sont : Email, Pseudo, Verifie, Desactive, Date de creation.
- Verifier que le tri par defaut est par date de creation decroissante.
- Utiliser la barre de recherche avec une adresse email partielle -> les resultats se filtrent.
- Utiliser la barre de recherche avec un pseudo -> les resultats se filtrent.

---

## 3. Desactivation d'un compte

### 3.1 Desactiver depuis l'admin

- Dans `/admin` > Customers, ouvrir le compte `alice@example.com`.
- Cocher la case "Desactiver ce compte" dans la sidebar.
- Sauvegarder.

### 3.2 Tenter de se connecter avec le compte desactive

```bash
curl -X POST http://localhost:3001/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"securepass"}'
```

Attendu : HTTP 401, message "Ce compte est desactive."

### 3.3 Reactiver le compte

- Dans l'admin, decocher "Desactiver ce compte" et sauvegarder.
- Retenter la connexion -> HTTP 200 (ou 401 si email non verifie, selon l'etat de `_verified`).

---

## 4. Renvoi de l'email de verification depuis l'admin

### 4.1 Customer non verifie

- S'assurer que le compte `alice@example.com` a `_verified = false` (compte cree sans avoir clique le lien).
- Ouvrir ce compte dans l'admin.
- Verifier que le bouton "Renvoyer la verification" est visible en haut de la page (zone `beforeDocumentControls`).
- Cliquer le bouton.
- Attendu : message de confirmation "Email envoye." s'affiche. Verifier dans le dashboard Resend qu'un email a bien ete expedie.

### 4.2 Customer deja verifie

- Verifier un compte via son lien de verification (ou manuellement passer `_verified = true` dans l'admin).
- Ouvrir le compte dans l'admin.
- Attendu : le bouton "Renvoyer la verification" n'est plus visible (le composant se masque si `_verified === true`).

### 4.3 Via curl (verifie auth admin)

```bash
# Recuperer le token admin en se connectant d'abord :
# Utiliser le cookie payload-token obtenu apres connexion a /admin

curl -X POST http://localhost:3001/api/admin/customers/1/resend-verification \
  -H "Cookie: payload-token=<token_admin>"
```

Attendu : HTTP 200 si customer non verifie. HTTP 400 si deja verifie.

Tenter le meme appel avec un token customer (pas admin) :
Attendu : HTTP 401.

---

## 5. Modification du pseudo depuis les parametres

### 5.1 Changer le pseudo (happy path)

- Se connecter en tant que customer (`alice@example.com`).
- Ouvrir `/settings`.
- Verifier que la section "Changer le pseudo" est presente avec le pseudo actuel affiche.
- Saisir un nouveau pseudo disponible (ex : `alice2025`) et soumettre.
- Attendu : message "Pseudo mis a jour." s'affiche.
- Verifier dans l'admin que le champ pseudo a bien ete mis a jour.

### 5.2 Pseudo deja utilise

- Creer un second compte (ex : `bob@example.com` avec pseudo `bob99`).
- Se connecter en tant que `alice@example.com`.
- Tenter de changer le pseudo vers `bob99`.
- Attendu : message "Ce pseudo est deja utilise."

### 5.3 Pseudo identique a l'actuel

- Soumettre le formulaire avec le meme pseudo qu'actuellement.
- Attendu : message "Ce pseudo est identique au pseudo actuel." (validation front).

---

## 6. Verification payload-types.ts

S'assurer que le type `Customer` dans `src/payload-types.ts` contient bien :
- `pseudo: string`
- `disabled?: boolean | null`

Ces champs doivent etre utilises sans erreur TypeScript dans `settings/page.tsx` (`user.pseudo`).
