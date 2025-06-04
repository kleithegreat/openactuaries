/**
 * @jest-environment node
 */
import {
  getRequiredServerSession,
  getServerSessionUser,
} from '@/lib/auth/server';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/auth/auth', () => ({
  authOptions: {},
}));

describe('auth server helpers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects to login when session is missing', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    await getRequiredServerSession();

    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('returns user when session exists', async () => {
    const user = { id: '1', email: 'a@b.com' };
    (getServerSession as jest.Mock).mockResolvedValue({ user });

    const result = await getServerSessionUser();

    expect(result).toEqual(user);
  });
});
