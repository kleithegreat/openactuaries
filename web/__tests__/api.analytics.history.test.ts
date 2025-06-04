/**
 * @jest-environment node
 */
import { GET } from '@/app/api/analytics/history/route';
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
    problemAttempt: { findMany: jest.fn() },
  },
}));

describe('GET /api/analytics/history', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Not authenticated',
    });
  });

  it('returns 404 when profile not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Profile not found',
    });
  });

  it('returns history analytics', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'p1' });
    (prisma.problemAttempt.findMany as jest.Mock)
      .mockResolvedValueOnce([
        {
          createdAt: new Date(),
          isCorrect: true,
          problem: { exam: 'P', syllabusCategory: 'A', questionNumber: 1 },
          timeSpent: 30,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'a1',
          createdAt: new Date(),
          isCorrect: true,
          timeSpent: 30,
          problem: { exam: 'P', syllabusCategory: 'A', questionNumber: 1 },
        },
      ]);

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.accuracyHistory)).toBe(true);
    expect(Array.isArray(data.volumeHistory)).toBe(true);
    expect(Array.isArray(data.recentProblems)).toBe(true);
  });
});
