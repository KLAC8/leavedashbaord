'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import { Calendar, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import EmployeeProfile from '@/components/ui/EmployeeProfile';
import LeaveBalance from '@/components/ui/LeaveBalance';
import Link from 'next/link';
import Loading from './loading';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  if (status === 'loading') return <div>
    <Loading />
  </div>;
  if (!session) return null;

  const role = session.user?.role;

  // ✅ Employee View (no sidebar, request leave button)
  if (role === 'employee') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="opacity-5 transform scale-150">
            <Building2 className="w-96 h-96 text-gray-400" />
          </div>
        </div>

        <div className="text-center relative z-10 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome {session.user.name}</h1>
          <p className="text-gray-600 mb-6">Check your profile or request leave below.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/request-leave" className="bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-md hover:bg-emerald-600 transition">
              Request Leave
            </Link>
            <Link href="/employeeHome" className="bg-white text-emerald-600 border border-emerald-400 px-6 py-3 rounded-xl shadow-md hover:bg-emerald-50 transition">
              View Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Admin or MD Dashboard (with sidebar)
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="opacity-5 transform scale-150">
          <Building2 className="w-96 h-96 text-gray-400" />
        </div>
      </div>
      {/* Sidebar - Fixed to full height */}
      <div className="flex-shrink-0">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-2xl border-b border-emerald-400/30 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 bg-white/20 rounded-lg lg:hidden hover:bg-white/30" onClick={() => setSidebarOpen(true)}>
                <Calendar className="w-5 h-5 text-white" />
              </button>
              <button className="hidden lg:flex p-2 rounded-lg hover:bg-white/10" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-white">KLAC Management Portal</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{session.user?.name || 'User'}</p>
                <p className="text-xs text-emerald-100">{session.user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
                <span className="text-white text-sm font-medium">{session.user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Admin/MD Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
                <h2 className="text-2xl font-bold text-gray-800">Welcome to Your Dashboard</h2>
                <p className="text-gray-600">Manage leave requests and employee information</p>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2"><EmployeeProfile /></div>
              <div className="xl:col-span-1"><LeaveBalance /></div>
            </div>
          </div>
        </main>

        <footer className="bg-gradient-to-r from-emerald-600 to-teal-700 border-t border-emerald-500/30 px-4 sm:px-6 py-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-white">
                &copy; {new Date().getFullYear()} Leave Management Portal. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-emerald-100">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/support" className="hover:text-white">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}