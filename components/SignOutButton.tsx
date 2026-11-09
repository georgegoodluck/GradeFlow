'use client';

import { signOut } from 'next-auth/react';
import { SubmitButton } from '@/components/SubmitButton';

export function SignOutButton() {
  return (
    <SubmitButton variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
      Sign out
    </SubmitButton>
  );
}
