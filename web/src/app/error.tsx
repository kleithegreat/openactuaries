'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
        Something went wrong
      </h2>
      <p className="text-foreground-secondary mb-8">
        An unexpected error has occurred.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={reset}>
          Try Again
        </Button>
        <Link href="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
