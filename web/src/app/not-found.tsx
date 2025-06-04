'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
        404 - Page Not Found
      </h2>
      <p className="text-foreground-secondary mb-8">
        Sorry, we couldn&#39;t find the page you were looking for.
      </p>
      <Link href="/">
        <Button variant="primary" className="px-6">
          Go to Home
        </Button>
      </Link>
    </div>
  );
}
