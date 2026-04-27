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
    typeof (body as Record<string, unknown>).password !== 'string' ||
    typeof (body as Record<string, unknown>).pseudo !== 'string' ||
    typeof (body as Record<string, unknown>).turnstileToken !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email, password, pseudo, turnstileToken } = body as {
    email: string
    password: string
    pseudo: string
    turnstileToken: string
  }

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const trimmedPseudo = pseudo.trim()
  if (trimmedPseudo.length < 3 || trimmedPseudo.length > 30) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const remoteIp = req.headers.get('x-forwarded-for') ?? undefined
  const valid = await verifyTurnstileToken(turnstileToken, remoteIp)
  if (!valid) {
    return NextResponse.json({ error: 'Verification echouee' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  // Vérification unicité du pseudo (contrairement à l'email, on révèle le conflit)
  const existingPseudo = await payload.find({
    collection: 'customers',
    where: { pseudo: { equals: trimmedPseudo } },
    limit: 1,
    overrideAccess: true,
  })
  if (existingPseudo.docs.length > 0) {
    return NextResponse.json({ error: 'Ce pseudo est déjà utilisé.' }, { status: 409 })
  }

  try {
    await payload.create({
      collection: 'customers',
      data: { email, password, pseudo: trimmedPseudo },
    })
  } catch {
    // Reponse neutre : ne pas reveler si l'email existe deja (anti-enumeration)
  }

  return NextResponse.json(
    { message: 'Si cet email est valide, un message de verification a ete envoye.' },
    { status: 201 },
  )
}
