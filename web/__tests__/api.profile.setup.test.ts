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

  it('returns 404 when user not found', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'a@b.com', id: '1' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalType: 'Exam',
        goalAmount: 5,
        examRegistrations: [],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'User not found',
    });
  });

  it('saves profile and exams', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { email: 'a@b.com', id: '1' },
    });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1' });
    (prisma.userProfile.upsert as jest.Mock).mockResolvedValue({ id: 'p1' });

    const request = new Request('http://localhost/api/profile/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalType: 'Exam',
        goalAmount: 5,
        examRegistrations: [
          { exam: 'P', date: '2023-01-01T00:00:00.000Z' },
        ],
      }),
    });

    const response = await POST(request);

    expect(prisma.userProfile.upsert).toHaveBeenCalledWith({
      where: { userId: '1' },
      update: { goalType: 'Exam', goalAmount: 5 },
      create: { userId: '1', goalType: 'Exam', goalAmount: 5 },
    });
    expect(prisma.examRegistration.deleteMany).toHaveBeenCalledWith({
      where: { profileId: 'p1' },
    });
    expect(prisma.examRegistration.create).toHaveBeenCalledWith({
      data: {
        profileId: 'p1',
        examType: 'P',
        examDate: new Date('2023-01-01T00:00:00.000Z'),
      },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
  });
});
