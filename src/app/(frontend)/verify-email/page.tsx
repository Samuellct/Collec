import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { AuthCard } from '@/components/ui/AuthCard'
import { Button } from '@/components/ui/Button'

type VerifyState = 'success' | 'invalid'

interface PayloadClient {
  verifyEmail: (args: { collection: string; token: string }) => Promise<unknown>
}

export async function resolveVerifyState(
  token: string | undefined,
  payloadClient?: PayloadClient,
): Promise<VerifyState> {
  if (!token) return 'invalid'
  try {
    const client = payloadClient ?? (await getPayload({ config }))
    await client.verifyEmail({ collection: 'customers', token })
    return 'success'
  } catch {
    return 'invalid'
  }
}

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const { token } = await searchParams
  const state = await resolveVerifyState(token)

  if (state === 'success') {
    return (
      <AuthCard title="Compte active">
        <div
          className="border-l-[3px] border-copper bg-[rgba(255,255,255,0.55)] px-5 py-5"
          style={{ borderRadius: '0 4px 4px 0' }}
        >
          <p className="font-serif text-[1rem] leading-[1.65] text-ink">
            Ton adresse email a ete verifiee. Tu peux maintenant te connecter.
          </p>
        </div>
        <div className="mt-8">
          <Link href="/login">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Lien expire ou invalide">
      <p className="font-serif text-[1rem] leading-[1.65] text-slate">
        Ce lien de verification est invalide ou a expire. Inscris-toi a nouveau pour recevoir un nouvel email.
      </p>
      <div className="mt-8">
        <Link href="/register">
          <Button variant="secondary">Recommencer l&apos;inscription</Button>
        </Link>
      </div>
    </AuthCard>
  )
}
