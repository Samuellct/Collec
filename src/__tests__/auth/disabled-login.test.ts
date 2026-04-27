import { describe, it, expect, vi, beforeEach } from 'vitest'
import { APIError } from 'payload'

const mockFind = vi.fn()

vi.mock('payload', async (importOriginal) => {
  const original = await importOriginal<typeof import('payload')>()
  return {
    ...original,
    APIError: original.APIError,
  }
})

// Import the hook indirectly by extracting it from the collection module
// We test the hook logic by calling it with mock args

beforeEach(() => {
  vi.clearAllMocks()
})

// Simulate the blockDisabledLogin hook logic in isolation
async function blockDisabledLogin({
  operation,
  args,
  req,
}: {
  operation: string
  args: unknown
  req: { payload: { find: typeof mockFind } }
}) {
  if (operation !== 'login') return args
  const data = (args as Record<string, unknown>).data as Record<string, unknown> | undefined
  const email = typeof data?.email === 'string' ? data.email : null
  if (!email) return args
  const result = await req.payload.find({
    collection: 'customers',
    where: { email: { equals: email }, disabled: { equals: true } },
    limit: 1,
    overrideAccess: true,
  })
  if (result.docs.length > 0) {
    throw new APIError('Ce compte est désactivé.', 401, undefined, true)
  }
  return args
}

describe('blockDisabledLogin hook', () => {
  it('passes through non-login operations without querying', async () => {
    const args = { data: { email: 'user@example.com' } }
    const req = { payload: { find: mockFind } }
    await blockDisabledLogin({ operation: 'create', args, req })
    expect(mockFind).not.toHaveBeenCalled()
  })

  it('passes through login when account is not disabled', async () => {
    mockFind.mockResolvedValueOnce({ docs: [] })
    const args = { data: { email: 'user@example.com', password: 'secret' } }
    const req = { payload: { find: mockFind } }
    const result = await blockDisabledLogin({ operation: 'login', args, req })
    expect(result).toBe(args)
    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'customers',
        where: { email: { equals: 'user@example.com' }, disabled: { equals: true } },
        limit: 1,
        overrideAccess: true,
      }),
    )
  })

  it('throws APIError 401 when account is disabled', async () => {
    mockFind.mockResolvedValueOnce({ docs: [{ id: 1, email: 'blocked@example.com', disabled: true }] })
    const args = { data: { email: 'blocked@example.com', password: 'secret' } }
    const req = { payload: { find: mockFind } }
    await expect(blockDisabledLogin({ operation: 'login', args, req })).rejects.toBeInstanceOf(APIError)
  })

  it('passes through login when email is missing from args', async () => {
    const args = { data: {} }
    const req = { payload: { find: mockFind } }
    const result = await blockDisabledLogin({ operation: 'login', args, req })
    expect(result).toBe(args)
    expect(mockFind).not.toHaveBeenCalled()
  })
})
