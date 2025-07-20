'use client';
import EmployeeDatabase from '@/components/ui/EmployeeDatabase';
import { Building2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/ui/Sidebar';

const EmployeeDatabasePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="opacity-5 transform scale-150">
          <Building2 className="w-96 h-96 text-gray-400" />
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-cyan-200 rounded-full opacity-20 animate-pulse delay-500"></div>

      {/* Sidebar - Full height */}
      <div className="flex-shrink-0">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-2xl border-b border-emerald-400/30 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center lg:hidden hover:bg-white/30 transition-colors"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Calendar className="w-5 h-5 text-white" />
                </button>
                <button
                  className="hidden lg:flex p-2 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronLeft className="w-5 h-5 text-white" />
                  )}
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  KLAC Management Portal
                </h1>
              </div>

              {session && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white">
                      {session.user?.name || 'User'}
                    </p>
                    <p className="text-xs text-emerald-100">{session.user?.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30">
                    <span className="text-white text-sm font-medium">
                      {session.user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <EmployeeDatabase />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-emerald-600 to-teal-700 border-t border-emerald-500/30 px-4 sm:px-6 py-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-white">
                &copy; {new Date().getFullYear()} Leave Management Portal. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-emerald-100">
              <a href="/privacy" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors duration-200">Terms of Service</a>
              <a href="/support" className="hover:text-white transition-colors duration-200">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EmployeeDatabasePage;