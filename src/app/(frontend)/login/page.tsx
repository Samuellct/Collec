'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard } from '@/components/ui/AuthCard'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'

function sanitizeNext(next: string | null): string {
  if (!next) return '/'
  if (!next.startsWith('/') || next.startsWith('//') || next.includes(':')) return '/'
  return next
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = sanitizeNext(searchParams.get('next'))
  const resetSuccess = searchParams.get('reset') === 'success'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      const res = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      if (res.ok) {
        router.push(next)
        router.refresh()
      } else {
        setError('Identifiants invalides ou compte verrouillé. Réessaie dans quelques minutes.')
      }
    } catch {
      setError('Une erreur est survenue. Réessaie.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard title="Connexion">
      {resetSuccess && (
        <div className="mb-6 rounded bg-[rgba(184,92,56,0.10)] px-4 py-3">
          <p className="font-sans text-[0.88rem] text-copper">
            Mot de passe mis à jour. Tu peux te connecter.
          </p>
        </div>
      )}
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link href="/forgot-password" className="font-sans text-[0.78rem] text-slate hover:text-copper transition-colors">
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <FieldError message={error} />
        <Button type="submit" pending={pending}>
          Se connecter
        </Button>
      </form>
      <p className="mt-6 font-sans text-[0.82rem] text-slate">
        Pas de compte ?{' '}
        <Link href="/register" className="text-copper hover:text-[#9A4C2E] transition-colors">
          S&apos;inscrire
        </Link>
      </p>
    </AuthCard>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
