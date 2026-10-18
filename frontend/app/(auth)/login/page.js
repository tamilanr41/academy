import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = { title: 'Sign In' };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'student' ? '/dashboard' : '/admin');

  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}
