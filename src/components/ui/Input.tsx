import { cn } from '@/lib/cn'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'block w-full rounded border border-[rgba(26,28,30,0.16)] bg-[rgba(255,255,255,0.55)] px-3 py-2 font-serif text-[1rem] text-ink placeholder:text-[#9C9790] transition-shadow focus:outline-none focus:shadow-[0_2px_8px_rgba(184,92,56,0.10)] focus:border-copper',
        className,
      )}
      {...props}
    />
  )
}
