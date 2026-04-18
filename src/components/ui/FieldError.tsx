interface FieldErrorProps {
  message?: string
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null
  return <p className="font-sans text-[0.82rem] text-bordeaux">{message}</p>
}
