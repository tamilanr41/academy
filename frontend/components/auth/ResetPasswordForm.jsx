'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { clientPost } from '@/lib/client';
import { Button, Card, Field, Input } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setErrors({});
    const result = await clientPost('/api/auth/reset-password', { token, password: form.password });
    setLoading(false);
    if (result.ok) {
      toast.success('Password updated. Please sign in.');
      router.push('/login');
      return;
    }
    if (result.errors?.length) setErrors(Object.fromEntries(result.errors.map((error) => [error.field, error.message])));
    else toast.error(result.message || 'Could not reset password');
  };

  if (!token) {
    return (
      <Card className="p-7 text-center">
        <h1 className="text-xl font-bold text-slate-900">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-600">This password reset link is missing or invalid. Please request a new one.</p>
        <Link href="/forgot-password" className="mt-6 inline-block font-semibold text-brand-600 hover:underline">
          Request a new link
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-7">
      <h1 className="text-2xl font-extrabold text-slate-900">Set a new password</h1>
      <p className="mt-1 text-sm text-slate-500">Choose a strong password you haven&apos;t used before.</p>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="New password" htmlFor="reset-password" error={errors.password} hint="At least 8 characters." required>
          <Input id="reset-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" error={errors.password} required />
        </Field>
        <Field label="Confirm password" htmlFor="reset-confirm" error={errors.confirm} required>
          <Input id="reset-confirm" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" error={errors.confirm} required />
        </Field>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </Card>
  );
}
