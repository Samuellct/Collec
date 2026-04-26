'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'

interface ChangePseudoFormProps {
  userId: number
  currentPseudo: string
}

export function ChangePseudoForm({ userId, currentPseudo }: ChangePseudoFormProps) {
  const [pseudo, setPseudo] = useState(currentPseudo)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = pseudo.trim()
    if (trimmed === currentPseudo) {
      setError('Ce pseudo est identique au pseudo actuel.')
      return
    }
    setPending(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch(`/api/customers/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pseudo: trimmed }),
      })
      if (res.ok) {
        setSuccess(true)
      } else if (res.status === 409 || res.status === 400) {
        const data = (await res.json()) as { errors?: { message?: string }[] }
        const msg = data.errors?.[0]?.message ?? ''
        if (msg.toLowerCase().includes('unique') || msg.toLowerCase().includes('pseudo')) {
          setError('Ce pseudo est déjà utilisé.')
        } else {
          setError('Impossible de mettre à jour le pseudo.')
        }
      } else {
        setError('Impossible de mettre à jour le pseudo.')
      }
    } catch {
      setError('Une erreur est survenue. Réessaie.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pseudo">Nouveau pseudo</Label>
        <Input
          id="pseudo"
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          placeholder="3 à 30 caractères"
          minLength={3}
          maxLength={30}
          required
          autoComplete="username"
        />
      </div>
      <FieldError message={error} />
      {success && (
        <p className="font-sans text-[0.88rem] text-copper">Pseudo mis à jour.</p>
      )}
      <Button type="submit" pending={pending} className="self-start">
        Changer le pseudo
      </Button>
    </form>
  )
}
