import { describe, it, expect, vi } from 'vitest'
import { resolveVerifyState } from '@/app/(frontend)/verify-email/page'

vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

describe('resolveVerifyState', () => {
  it('returns "invalid" when token is undefined', async () => {
    const result = await resolveVerifyState(undefined)
    expect(result).toBe('invalid')
  })

  it('returns "success" when verifyEmail resolves', async () => {
    const client = { verifyEmail: vi.fn().mockResolvedValueOnce(undefined) }
    const result = await resolveVerifyState('valid-token', client)
    expect(result).toBe('success')
    expect(client.verifyEmail).toHaveBeenCalledWith({ collection: 'customers', token: 'valid-token' })
  })

  it('returns "invalid" when verifyEmail throws', async () => {
    const client = { verifyEmail: vi.fn().mockRejectedValueOnce(new Error('Token expired')) }
    const result = await resolveVerifyState('expired-token', client)
    expect(result).toBe('invalid')
  })
})
