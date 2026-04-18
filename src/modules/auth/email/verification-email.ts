const palette = {
  bg: '#F4EFE6',
  dark: '#121417',
  copper: '#B85C38',
  text: '#2A2D32',
}

export function generateVerificationEmailHTML({ token }: { token: string }): string {
  const url = `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/verify-email?token=${token}`

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Verifie ton compte Collec Club</title>
  </head>
  <body style="margin:0;padding:0;background-color:${palette.bg};font-family:Georgia,serif;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${palette.bg};">
      <tr>
        <td align="center" style="padding:48px 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;background-color:#ffffff;border-radius:4px;padding:40px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${palette.copper};font-family:Arial,sans-serif;">Collec Club</p>
                <h1 style="margin:0 0 24px;font-size:24px;color:${palette.dark};font-weight:700;line-height:1.3;">Bienvenue, ton compte est presque pret.</h1>
                <p style="margin:0 0 16px;font-size:16px;color:${palette.text};line-height:1.6;">
                  Un clic suffit pour activer ton compte et commencer a construire ta culture.
                </p>
                <p style="margin:0 0 32px;font-size:14px;color:#5E6772;line-height:1.5;">
                  Ce lien est valable 24 heures et ne peut etre utilise qu'une seule fois.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius:3px;background-color:${palette.copper};">
                      <a href="${url}" style="display:inline-block;padding:14px 28px;font-family:Arial,sans-serif;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">Activer mon compte</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:32px 0 0;font-size:12px;color:#9AA0A8;line-height:1.5;">
                  Si le bouton ne fonctionne pas, copie ce lien dans ton navigateur :<br />
                  <a href="${url}" style="color:${palette.copper};word-break:break-all;">${url}</a>
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:#9AA0A8;font-family:Arial,sans-serif;">
            Tu n'as pas cree de compte sur Collec Club ? Ignore cet email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function generateVerificationEmailSubject(): string {
  return 'Verifie ton compte Collec Club'
}
