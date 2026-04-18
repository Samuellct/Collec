'use client'

import { Turnstile } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onToken: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

export function TurnstileWidget({ onToken, onError, onExpire }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={onToken}
      onError={onError}
      onExpire={onExpire}
      options={{ theme: 'light', size: 'normal' }}
    />
  )
}
