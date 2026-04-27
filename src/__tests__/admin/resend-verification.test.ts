import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFindByID = vi.fn()
const mockSendEmail = vi.fn()
const mockGetPayload = vi.fn().mockResolvedValue({
  findByID: mockFindByID,
  sendEmail: mockSendEmail,
})

vi.mock('payload', () => ({
  getPayload: mockGetPayload,
}))

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (name === 'payload-token' ? { value: 'admin-token' } : undefined),
  }),
}))

vi.mock('@/modules/auth/email/verification-email', () => ({
  generateVerificationEmailHTML: ({ token }: { token: string }) => `<html>${token}</html>`,
  generateVerificationEmailSubject: () => 'Vérification',
}))

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

beforeEach(() => {
  vi.clearAllMocks()
  process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3001'
})

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

const { POST } = await import(
  '../../app/(frontend)/api/admin/customers/[id]/resend-verification/route'
)

describe('POST /api/admin/customers/[id]/resend-verification', () => {
  it('returns 401 when admin /me check fails', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false })
    const req = new NextRequest('http://localhost/api/admin/customers/1/resend-verification', {
      method: 'POST',
    })
    const res = await POST(req, makeParams('1'))
    expect(res.status).toBe(401)
  })

  it('returns 400 for non-numeric id', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 1 } }) })
    const req = new NextRequest('http://localhost/api/admin/customers/abc/resend-verification', {
      method: 'POST',
    })
    const res = await POST(req, makeParams('abc'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when customer is already verified', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 1 } }) })
    mockFindByID.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      _verified: true,
      _verificationToken: 'token123',
    })
    const req = new NextRequest('http://localhost/api/admin/customers/1/resend-verification', {
      method: 'POST',
    })
    const res = await POST(req, makeParams('1'))
    expect(res.status).toBe(400)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })

  it('returns 200 and sends email for unverified customer', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 1 } }) })
    mockFindByID.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      _verified: false,
      _verificationToken: 'token-abc',
    })
    mockSendEmail.mockResolvedValueOnce(undefined)
    const req = new NextRequest('http://localhost/api/admin/customers/1/resend-verification', {
      method: 'POST',
    })
    const res = await POST(req, makeParams('1'))
    expect(res.status).toBe(200)
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@example.com',
        html: expect.stringContaining('token-abc'),
      }),
    )
  })

  it('returns 400 when verification token is missing', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 1 } }) })
    mockFindByID.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      _verified: false,
      _verificationToken: null,
    })
    const req = new NextRequest('http://localhost/api/admin/customers/1/resend-verification', {
      method: 'POST',
    })
    const res = await POST(req, makeParams('1'))
    expect(res.status).toBe(400)
    expect(mockSendEmail).not.toHaveBeenCalled()
  })
})
