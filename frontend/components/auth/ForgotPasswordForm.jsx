'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clientPost } from '@/lib/client';
import { Button, Card, Field, Input } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';

export function ForgotPasswordForm() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const result = await clientPost('/api/auth/forgot-password', { email });
    setLoading(false);
    if (result.ok) {
      setSent(true);
      toast.success(result.message || 'Check your inbox for reset instructions');
    } else {
      toast.error(result.message || 'Could not send reset email');
    }
  };

  if (sent) {
    return (
      <Card className="p-7 text-center">
        <h1 className="text-xl font-bold text-slate-900">Check your email</h1>
        <p className="mt-2 text-sm text-slate-600">
          If an account exists for <span className="font-semibold">{email}</span>, you&apos;ll receive a password reset link shortly.
        </p>
        <Link href="/login" className="mt-6 inline-block font-semibold text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-7">
      <h1 className="text-2xl font-extrabold text-slate-900">Forgot password?</h1>
      <p className="mt-1 text-sm text-slate-500">Enter your email and we&apos;ll send you a reset link.</p>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field label="Email" htmlFor="forgot-email" required>
          <Input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </Field>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
