import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { ChangePasswordForm } from './ChangePasswordForm'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?next=/settings')
  }

  return (
    <main className="mx-auto max-w-[1080px] px-6 py-16">
      <h1 className="font-display text-[2.2rem] font-bold leading-[1.05] tracking-[-0.04em] text-ink">
        Paramètres
      </h1>
      <div className="mt-12 max-w-[420px]">
        <section>
          <h2 className="font-display text-[1.1rem] font-semibold tracking-[-0.025em] text-ink">
            Compte
          </h2>
          <div className="mt-4 flex flex-col gap-1.5">
            <p className="font-sans text-[0.74rem] font-bold uppercase tracking-[0.09em] text-copper">
              Adresse email
            </p>
            <p className="font-serif text-[1rem] text-slate">{user.email}</p>
          </div>
        </section>
        <section className="mt-10">
          <h2 className="font-display text-[1.1rem] font-semibold tracking-[-0.025em] text-ink">
            Changer le mot de passe
          </h2>
          <div className="mt-6">
            <ChangePasswordForm userId={user.id} userEmail={user.email} />
          </div>
        </section>
      </div>
    </main>
  )
}
