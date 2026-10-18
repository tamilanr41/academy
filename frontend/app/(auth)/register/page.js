import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = { title: 'Create Account' };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === 'student' ? '/dashboard' : '/admin');

  return <RegisterForm />;
}
