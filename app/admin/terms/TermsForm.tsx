'use client';

import { useState, useTransition } from 'react';
import { createTerm } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TermForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setError('');
    startTransition(async () => {
      try {
        await createTerm(formData);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create term');
      }
    });
  }

  return (
    <div className="shadow-soft mb-8 rounded-lg border bg-white p-4">
      {error && <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <form action={handleSubmit} className="flex flex-wrap gap-2">
        <Input
          name="session"
          placeholder="Session (e.g. 2025/2026)"
          required
          className="max-w-[200px]"
          disabled={isPending}
        />
        <Input
          name="name"
          placeholder="Term (e.g. First Term)"
          required
          className="max-w-[200px]"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Adding...' : 'Add Term'}
        </Button>
      </form>
    </div>
  );
}
