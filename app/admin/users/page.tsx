import { auth } from '@/auth';
import { withTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/PageHeader';
import { createUser } from './actions';
import { SubmitButton } from '@/components/SubmitButton';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user?.schoolId) redirect('/login');

  const users = await withTenant(session.user.schoolId, async (tx) => {
    return tx.user.findMany({
      where: {
        role: { in: ['OWNER', 'ADMIN', 'TEACHER'] },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  return (
    <div>
      <PageHeader title="Users" description="Staff and administrators" />
      <form action={createUser} className="mb-6 grid max-w-2xl grid-cols-2 gap-2 md:grid-cols-5">
        <Input name="name" placeholder="Full name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password" required minLength={6} />
        <select name="role" className="rounded-md border bg-white px-3 py-2 text-sm">
          <option value="TEACHER">Teacher</option>
          <option value="ADMIN">Admin</option>
        </select>
        <SubmitButton>Add user</SubmitButton>
      </form>
      <div className="shadow-soft overflow-hidden rounded-lg border bg-white">
        <table className="w-full">
          <thead className="bg-secondary/50 text-muted-foreground border-b text-left text-xs tracking-wider uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-6 py-4 text-sm">{u.name}</td>
                <td className="text-muted-foreground px-6 py-4 text-sm">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="bg-secondary rounded-full px-2 py-1 text-xs tracking-wider uppercase">
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
