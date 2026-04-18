import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'
import { verifyTurnstileToken } from '@/modules/auth/turnstile/verify-token'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).email !== 'string' ||
    typeof (body as Record<string, unknown>).turnstileToken !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email, turnstileToken } = body as { email: string; turnstileToken: string }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const remoteIp = req.headers.get('x-forwarded-for') ?? undefined
  const valid = await verifyTurnstileToken(turnstileToken, remoteIp)
  if (!valid) {
    return NextResponse.json({ error: 'Verification echouee' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  try {
    await payload.forgotPassword({ collection: 'customers', data: { email }, disableEmail: false })
  } catch {
    // Reponse neutre : ne pas reveler si l'email existe (anti-enumeration)
  }

  return NextResponse.json(
    { message: 'Si cet email correspond a un compte, un lien a ete envoye.' },
    { status: 200 },
  )
}
