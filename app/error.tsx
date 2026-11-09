'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('🔴 APP CRASHED:', error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-4">
      <h2 className="font-serif text-2xl">Something went wrong!</h2>
      <pre className="max-w-2xl overflow-auto rounded bg-red-50 p-4 text-sm text-red-600">
        {error.message || 'Unknown error occurred'}
      </pre>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
