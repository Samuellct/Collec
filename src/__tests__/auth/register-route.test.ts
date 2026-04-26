import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockFind = vi.fn().mockResolvedValue({ docs: [] })
const mockCreate = vi.fn().mockResolvedValue({ id: 1, email: 'test@example.com' })

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    create: mockCreate,
    find: mockFind,
  }),
}))

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('@/modules/auth/turnstile/verify-token', () => ({
  verifyTurnstileToken: vi.fn(),
}))

const { POST } = await import(
  '../../app/(frontend)/api/auth/register/route'
)
const { verifyTurnstileToken } = await import('@/modules/auth/turnstile/verify-token')

const mockedVerify = vi.mocked(verifyTurnstileToken)

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

const validBody = { email: 'user@example.com', password: 'securepass', pseudo: 'monpseudo', turnstileToken: 'ok' }

beforeEach(() => {
  vi.clearAllMocks()
  mockFind.mockResolvedValue({ docs: [] })
  mockCreate.mockResolvedValue({ id: 1, email: 'test@example.com' })
})

describe('POST /api/auth/register', () => {
  it('returns 201 with valid payload and valid turnstile token', async () => {
    mockedVerify.mockResolvedValueOnce(true)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
  })

  it('returns 400 when turnstile verification fails', async () => {
    mockedVerify.mockResolvedValueOnce(false)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(400)
  })

  it('returns 400 when email is invalid', async () => {
    mockedVerify.mockResolvedValueOnce(true)
    const res = await POST(makeRequest({ ...validBody, email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when password is too short', async () => {
    mockedVerify.mockResolvedValueOnce(true)
    const res = await POST(makeRequest({ ...validBody, password: 'short' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when pseudo is missing', async () => {
    mockedVerify.mockResolvedValueOnce(true)
    const { pseudo: _, ...bodyWithoutPseudo } = validBody
    const res = await POST(makeRequest(bodyWithoutPseudo))
    expect(res.status).toBe(400)
  })

  it('returns 400 when pseudo is too short', async () => {
    mockedVerify.mockResolvedValueOnce(true)
    const res = await POST(makeRequest({ ...validBody, pseudo: 'ab' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when pseudo is too long', async () => {
    mockedVerify.mockResolvedValueOnce(true)
    const res = await POST(makeRequest({ ...validBody, pseudo: 'a'.repeat(31) }))
    expect(res.status).toBe(400)
  })

  it('returns 409 when pseudo is already taken', async () => {
    mockedVerify.mockResolvedValueOnce(true)
    mockFind.mockResolvedValueOnce({ docs: [{ id: 2, pseudo: 'monpseudo' }] })
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(409)
  })

  it('returns 400 when body is malformed JSON', async () => {
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: 'not-json',
      headers: { 'content-type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 201 even when payload.create throws (anti-enumeration)', async () => {
    const { getPayload } = await import('payload')
    vi.mocked(getPayload).mockResolvedValueOnce({
      create: vi.fn().mockRejectedValueOnce(new Error('Duplicate email')),
      find: vi.fn().mockResolvedValue({ docs: [] }),
    } as unknown as Awaited<ReturnType<typeof getPayload>>)
    mockedVerify.mockResolvedValueOnce(true)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)
  })
})
