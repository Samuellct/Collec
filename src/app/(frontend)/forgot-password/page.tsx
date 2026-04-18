'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthCard } from '@/components/ui/AuthCard'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'
import { TurnstileWidget } from '@/modules/auth/turnstile/TurnstileWidget'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!turnstileToken) {
      setError('Valide le captcha avant de continuer.')
      return
    }
    setPending(true)
    setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      })
      setSent(true)
    } catch {
      setError('Une erreur est survenue. Reessaie.')
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <AuthCard title="Email envoye">
        <div
          className="border-l-[3px] border-copper bg-[rgba(255,255,255,0.55)] px-5 py-5"
          style={{ borderRadius: '0 4px 4px 0' }}
        >
          <p className="font-serif text-[1rem] leading-[1.65] text-ink">
            Si un compte existe pour cette adresse, un email de reinitialisation vient d&apos;etre envoye. Le lien est valide 1 heure.
          </p>
        </div>
        <div className="mt-8">
          <Link href="/login">
            <Button variant="secondary">Retour a la connexion</Button>
          </Link>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Mot de passe oublie" subtitle="On t'envoie un lien de reinitialisation.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@exemple.fr"
            required
            autoComplete="email"
          />
        </div>
        <TurnstileWidget
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken('')}
        />
        <FieldError message={error} />
        <Button type="submit" pending={pending}>
          Envoyer le lien
        </Button>
      </form>
      <p className="mt-6 font-sans text-[0.82rem] text-slate">
        <Link href="/login" className="text-copper hover:text-[#9A4C2E] transition-colors">
          Retour a la connexion
        </Link>
      </p>
    </AuthCard>
  )
}
