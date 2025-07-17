'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/ui/Sidebar';
import DashboardCard from '@/components/ui/DashboardCard';
import LeaveRequestForm from '@/components/ui/LeaveRequestForm';
import LeaveRequestTable from '@/components/ui/LeaveRequestTable';
import ApprovalModal from '@/components/ui/ApprovalModal';
import CommentThread from '@/components/ui/CommentThread';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedLeaves: 0,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  // Fetch dashboard statistics
  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  // Reset quotas handler
  async function resetLeaveQuotas() {
    await fetch('/api/leave/reset', { method: 'POST' });
    alert('Leave quotas reset.');
  }

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 p-6 space-y-6 bg-gray-100 min-h-screen overflow-auto">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardCard title="Total Employees" count={stats.totalEmployees} />
          <DashboardCard title="Pending Requests" count={stats.pendingRequests} />
          <DashboardCard title="Approved Leaves" count={stats.approvedLeaves} />
        </div>

        <button
          onClick={resetLeaveQuotas}
          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
        >
          Reset Leave Quotas
        </button>
        <LeaveRequestTable role="admin" withExport withPagination withFilters withComments />
        <ApprovalModal />
        <CommentThread />
      </main>
    </div>
  );
}
