/**
 * @jest-environment node
 */
import { GET } from '@/app/api/analytics/time/route';
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
    studySession: { findMany: jest.fn() },
    problemAttempt: { findMany: jest.fn() },
  },
}));

describe('GET /api/analytics/time', () => {
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

  it('returns time analytics', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const prevWeek = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'p1' });
    (prisma.studySession.findMany as jest.Mock).mockResolvedValue([
      { startTime: lastWeek, minutesSpent: 60 },
      { startTime: prevWeek, minutesSpent: 30 },
    ]);
    (prisma.problemAttempt.findMany as jest.Mock).mockResolvedValue([
      { createdAt: lastWeek, isCorrect: true, studySession: { startTime: lastWeek } },
      { createdAt: prevWeek, isCorrect: false, studySession: { startTime: prevWeek } },
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.weekdayDistribution)).toBe(true);
    expect(Array.isArray(data.studyDates)).toBe(true);
    expect(Array.isArray(data.timePerformance)).toBe(true);
    expect(typeof data.weeklyReport).toBe('object');
    expect(typeof data.streak).toBe('object');
  });
});
