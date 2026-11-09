'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  // Removed slug from state
  const [form, setForm] = useState({ schoolName: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Registration failed');
      return;
    }
    router.push('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-3 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-semibold">Register your school</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <Input
          placeholder="School name (e.g. Hogwarts)"
          value={form.schoolName}
          onChange={(e) => update('schoolName', e.target.value)}
          required
        />
        <Input
          placeholder="Your name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          required
        />

        <SubmitButton className="w-full rounded bg-black py-2 text-white">
          Create school
        </SubmitButton>
      </form>
    </div>
  );
}
