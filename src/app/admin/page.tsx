'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import DashboardCard from '@/components/ui/DashboardCard';
import LeaveRequestTable from '@/components/ui/LeaveRequestTable';
import ApprovalModal from '@/components/ui/ApprovalModal';
import CommentThread from '@/components/ui/CommentThread';
import { Calendar, Menu, ChevronRight, ChevronLeft } from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedLeaves: 0,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  async function resetLeaveQuotas() {
    await fetch('/api/leave/reset', { method: 'POST' });
    alert('Leave quotas reset.');
  }

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar wrapper with full height */}
      <div className="h-screen sticky top-0 z-40">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center lg:hidden">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  KLAC Management Portal
                </h1>
              </div>

              {session && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-slate-700">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-500">{session.user?.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {session.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6 bg-gray-100 overflow-y-auto">
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

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Leave Management Portal. All rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <a href="/privacy" className="hover:text-slate-700 transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-slate-700 transition-colors">
                  Terms of Service
                </a>
                <a href="/support" className="hover:text-slate-700 transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
