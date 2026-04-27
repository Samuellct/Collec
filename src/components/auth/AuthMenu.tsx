import Link from 'next/link'
import type { Customer } from '@/payload-types'
import { LogoutButton } from './LogoutButton'

interface AuthMenuProps {
  user: Customer | null
}

export function AuthMenu({ user }: AuthMenuProps) {
  if (!user) {
    return (
      <nav className="flex items-center gap-4">
        <Link href="/login" className="font-sans text-[0.88rem] text-slate hover:text-copper transition-colors">
          Se connecter
        </Link>
        <Link href="/register" className="font-sans text-[0.88rem] text-copper hover:text-[#9A4C2E] transition-colors">
          S&apos;inscrire
        </Link>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-4">
      <Link href="/profil" className="font-sans text-[0.82rem] text-slate hover:text-copper transition-colors truncate max-w-[180px]">
        {user.pseudo}
      </Link>
      <LogoutButton />
    </nav>
  )
}
