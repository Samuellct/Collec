import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'secondary'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  pending?: boolean
}

export function Button({ variant = 'primary', pending, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded px-[18px] py-[10px] font-sans text-[0.88rem] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-copper text-white hover:bg-[#9A4C2E]',
    secondary: 'border border-[rgba(26,28,30,0.16)] text-slate hover:border-copper hover:text-copper bg-transparent',
  }
  return (
    <button
      className={cn(base, variants[variant], className)}
      disabled={disabled ?? pending}
      {...props}
    >
      {pending ? 'Chargement...' : children}
    </button>
  )
}
