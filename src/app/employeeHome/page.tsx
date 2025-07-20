'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import EmployeeProfile from '@/components/ui/EmployeeProfile';
import LeaveBalance from '@/components/ui/LeaveBalance';
import Link from 'next/link';


export default function EmployeeHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
    else if (session.user?.role !== 'employee') router.push('/login'); // Redirect non-employees to main home
  }, [session, status, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="opacity-10 transform scale-200">
            <Building2 className="w-96 h-96 text-gray-400" />
          </div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-2xl border-b border-emerald-400/30 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
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

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome to Your Dashboard</h2>
                    <p className="text-gray-600">Manage leave requests and employee information</p>
                  </div>
                  <Link
                    href="/request-leave"
                    className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow"
                  >
                    Request Leave
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <EmployeeProfile />
              </div>
              <div className="xl:col-span-1">
                <LeaveBalance />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
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
