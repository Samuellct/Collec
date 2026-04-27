import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import config from '@payload-config'
import { generateVerificationEmailHTML, generateVerificationEmailSubject } from '@/modules/auth/email/verification-email'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the requester is an admin
  const meRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/admins/me`, {
    headers: { Authorization: `JWT ${token}` },
    cache: 'no-store',
  })
  if (!meRes.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: customerId } = await params
  const numericId = parseInt(customerId, 10)
  if (isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  // Load customer with hidden fields to access _verificationToken
  const customer = await payload.findByID({
    collection: 'customers',
    id: numericId,
    overrideAccess: true,
    showHiddenFields: true,
  })

  if (!customer) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (customer._verified) {
    return NextResponse.json({ error: 'Already verified' }, { status: 400 })
  }

  const verificationToken = customer._verificationToken
  if (!verificationToken) {
    return NextResponse.json({ error: 'No verification token' }, { status: 400 })
  }

  await payload.sendEmail({
    to: customer.email,
    subject: generateVerificationEmailSubject(),
    html: generateVerificationEmailHTML({ token: verificationToken }),
  })

  return NextResponse.json({ message: 'Email envoyé.' }, { status: 200 })
}
