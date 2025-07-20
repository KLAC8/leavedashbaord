'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {  useEffect } from 'react';
import {
  Settings,
  Home,
  LogIn,
  UserPlus,
  Shield,
  X,
  Database,
  LogOut,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  sidebarCollapsed, 
}: SidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();

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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen, setSidebarOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  function handleAdminAccess() {
    if (!session) {
      signIn();
    } else {
      router.push('/admin');
    }
    setSidebarOpen(false);
  }

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push('/login');
    setSidebarOpen(false);
  }

  const navigationItems = [
    { href: '/', icon: Home, label: 'Home' },
    !session
      ? { href: '/login', icon: LogIn, label: 'Login' }
      : { href: '#logout', icon: LogOut, label: 'Logout', onClick: handleLogout },
    { href: '/register', icon: UserPlus, label: 'Register' },
    { href: 'https://inventory-mu-one.vercel.app/dashboard', icon: Database, label: 'Inventory', external: true },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white/90 backdrop-blur-xl shadow-2xl border-r border-emerald-200/50 flex flex-col justify-between transition-all duration-300 ease-in-out fixed lg:static top-0 left-0 h-full min-h-full z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="p-4 border-b border-emerald-200/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  KLAC Portal
                </h2>
              )}
            </div>
            
            {/* Close button for mobile */}
            <button
              className="lg:hidden p-1 rounded-md hover:bg-emerald-100/50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navigationItems.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-100/80 hover:to-teal-100/80 hover:text-emerald-900 transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                    sidebarCollapsed ? 'justify-center' : ''
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </a>
              ) : item.onClick ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={`group w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-100/80 hover:to-teal-100/80 hover:text-emerald-900 transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                    sidebarCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </button>
              ) : (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-100/80 hover:to-teal-100/80 hover:text-emerald-900 transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                      sidebarCollapsed ? 'justify-center' : ''
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {sidebarCollapsed && (
                      <span className="absolute left-full ml-2 px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                        {item.label}
                      </span>
                    )}
                  </div>
                </Link>
              )
            )}
            
            {/* Admin Dashboard Button */}
            <button
              onClick={handleAdminAccess}
              className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-700 hover:bg-gradient-to-r hover:from-emerald-100/80 hover:to-teal-100/80 hover:text-emerald-900 transition-all cursor-pointer duration-200 backdrop-blur-sm ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="font-medium">Admin Dashboard</span>
              )}
              {sidebarCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap  pointer-events-none z-50 shadow-lg">
                  Admin Dashboard
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-emerald-200/50 p-4">
          <Link href="/settings">
            <div
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-100/80 hover:to-teal-100/80 hover:text-emerald-800 transition-all duration-200 cursor-pointer backdrop-blur-sm ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">Settings</span>
              )}
              {sidebarCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  Settings
                </span>
              )}
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}