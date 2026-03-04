import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch initial stats
  const adminClient = createAdminClient();
  const [total, pending, approved, rejected] = await Promise.all([
    adminClient.from('applications').select('id', { count: 'exact', head: true }),
    adminClient.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    adminClient.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
  ]);

  const stats = {
    total:    total.count ?? 0,
    pending:  pending.count ?? 0,
    approved: approved.count ?? 0,
    rejected: rejected.count ?? 0,
  };

  return <AdminDashboardClient user={user} stats={stats} />;
}
