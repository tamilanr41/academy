import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export const metadata = { title: 'Reset Password' };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
