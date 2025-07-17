'use client';

import { useSession } from 'next-auth/react';
import EmployeeDatabase from '@/components/ui/EmployeeDatabase';
import Sidebar from '@/components/ui/Sidebar';
import { Users, Calendar } from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center lg:hidden">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
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

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="bg-slate-800 rounded-xl shadow-sm border border-zinc-200 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Welcome to Your Dashboard</h2>
                    <p className="text-gray-400">Manage your team's leave requests and employee information</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Database Section */}
            <section className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-gray-300">
                  <div className="flex items-center gap-3 ">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Employee Database</h3>
                  </div>
                </div>
                <div className="p-6">
                  <EmployeeDatabase />
                </div>
              </div>
            </section>
          </div>
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
