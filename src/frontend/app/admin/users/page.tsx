import { Metadata } from 'next';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { MainLayout } from '@/components/layout/main-layout';
import { UsersTable } from '@/components/admin/users-table';

export const metadata: Metadata = {
  title: 'Quản Lý Nhân Viên - NutriGrid',
  description: 'Quản lý thông tin nhân viên',
};

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'admin') {
    redirect('/unauthorized');
  }

  // Fetch users from Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
  }

  return (
    <MainLayout
      userRole={userRole}
      userName={session.user?.name || 'Admin'}
    >
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quản Lý Nhân Viên
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Quản lý thông tin {users?.length || 0} nhân viên bếp
          </p>
        </div>

        <UsersTable users={users || []} />
      </div>
    </MainLayout>
  );
}
