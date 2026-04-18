import { cookies } from 'next/headers'
import type { Customer } from '@/payload-types'

interface MeResponse {
  user: Customer
}

export async function getCurrentUser(): Promise<Customer | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  if (!token) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/customers/me`, {
      headers: { Authorization: `JWT ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as MeResponse
    return data.user ?? null
  } catch {
    return null
  }
}
