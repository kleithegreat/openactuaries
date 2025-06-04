/**
 * @jest-environment node
 */
import { POST } from '@/app/api/profile/setup/route';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth/auth', () => ({
  authOptions: {},
}));

jest.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    userProfile: { upsert: jest.fn() },
    examRegistration: { deleteMany: jest.fn(), create: jest.fn() },
  },
}));

describe('POST /api/profile/setup', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/profile/setup', {
      method: 'POST',
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Not authenticated',
    });
  });

  it('returns 400 on invalid body', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'a@b.com', id: '1' },
    });

    const request = new Request('http://localhost/api/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.any(Object) }),
    );
  });
});
