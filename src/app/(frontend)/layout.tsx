import type { Metadata } from 'next'
import { kalam, fraunces, sourceSerif4, sourceSans3 } from '@/lib/fonts'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Collec Club',
  description: 'Construis ta culture, film apres film.',
  icons: { icon: '/favicon.svg' },
}

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${kalam.variable} ${fraunces.variable} ${sourceSerif4.variable} ${sourceSans3.variable}`}
    >
      <body className="min-h-screen font-sans bg-bg text-ink flex flex-col">
        <Header />
        <main className="mx-auto w-full max-w-[1080px] flex-1 px-6 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
