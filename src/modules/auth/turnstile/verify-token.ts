const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface TurnstileResponse {
  success: boolean
  'error-codes'?: string[]
}

export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('[turnstile] TURNSTILE_SECRET_KEY is not set')
    return false
  }

  const params = new URLSearchParams({ secret, response: token })
  if (remoteIp) params.append('remoteip', remoteIp)

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const data = (await res.json()) as TurnstileResponse

    if (!data.success) {
      console.warn('[turnstile] verification failed', data['error-codes'])
    }

    return data.success
  } catch (err) {
    console.error('[turnstile] siteverify request failed', err)
    return false
  }
}
