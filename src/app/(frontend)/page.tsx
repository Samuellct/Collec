import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg text-ink">
      <div className="text-center">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-ink">
          Collec Club
        </h1>
        <p className="mt-4 font-serif text-xl text-slate">La culture a completer.</p>
        <p className="mt-8 font-sans text-sm text-slate">
          <Link href="/admin" className="underline hover:text-copper transition-colors">
            Acces admin Payload
          </Link>
        </p>
      </div>
    </main>
  )
}
