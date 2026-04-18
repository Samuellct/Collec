'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FieldError } from '@/components/ui/FieldError'

interface ChangePasswordFormProps {
  userId: number
  userEmail: string
}

export function ChangePasswordForm({ userId, userEmail }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.')
      return
    }
    setPending(true)
    setError('')
    setSuccess(false)
    try {
      const loginRes = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, password: currentPassword }),
      })
      if (!loginRes.ok) {
        setError('Mot de passe actuel incorrect.')
        return
      }
      const updateRes = await fetch(`/api/customers/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      })
      if (updateRes.ok) {
        setSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setError('Impossible de mettre a jour le mot de passe.')
      }
    } catch {
      setError('Une erreur est survenue. Reessaie.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="current-password">Mot de passe actuel</Label>
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">Nouveau mot de passe</Label>
        <Input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="8 caracteres minimum"
          minLength={8}
          required
          autoComplete="new-password"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-password">Confirme le nouveau mot de passe</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
          autoComplete="new-password"
        />
      </div>
      <FieldError message={error} />
      {success && (
        <p className="font-sans text-[0.88rem] text-copper">Mot de passe mis a jour.</p>
      )}
      <Button type="submit" pending={pending} className="self-start">
        Changer le mot de passe
      </Button>
    </form>
  )
}
