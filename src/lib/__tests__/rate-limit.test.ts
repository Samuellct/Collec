import { describe, it, expect, beforeEach, vi } from 'vitest'

// Import after vi.resetModules so each test gets a fresh store
let checkRateLimit: typeof import('../rate-limit.ts').checkRateLimit

describe('checkRateLimit', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-27T12:00:00Z'))
    vi.resetModules()
    const mod = await import('../rate-limit.ts')
    checkRateLimit = mod.checkRateLimit
  })

  it('allows first request', () => {
    const { allowed, remaining } = checkRateLimit('1.2.3.4')
    expect(allowed).toBe(true)
    expect(remaining).toBe(29)
  })

  it('allows up to 30 requests within the window', () => {
    for (let i = 0; i < 30; i++) {
      const { allowed } = checkRateLimit('1.2.3.4')
      expect(allowed).toBe(true)
    }
  })

  it('blocks the 31st request within the window', () => {
    for (let i = 0; i < 30; i++) checkRateLimit('1.2.3.4')
    const { allowed, remaining } = checkRateLimit('1.2.3.4')
    expect(allowed).toBe(false)
    expect(remaining).toBe(0)
  })

  it('resets counter after window expires', () => {
    for (let i = 0; i < 30; i++) checkRateLimit('1.2.3.4')
    expect(checkRateLimit('1.2.3.4').allowed).toBe(false)

    vi.advanceTimersByTime(61_000)

    const { allowed } = checkRateLimit('1.2.3.4')
    expect(allowed).toBe(true)
  })

  it('tracks different IPs independently', () => {
    for (let i = 0; i < 30; i++) checkRateLimit('1.1.1.1')
    expect(checkRateLimit('1.1.1.1').allowed).toBe(false)
    expect(checkRateLimit('2.2.2.2').allowed).toBe(true)
  })
})
