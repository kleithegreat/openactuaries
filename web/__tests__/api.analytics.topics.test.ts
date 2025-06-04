/**
 * @jest-environment node
 */
import { GET } from '@/app/api/analytics/topics/route';
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

describe('GET /api/analytics/topics', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/analytics/topics');
    const response = await GET(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Not authenticated',
    });
  });

  it('returns 404 when profile not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/analytics/topics');
    const response = await GET(request);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Profile not found',
    });
  });

  it('returns topic stats', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({
      id: 'p1',
    });
    (prisma.problemAttempt.findMany as jest.Mock).mockResolvedValue([
      { isCorrect: true, problem: { syllabusCategory: 'Alg' } },
      { isCorrect: false, problem: { syllabusCategory: 'Calc' } },
      { isCorrect: true, problem: { syllabusCategory: 'Alg' } },
    ]);

    const request = new Request('http://localhost/api/analytics/topics?exam=P');
    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      breakdown: [
        { topic: 'Alg', value: 2 },
        { topic: 'Calc', value: 1 },
      ],
      performance: [
        { subject: 'Alg', accuracy: 100 },
        { subject: 'Calc', accuracy: 0 },
      ],
      toFocus: [{ topic: 'Calc', accuracy: 0, problems: 1 }],
    });
  });
});
