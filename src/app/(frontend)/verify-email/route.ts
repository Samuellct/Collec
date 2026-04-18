import { getPayload } from 'payload'
import { NextRequest, NextResponse } from 'next/server'
import config from '@payload-config'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login?verified=error', req.nextUrl.origin))
  }

  try {
    const payload = await getPayload({ config })
    await payload.verifyEmail({ collection: 'customers', token })
    return NextResponse.redirect(new URL('/admin/login?verified=success', req.nextUrl.origin))
  } catch {
    return NextResponse.redirect(new URL('/admin/login?verified=error', req.nextUrl.origin))
  }
}
