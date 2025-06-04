/**
 * @jest-environment node
 */
import { GET } from '@/app/api/profile/route';
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
  },
}));

describe('GET /api/profile', () => {
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

  it('returns 404 when user not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'a@b.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET();

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@b.com' },
      include: {
        profile: {
          include: { examRegistrations: true },
        },
      },
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'User not found',
    });
  });

  it('returns defaults when profile missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'a@b.com' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      profile: null,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      goalType: null,
      goalAmount: null,
      examRegistrations: [],
    });
  });

  it('returns profile when found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'a@b.com' },
    });
    const profile = {
      id: 'p1',
      goalType: 'Exam',
      goalAmount: 10,
      examRegistrations: [{ id: 1 }],
    };
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      profile,
    });

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(profile);
  });
});
