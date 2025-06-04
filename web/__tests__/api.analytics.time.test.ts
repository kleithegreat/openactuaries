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
    jest.useRealTimers();
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
    jest.useFakeTimers().setSystemTime(new Date('2023-05-15T12:00:00Z'));
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'p1' });
    (prisma.studySession.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.problemAttempt.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json.weekdayDistribution)).toBe(true);
    expect(Array.isArray(json.studyDates)).toBe(true);
    expect(Array.isArray(json.timePerformance)).toBe(true);
    expect(json.weeklyReport).toEqual(
      expect.objectContaining({
        problems: expect.any(Object),
        studyHours: expect.any(Object),
        accuracy: expect.any(Object),
      }),
    );
    expect(json.streak).toEqual(
      expect.objectContaining({
        currentStreak: expect.any(Number),
        longestStreak: expect.any(Number),
        monthDays: expect.any(Number),
      }),
    );
  });
});
