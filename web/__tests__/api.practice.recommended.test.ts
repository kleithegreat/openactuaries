/**
 * @jest-environment node
 */
import { POST } from '@/app/api/practice/recommended/route';
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
    userProfile: { findUnique: jest.fn() },
    problem: { findMany: jest.fn() },
  },
}));

describe('POST /api/practice/recommended', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/practice/recommended', {
      method: 'POST',
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Not authenticated',
    });
  });

  it('returns recommended problems', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user1' },
    });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({
      problemAttempts: [{ problemId: 1 }],
    });

    const firstCall = [{ id: 2 }, { id: 3 }];
    const secondCall = [{ id: 4 }];
    (prisma.problem.findMany as jest.Mock)
      .mockResolvedValueOnce(firstCall)
      .mockResolvedValueOnce(secondCall);

    const request = new Request('http://localhost/api/practice/recommended', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemCount: 3, examType: 'P' }),
    });

    const originalRandom = Math.random;
    Math.random = jest.fn(() => 0.5);

    const response = await POST(request);

    Math.random = originalRandom;

    expect(prisma.problem.findMany).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([
      ...firstCall,
      ...secondCall,
    ]);
  });

  it('returns 400 on invalid body', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'user1' },
    });

    const request = new Request('http://localhost/api/practice/recommended', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemCount: 'abc' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.any(Object) }),
    );
  });
});
