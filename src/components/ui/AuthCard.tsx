interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-[420px]">
        <h1 className="font-display text-[2.2rem] font-bold leading-[1.05] tracking-[-0.04em] text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 font-serif italic text-[1rem] text-slate">{subtitle}</p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  )
}
