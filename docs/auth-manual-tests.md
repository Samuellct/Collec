# Tests manuels - Etape 03 : Auth collections

Prerequis : `docker compose up postgres -d` + `pnpm dev` en cours.

## 1. Premier compte admin

- Ouvrir `/admin`.
- Remplir le formulaire de creation du premier utilisateur admin.
- Verifier que la connexion fonctionne et que le panneau admin charge.

## 2. Isolation admin / customers

- Connecte en admin : naviguer dans le panneau, verifier qu'aucun customer n'est visible (collection cachee tant qu'aucun customer n'existe).
- Verifier que `admin.user` est bien `admins` : tenter de se connecter sur `/admin` avec une adresse non encore enregistree en admin -> echec attendu.

## 3. Inscription via l'API (avec token Turnstile de test)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123","turnstileToken":"1x00000000000000000000BB"}'
```

Attendu : HTTP 201, message neutre.
Verifier dans le dashboard Resend que l'email de verification est envoye a l'adresse indiquee.

## 4. Inscription sans token Turnstile

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123","turnstileToken":""}'
```

Attendu : HTTP 400.

## 5. Verification email

- Ouvrir le lien de verification recu par email.
- Verifier dans le panneau admin Payload que `_verified` est `true` sur le document customer.
- Cliquer une seconde fois sur le meme lien : Payload renvoie une erreur (token usage unique).

## 6. Connexion native Payload

```bash
curl -X POST http://localhost:3001/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}' \
  -c cookies.txt -v
```

Attendu : cookie `payload-token` HTTP-only present dans la reponse.

## 7. Verrouillage apres 5 tentatives echouees

```bash
for i in {1..6}; do
  curl -s -X POST http://localhost:3001/api/customers/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}' | grep -o '"message":"[^"]*"'
done
```

Attendu : les 5 premieres reponses indiquent echec, la 6eme indique le verrouillage du compte (10 min).

## 8. Reset password

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","turnstileToken":"1x00000000000000000000BB"}'
```

Attendu : HTTP 200, email de reset recu dans Resend dashboard.
Ouvrir le lien de reset, saisir un nouveau mot de passe.
Tenter de se connecter avec l'ancien mot de passe : echec attendu.
Se connecter avec le nouveau : succes attendu.

## 9. Deconnexion

Note : Payload 3 bloque les mutations POST cookie-based hors navigateur (CSRF).
Utiliser le Bearer token renvoyé par le login.

```powershell
$token = "<token_du_login>"
curl.exe -X POST http://localhost:3001/api/customers/logout `
  -H "Authorization: Bearer $token" -v
```

Attendu : HTTP 200, `{"message":"Logout successful."}`,
`set-cookie: payload-token=; Expires=<date passée>` (cookie effacé).
En contexte navigateur (etape 04), le logout same-origin fonctionne avec le cookie.
