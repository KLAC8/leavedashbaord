'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Menu,
  Settings,
  Home,
  LogIn,
  UserPlus,
  Shield,
  X,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        sidebarOpen &&
        !target.closest('aside') &&
        !target.closest('button[aria-label="Toggle sidebar"]')
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  function handleAdminAccess() {
    if (!session) {
      signIn();
    } else {
      router.push('/admin');
    }
  }

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push('/login');
  }

  const navigationItems = [
    { href: '/', icon: Home, label: 'Home' },
    !session
      ? { href: '/login', icon: LogIn, label: 'Login' }
      : { href: '#logout', icon: LogIn, label: 'Logout', onClick: handleLogout },
    { href: '/register', icon: UserPlus, label: 'Register' },
    { href: 'https://inventory-mu-one.vercel.app/dashboard', icon: Database, label: 'Inventory', external: true },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-white shadow-xl border-r border-slate-200 flex flex-col justify-between transition-all duration-300 ease-in-out fixed lg:static top-0 left-0 h-screen min-h-screen z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Leave Portal
                </h2>
              )}
            </div>
            <button
              className="lg:hidden p-1 rounded-md hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 cursor-pointer group ${
                    sidebarCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </a>
              ) : item.onClick ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 cursor-pointer group ${
                    sidebarCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              ) : (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 cursor-pointer group ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                  </div>
                </Link>
              )
            )}

            <button
              onClick={handleAdminAccess}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 cursor-pointer group ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-medium">Admin Dashboard</span>}
            </button>
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <Link href="/settings">
            <div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 cursor-pointer ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
            </div>
          </Link>
        </div>
      </aside>

      {/* Toggle button for desktop */}
      <button
        aria-label="Toggle sidebar"
        className="hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-slate-100 lg:flex"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5 text-slate-700" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        )}
      </button>

      {/* Mobile menu button */}
      <button
        aria-label="Toggle sidebar"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-slate-100"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>
    </>
  );
}
