/**
 * @jest-environment node
 */
import { POST } from '@/app/api/practice/save-session/route';
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
    studySession: { create: jest.fn() },
    problemAttempt: { create: jest.fn() },
  },
}));

describe('POST /api/practice/save-session', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/practice/save-session', {
      method: 'POST',
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Not authenticated',
    });
  });

  it('returns 404 when user profile missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new Request('http://localhost/api/practice/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problems: [], answers: [] }),
    });
    const response = await POST(request);

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: 'User profile not found',
    });
  });

  it('saves session and attempts', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({ id: 'p1' });
    (prisma.studySession.create as jest.Mock).mockResolvedValue({ id: 's1' });

    const answers = [
      { problemId: 'a', answer: '1', isCorrect: true, timeSpent: 30 },
      { problemId: 'b', answer: '2', isCorrect: false, timeSpent: 40 },
    ];

    const request = new Request('http://localhost/api/practice/save-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problems: [], answers }),
    });

    const response = await POST(request);

    expect(prisma.studySession.create).toHaveBeenCalledTimes(1);
    expect(prisma.problemAttempt.create).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      sessionId: 's1',
    });
  });
});
