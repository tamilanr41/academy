'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { clientPost } from '@/lib/client';
import { Button, Card, Field, Input } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await clientPost('/api/auth/login', form);
    setLoading(false);

    if (!result.ok) {
      setError(result.message || 'Unable to sign in');
      return;
    }
    toast.success(`Welcome back, ${result.data.user.name.split(' ')[0]}`);
    const next = searchParams.get('next');
    const fallback = result.data.user.role === 'student' ? '/dashboard' : '/admin';
    router.push(next || fallback);
    router.refresh();
  };

  return (
    <Card className="p-7">
      <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to your student or admin account.</p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" htmlFor="login-email" required>
          <Input id="login-email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
        </Field>
        <Field label="Password" htmlFor="login-password" required>
          <Input id="login-password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
        </Field>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-semibold text-brand-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link href="/register" className="font-semibold text-brand-600 hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-500">
        Want to enrol?{' '}
        <Link href="/apply" className="font-semibold text-brand-600 hover:underline">
          Apply for a course
        </Link>
      </p>
    </Card>
  );
}
