'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SubmitButton } from '@/components/SubmitButton';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ schoolName: '', slug: '', name: '', email: '', password: '' });
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
        {(['schoolName', 'slug', 'name', 'email', 'password'] as const).map((key) => (
          <input
            key={key}
            type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
            placeholder={
              key === 'schoolName'
                ? 'School name'
                : key === 'slug'
                  ? 'URL slug (e.g. greenwood)'
                  : key === 'name'
                    ? 'Your name'
                    : key === 'email'
                      ? 'Email'
                      : 'Password'
            }
            value={form[key]}
            onChange={(e) => update(key, e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        ))}
        <SubmitButton className="w-full rounded bg-black py-2 text-white">
          Create school
        </SubmitButton>
      </form>
    </div>
  );
}
