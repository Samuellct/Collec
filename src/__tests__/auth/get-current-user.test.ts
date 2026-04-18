import { describe, it, expect, vi, beforeEach } from 'vitest'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

const getCookieMock = vi.fn()
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: getCookieMock }),
}))

beforeEach(() => {
  vi.resetAllMocks()
  process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3001'
})

describe('getCurrentUser', () => {
  it('returns null when no cookie is present', async () => {
    getCookieMock.mockReturnValue(undefined)
    const { getCurrentUser } = await import('@/lib/auth/get-current-user')
    const result = await getCurrentUser()
    expect(result).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns user when /api/customers/me responds 200', async () => {
    getCookieMock.mockReturnValue({ value: 'test-token' })
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { id: 1, email: 'test@example.com' } }),
    })
    const { getCurrentUser } = await import('@/lib/auth/get-current-user')
    const result = await getCurrentUser()
    expect(result).toMatchObject({ id: 1, email: 'test@example.com' })
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/customers/me',
      expect.objectContaining({ headers: { Authorization: 'JWT test-token' } }),
    )
  })

  it('returns null when /api/customers/me responds non-ok', async () => {
    getCookieMock.mockReturnValue({ value: 'expired-token' })
    fetchMock.mockResolvedValueOnce({ ok: false })
    const { getCurrentUser } = await import('@/lib/auth/get-current-user')
    const result = await getCurrentUser()
    expect(result).toBeNull()
  })

  it('returns null when fetch throws a network error', async () => {
    getCookieMock.mockReturnValue({ value: 'test-token' })
    fetchMock.mockRejectedValueOnce(new Error('Network error'))
    const { getCurrentUser } = await import('@/lib/auth/get-current-user')
    const result = await getCurrentUser()
    expect(result).toBeNull()
  })
})
