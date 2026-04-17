import type { Metadata } from 'next'
import { fraunces, sourceSerif4, sourceSans3 } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: 'Collec Club',
  description: 'Construis ta culture, film apres film.',
}

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${sourceSerif4.variable} ${sourceSans3.variable}`}
    >
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  )
}
