import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StartPracticingButton } from '@/components/landing/StartPracticingButton';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('StartPracticingButton', () => {
  it('redirects to login when no user', () => {
    const push = jest.fn();
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockReturnValue({ push });
    render(<StartPracticingButton user={undefined} />);

    fireEvent.click(screen.getByRole('button'));
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('redirects new users to setup', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({}) }),
    ) as jest.Mock;
    const push = jest.fn();
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockReturnValue({ push });

    const user = { name: 'Test', email: 'a@b.com' };
    render(<StartPracticingButton user={user as any} />);

    await waitFor(() => expect(push).not.toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button'));
    expect(push).toHaveBeenCalledWith('/setup');
  });

  it('redirects existing users to home', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            goalType: 'PROBLEMS',
            goalAmount: 5,
            examRegistrations: [1],
          }),
      }),
    ) as jest.Mock;
    const push = jest.fn();
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockReturnValue({ push });

    const user = { name: 'Test', email: 'a@b.com' };
    render(<StartPracticingButton user={user as any} />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole('button')).toHaveTextContent('Go to Dashboard'),
    );
    fireEvent.click(screen.getByRole('button'));
    expect(push).toHaveBeenCalledWith('/home');
  });
});
