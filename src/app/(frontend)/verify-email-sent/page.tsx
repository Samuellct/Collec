import Link from 'next/link'
import { AuthCard } from '@/components/ui/AuthCard'
import { Button } from '@/components/ui/Button'

interface PageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailSentPage({ searchParams }: PageProps) {
  const { email } = await searchParams

  return (
    <AuthCard title="Vérifie ta boîte mail">
      <div
        className="border-l-[3px] border-copper bg-[rgba(255,255,255,0.55)] px-5 py-5 rounded-r"
        style={{ borderRadius: '0 4px 4px 0' }}
      >
        <p className="font-serif text-[1rem] leading-[1.65] text-ink">
          Un email de vérification a été envoyé
          {email ? (
            <>
              {' '}à{' '}
              <span className="font-semibold">{email}</span>
            </>
          ) : null}
          . Le lien est valide 24 heures.
        </p>
        <p className="mt-3 font-serif text-[0.95rem] leading-[1.65] text-slate">
          Clique sur le lien dans l&apos;email pour activer ton compte.
        </p>
      </div>
      <div className="mt-8">
        <Link href="/">
          <Button variant="secondary">Retour à l&apos;accueil</Button>
        </Link>
      </div>
    </AuthCard>
  )
}
