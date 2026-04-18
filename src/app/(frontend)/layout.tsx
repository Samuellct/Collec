import type { Metadata } from 'next'
import Link from 'next/link'
import { fraunces, sourceSerif4, sourceSans3 } from '@/lib/fonts'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { AuthMenu } from '@/components/auth/AuthMenu'
import './globals.css'

export const metadata: Metadata = {
  title: 'Collec Club',
  description: 'Construis ta culture, film apres film.',
}

export default async function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${sourceSerif4.variable} ${sourceSans3.variable}`}
    >
      <body className="min-h-screen font-sans bg-bg text-ink">
        <header className="border-b border-[rgba(26,28,30,0.10)] px-6 py-4">
          <div className="mx-auto flex max-w-[1080px] items-center justify-between">
            <Link href="/" className="font-display text-[1.1rem] font-semibold tracking-[-0.025em] text-ink hover:text-copper transition-colors">
              Collec Club
            </Link>
            <AuthMenu user={user} />
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
