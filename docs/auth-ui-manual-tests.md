# Tests manuels - Etape 04 : Pages d'authentification (frontend)

Prerequis : `docker compose up postgres -d` + `pnpm dev` en cours.

## 1. Inscription + confirmation email

- Naviguer vers `/register`.
- Remplir email + mot de passe (8 car. min) + valider le captcha Turnstile.
- Cliquer "Creer mon compte".
- Attendu : redirection vers `/verify-email-sent?email=<email>`, bloc editorial visible avec l'email indique.

## 2. Verification email (succes)

- Ouvrir l'email de verification recu dans Resend dashboard.
- Cliquer sur le lien (vers `/verify-email?token=...`).
- Attendu : page "Compte active", bouton "Se connecter" visible.

## 3. Verification email (lien expire / second clic)

- Cliquer une seconde fois sur le meme lien.
- Attendu : page "Lien expire ou invalide", bouton "Recommencer l'inscription".

## 4. Connexion avec 5 mauvais mots de passe

```bash
for i in {1..6}; do
  curl -s -X POST http://localhost:3001/api/customers/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}' | grep -o '"message":"[^"]*"'
done
```

- Attendu depuis `/login` : message "Identifiants invalides ou compte verrouille. Reessaie dans quelques minutes." apres le 5e echec.

## 5. Connexion OK + header auth

- Naviguer vers `/login`, saisir les bonnes identifiants.
- Attendu : redirection vers `/`, header affiche l'email du compte et le bouton "Deconnexion".

## 6. Deconnexion

- Cliquer "Deconnexion" dans le header.
- Attendu : retour a `/`, header redevient anonyme (liens "Se connecter" + "S'inscrire").

## 7. Mot de passe oublie

- Naviguer vers `/forgot-password`.
- Saisir l'email + captcha Turnstile, cliquer "Envoyer le lien".
- Attendu : etat "Email envoye" affiche, email de reset visible dans Resend dashboard.

## 8. Reset password + banniere login

- Cliquer sur le lien de reset recu (vers `/reset-password?token=...`).
- Saisir un nouveau mot de passe + confirmation identique.
- Attendu : redirection vers `/login?reset=success` avec banniere cuivre "Mot de passe mis a jour."
- Se connecter avec le nouveau mot de passe : succes.
- Tenter l'ancien mot de passe : echec attendu.

## 9. Protection /settings sans cookie

- En mode non connecte, naviguer vers `/settings`.
- Attendu : redirection vers `/login?next=/settings`.
- Apres connexion : redirection vers `/settings`.

## 10. Changement de mot de passe via /settings

- Connecte, naviguer vers `/settings`.
- Saisir un mauvais mot de passe actuel : attendu erreur "Mot de passe actuel incorrect."
- Saisir le bon mot de passe actuel + nouveau mot de passe + confirmation differente : attendu erreur "ne correspondent pas."
- Saisir le bon mot de passe actuel + nouveau + confirmation identique : attendu "Mot de passe mis a jour."
- Se deconnecter et se reconnecter avec le nouveau mot de passe : succes.

## 11. Responsive 375px

- Redimensionner le navigateur a 375px ou utiliser les DevTools.
- Verifier que tous les formulaires (/register, /login, /forgot-password, /reset-password, /settings) restent lisibles et utilisables.
- Aucun debordement horizontal attendu.

## 12. Accessibilite /login

- Ouvrir /login dans Chrome.
- DevTools > Lighthouse > Accessibility > Generate report.
- Attendu : score >= 95.
