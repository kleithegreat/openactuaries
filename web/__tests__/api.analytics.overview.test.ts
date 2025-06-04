/**
 * @jest-environment node
 */
import { GET } from '@/app/api/analytics/overview/route';
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
  },
}));

describe('GET /api/analytics/overview', () => {
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

    expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: '1' },
      include: { problemAttempts: true, studySessions: true },
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'Profile not found',
    });
  });

  it('returns overview stats', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({
      problemAttempts: [
        { isCorrect: true },
        { isCorrect: false },
      ],
      studySessions: [
        { minutesSpent: 30 },
        { minutesSpent: 90 },
      ],
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      totalProblemsSolved: 2,
      totalStudyHours: 2,
      accuracy: 50,
    });
  });
});
