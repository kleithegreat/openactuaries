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

  it('returns history analytics', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2023-05-15T12:00:00Z'));
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'p1' });
    (prisma.problemAttempt.findMany as jest.Mock).mockResolvedValue([]);

    const response = await GET();

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json.accuracyHistory)).toBe(true);
    expect(Array.isArray(json.volumeHistory)).toBe(true);
    expect(Array.isArray(json.recentProblems)).toBe(true);
    expect(json.accuracyHistory).toHaveLength(12);
    expect(json.volumeHistory).toHaveLength(12);
  });
});
