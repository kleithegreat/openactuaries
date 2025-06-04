/**
 * @jest-environment node
 */
import { POST } from '@/app/api/register/route'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => 'hashedPassword'),
}))

describe('POST /api/register', () => {
  const userData = { name: 'John Doe', email: 'john@example.com', password: 'secret' }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 if email already exists', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' })

    const request = new Request('http://localhost/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Email already in use' })
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('creates user and returns 201', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue({ id: '1' })

    const request = new Request('http://localhost/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })

    const response = await POST(request)

    expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10)
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: userData.name,
        email: userData.email,
        password: 'hashedPassword',
      },
    })

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ message: 'User created successfully' })
  })
})
