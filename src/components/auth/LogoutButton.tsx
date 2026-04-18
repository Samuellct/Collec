'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
    router.push('/')
    router.refresh()
  }

  return (
    <Button variant="secondary" onClick={handleLogout}>
      Déconnexion
    </Button>
  )
}
