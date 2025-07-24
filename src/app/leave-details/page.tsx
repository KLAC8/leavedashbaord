'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/ui/Sidebar';
import { 
  Calendar, 
  Clock, 
  Heart,
  ArrowLeft,
  Plus,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  rejectionReason?: string;
}

interface Employee {
  annualLeaveBalance: number;
  annualLeaveTaken: number;
  frLeaveBalance: number;
  frLeaveTaken: number;
  sickLeaveBalance: number;
  sickLeaveTaken: number;
}

export default function LeaveDetails() {
  const { data: session, status } = useSession();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showNewLeaveForm, setShowNewLeaveForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const leaveType = searchParams.get('type') || 'all';

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch employee data
        const empRes = await fetch('/api/employees/me', { credentials: 'include' });
        const empData = await empRes.json();
        if (empRes.ok) {
          setEmployee(empData.employee);
        }

        // Fetch leave requests
        const leaveRes = await fetch(`/api/leaves?type=${leaveType}`, { 
          credentials: 'include' 
        });
        const leaveData = await leaveRes.json();
        if (leaveRes.ok) {
          setLeaveRequests(leaveData.leaves);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [leaveType, session]);

  const getLeaveTypeInfo = (type: string) => {
    switch (type) {
      case 'annual-leave':
        return { name: 'Annual Leave', icon: Calendar, color: 'from-emerald-500 to-green-600' };
      case 'fr-leave':
        return { name: 'FR Leave', icon: Clock, color: 'from-teal-500 to-cyan-600' };
      case 'sick-leave':
        return { name: 'Sick Leave', icon: Heart, color: 'from-emerald-600 to-teal-700' };
      default:
        return { name: 'All Leaves', icon: FileText, color: 'from-blue-500 to-purple-600' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock3 className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const typeInfo = getLeaveTypeInfo(leaveType);
  const IconComponent = typeInfo.icon;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const role = session.user?.role;

  // Employee View (no sidebar, simpler layout)
  if (role === 'employee') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="opacity-5 transform scale-150">
            <Building2 className="w-96 h-96 text-gray-400" />
          </div>
        </div>

        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-2xl border-b border-emerald-400/30 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
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

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.color} rounded-xl flex items-center justify-center`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{typeInfo.name}</h1>
                <p className="text-gray-600">Leave history and requests</p>
              </div>
            </div>

            {/* Summary Cards */}
            {employee && leaveType !== 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-emerald-600">
                    {leaveType === 'annual-leave' ? employee.annualLeaveTaken :
                     leaveType === 'fr-leave' ? employee.frLeaveTaken :
                     employee.sickLeaveTaken}
                  </div>
                  <div className="text-sm text-gray-600">Days Used</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-teal-600">
                    {leaveType === 'annual-leave' ? employee.annualLeaveBalance - employee.annualLeaveTaken :
                     leaveType === 'fr-leave' ? employee.frLeaveBalance - employee.frLeaveTaken :
                     employee.sickLeaveBalance - employee.sickLeaveTaken}
                  </div>
                  <div className="text-sm text-gray-600">Days Remaining</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Requests</div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowNewLeaveForm(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Request Leave
                </button>
              </div>
            </div>

            {/* Leave Requests */}
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Leave Requests</h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? 'No leave requests found.' : `No ${filter} requests found.`}
                  </p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </h3>
                          <p className="text-sm text-gray-600">{request.days} day{request.days > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">{request.reason}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      <span>Requested: {new Date(request.requestedDate).toLocaleDateString()}</span>
                      {request.status === 'approved' && request.approvedDate && (
                        <span className="text-green-600">
                          Approved: {new Date(request.approvedDate).toLocaleDateString()}
                          {request.approvedBy && ` by ${request.approvedBy}`}
                        </span>
                      )}
                      {request.status === 'rejected' && request.rejectedDate && (
                        <span className="text-red-600">
                          Rejected: {new Date(request.rejectedDate).toLocaleDateString()}
                          {request.rejectedBy && ` by ${request.rejectedBy}`}
                        </span>
                      )}
                    </div>
                    
                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-emerald-600 to-teal-700 border-t border-emerald-500/30 px-4 sm:px-6 py-6 mt-12 relative z-10">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-white">
                &copy; {new Date().getFullYear()} KLAC Management Portal. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-emerald-100">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/support" className="hover:text-white">Support</a>
            </div>
          </div>
        </footer>

        {/* New Leave Request Form Modal */}
        {showNewLeaveForm && <LeaveRequestForm onClose={() => setShowNewLeaveForm(false)} onSuccess={() => {
          setShowNewLeaveForm(false);
          // Refresh the leave requests
          window.location.reload();
        }} />}
      </div>
    );
  }

  // Admin/MD View with Sidebar
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
              <button
                onClick={() => router.back()}
                className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-all mr-2"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
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

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.color} rounded-xl flex items-center justify-center`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{typeInfo.name}</h1>
                <p className="text-gray-600">Leave history and requests</p>
              </div>
            </div>

            {/* Summary Cards */}
            {employee && leaveType !== 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-emerald-600">
                    {leaveType === 'annual-leave' ? employee.annualLeaveTaken :
                     leaveType === 'fr-leave' ? employee.frLeaveTaken :
                     employee.sickLeaveTaken}
                  </div>
                  <div className="text-sm text-gray-600">Days Used</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-teal-600">
                    {leaveType === 'annual-leave' ? employee.annualLeaveBalance - employee.annualLeaveTaken :
                     leaveType === 'fr-leave' ? employee.frLeaveBalance - employee.frLeaveTaken :
                     employee.sickLeaveBalance - employee.sickLeaveTaken}
                  </div>
                  <div className="text-sm text-gray-600">Days Remaining</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Pending Requests</div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-600" />
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Requests</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowNewLeaveForm(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Request Leave
                </button>
              </div>
            </div>

            {/* Leave Requests */}
            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Leave Requests</h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? 'No leave requests found.' : `No ${filter} requests found.`}
                  </p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <div key={request.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </h3>
                          <p className="text-sm text-gray-600">{request.days} day{request.days > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">{request.reason}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      <span>Requested: {new Date(request.requestedDate).toLocaleDateString()}</span>
                      {request.status === 'approved' && request.approvedDate && (
                        <span className="text-green-600">
                          Approved: {new Date(request.approvedDate).toLocaleDateString()}
                          {request.approvedBy && ` by ${request.approvedBy}`}
                        </span>
                      )}
                      {request.status === 'rejected' && request.rejectedDate && (
                        <span className="text-red-600">
                          Rejected: {new Date(request.rejectedDate).toLocaleDateString()}
                          {request.rejectedBy && ` by ${request.rejectedBy}`}
                        </span>
                      )}
                    </div>
                    
                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
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
                &copy; {new Date().getFullYear()} KLAC Management Portal. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-emerald-100">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/support" className="hover:text-white">Support</a>
            </div>
          </div>
        </footer>

        {/* New Leave Request Form Modal */}
        {showNewLeaveForm && <LeaveRequestForm onClose={() => setShowNewLeaveForm(false)} onSuccess={() => {
          setShowNewLeaveForm(false);
          // Refresh the leave requests
          window.location.reload();
        }} />}
      </div>
    </div>
  );
}

// Leave Request Form Component
function LeaveRequestForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    from: '',
    to: '',
    reason: '',
    replacement: '',
    emergencyContact: '',
    attachmentUrl: '',
    doctorCertificate: '',
    isHalfDay: false,
    halfDayPeriod: 'morning' as 'morning' | 'afternoon',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        employeeId: session?.user?.id,
        employeeName: session?.user?.name,
        leaveType: formData.leaveType,
        from: new Date(formData.from).toISOString(),
        to: new Date(formData.to).toISOString(),
        reason: formData.reason,
        replacement: formData.replacement || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        attachmentUrl: formData.attachmentUrl || undefined,
        doctorCertificate: formData.doctorCertificate || undefined,
        isHalfDay: formData.isHalfDay,
        halfDayPeriod: formData.isHalfDay ? formData.halfDayPeriod : undefined,
        priority: formData.priority
      };

      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to submit leave request');
      }
    } catch (error) {
      setError('An error occurred while submitting the request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Calculate days between dates
  const calculateDays = () => {
    if (formData.from && formData.to) {
      const startDate = new Date(formData.from);
      const endDate = new Date(formData.to);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      return formData.isHalfDay ? 0.5 : dayDiff;
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Request New Leave</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select 
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            >
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="nopay">No Pay Leave</option>
              <option value="fr">FR Leave</option>
            </select>
          </div>

          {/* Half Day Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isHalfDay"
              id="isHalfDay"
              checked={formData.isHalfDay}
              onChange={handleChange}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isHalfDay" className="text-sm font-medium text-gray-700">
              Half Day Leave
            </label>
          </div>

          {/* Half Day Period - only show if half day is selected */}
          {formData.isHalfDay && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Half Day Period <span className="text-red-500">*</span>
              </label>
              <select 
                name="halfDayPeriod"
                value={formData.halfDayPeriod}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required={formData.isHalfDay}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="from"
                value={formData.from}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="to"
                value={formData.to}
                onChange={handleChange}
                min={formData.from}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Days Calculation Display */}
          {formData.from && formData.to && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm text-emerald-700">
                <strong>Total Days:</strong> {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select 
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              placeholder="Please provide a reason for your leave request..."
              required
            ></textarea>
          </div>

          {/* Replacement */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Replacement (Optional)</label>
            <input 
              type="text" 
              name="replacement"
              value={formData.replacement}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Who will cover your responsibilities?"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact (Optional)</label>
            <input 
              type="text" 
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Emergency contact details"
            />
          </div>

          {/* Doctor Certificate URL - only show for sick leave */}
          {formData.leaveType === 'sick' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Certificate URL (Optional)</label>
              <input 
                type="url" 
                name="doctorCertificate"
                value={formData.doctorCertificate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://example.com/certificate.pdf"
              />
            </div>
          )}

          {/* General Attachment URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachment URL (Optional)</label>
            <input 
              type="url" 
              name="attachmentUrl"
              value={formData.attachmentUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="https://example.com/attachment.pdf"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.from || !formData.to || !formData.reason}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}