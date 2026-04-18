import { cn } from '@/lib/cn'

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'block font-sans text-[0.74rem] font-bold uppercase tracking-[0.09em] text-copper',
        className,
      )}
      {...props}
    />
  )
}
