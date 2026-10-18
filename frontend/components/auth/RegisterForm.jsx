'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clientPost } from '@/lib/client';
import { Button, Card, Field, Input } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirm) {
      setErrors({ confirm: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setErrors({});
    const { confirm, ...payload } = form;
    if (!payload.phone) delete payload.phone;
    const result = await clientPost('/api/auth/register', payload);
    setLoading(false);

    if (result.ok) {
      toast.success('Account created! Welcome aboard.');
      router.push('/dashboard');
      router.refresh();
      return;
    }
    if (result.errors?.length) setErrors(Object.fromEntries(result.errors.map((error) => [error.field, error.message])));
    else toast.error(result.message || 'Registration failed');
  };

  return (
    <Card className="p-7">
      <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Track applications, courses and payments in one place.</p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Full name" htmlFor="reg-name" error={errors.name} required>
          <Input id="reg-name" value={form.name} onChange={update('name')} placeholder="Your name" error={errors.name} required />
        </Field>
        <Field label="Email" htmlFor="reg-email" error={errors.email} required>
          <Input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={update('email')} placeholder="you@example.com" error={errors.email} required />
        </Field>
        <Field label="Phone" htmlFor="reg-phone" error={errors.phone} hint="Optional, helps us reach you faster.">
          <Input id="reg-phone" value={form.phone} onChange={update('phone')} placeholder="10-digit mobile" error={errors.phone} />
        </Field>
        <Field label="Password" htmlFor="reg-password" error={errors.password} hint="At least 8 characters." required>
          <Input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={update('password')} placeholder="••••••••" error={errors.password} required />
        </Field>
        <Field label="Confirm password" htmlFor="reg-confirm" error={errors.confirm} required>
          <Input id="reg-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={update('confirm')} placeholder="••••••••" error={errors.confirm} required />
        </Field>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
