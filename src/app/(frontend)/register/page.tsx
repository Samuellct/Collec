'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthCard } from '@/components/ui/AuthCard'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'
import { TurnstileWidget } from '@/modules/auth/turnstile/TurnstileWidget'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [error, setError] = useState('')
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      })
      if (res.status === 201) {
        router.push(`/verify-email-sent?email=${encodeURIComponent(email)}`)
      } else {
        setError('Inscription impossible. Verifie les informations et reessaie.')
      }
    } catch {
      setError('Une erreur est survenue. Reessaie.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard title="Cree ton compte" subtitle="Rejoins Collec Club et commence ta collec.">
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caracteres minimum"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>
        <TurnstileWidget
          onToken={setTurnstileToken}
          onExpire={() => setTurnstileToken('')}
        />
        <FieldError message={error} />
        <Button type="submit" pending={pending}>
          Creer mon compte
        </Button>
      </form>
      <p className="mt-6 font-sans text-[0.82rem] text-slate">
        Deja inscrit ?{' '}
        <Link href="/login" className="text-copper hover:text-[#9A4C2E] transition-colors">
          Se connecter
        </Link>
      </p>
    </AuthCard>
  )
}
