import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardRedirect() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;
  if (role === 'OWNER' || role === 'ADMIN') redirect('/admin');
  if (role === 'TEACHER') redirect('/teacher');
  if (role === 'STUDENT') redirect('/student');

  redirect('/login');
}
