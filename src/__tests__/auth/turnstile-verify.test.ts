import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyTurnstileToken } from '@/modules/auth/turnstile/verify-token'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

beforeEach(() => {
  vi.resetAllMocks()
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
})

describe('verifyTurnstileToken', () => {
  it('returns true when Cloudflare responds success', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    })
    const result = await verifyTurnstileToken('valid-token')
    expect(result).toBe(true)
  })

  it('returns false when Cloudflare responds failure', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    })
    const result = await verifyTurnstileToken('invalid-token')
    expect(result).toBe(false)
  })

  it('returns false when secret key is missing', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    const result = await verifyTurnstileToken('any-token')
    expect(result).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns false when fetch throws', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'))
    const result = await verifyTurnstileToken('any-token')
    expect(result).toBe(false)
  })

  it('includes remoteIp in the request body when provided', async () => {
    fetchMock.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    })
    await verifyTurnstileToken('token', '1.2.3.4')
    const body = fetchMock.mock.calls[0][1].body as string
    expect(body).toContain('remoteip=1.2.3.4')
  })
})
