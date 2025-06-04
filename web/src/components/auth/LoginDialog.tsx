'use client';

import { useState, useEffect, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginDialog({
  defaultOpen = true,
}: {
  defaultOpen?: boolean;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [open, setOpen] = useState(defaultOpen);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkProfileAndRedirect = useCallback(async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      const needsSetup =
        !data.goalType &&
        !data.goalAmount &&
        (!data.examRegistrations || data.examRegistrations.length === 0);

      if (needsSetup) {
        router.push('/setup');
      } else {
        router.push('/home');
      }
      router.refresh();
    } catch (error) {
      console.error('Error checking profile:', error);
      router.push('/home');
      router.refresh();
    }
  }, [router]);

  useEffect(() => {
    if (status === 'authenticated') {
      checkProfileAndRedirect();
    }
  }, [status, checkProfileAndRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
        setIsLoading(false);
        return;
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
      setIsLoading(false);
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      router.push('/');
    }
    setOpen(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
              disabled={isLoading}
            />
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Login'
              )}
            </Button>
            <p className="text-sm text-center w-full">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-info hover:underline"
                onClick={() => setOpen(false)}
              >
                Register
              </Link>
            </p>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
