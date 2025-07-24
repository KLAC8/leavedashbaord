'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/ui/Sidebar';
import { ViewLeaveModal, EditLeaveModal, DeleteLeaveModal, DownloadReportsModal } from '@/components/ui/LeaveActionsModal';
import { 
  Calendar, 
  Clock, 
  Heart,
  ArrowLeft,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  Clock3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Building2,
  Eye,
  Edit,
  Trash2,
  Search,
  Download,
  CalendarDays,
} from 'lucide-react';

import { LeaveRequest } from '@/types/leave';
import { LeaveRequestForm } from '@/components/LeaveDetailsPage/LeaveRequestForm';
import { LeaveDetailsModal } from '@/components/LeaveDetailsPage/LeaveDetailsModal';

interface Employee {
  annualLeaveBalance: number;
  annualLeaveTaken: number;
  frLeaveBalance: number;
  frLeaveTaken: number;
  sickLeaveBalance: number;
  sickLeaveTaken: number;
}


// Define filter types
type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export default function LeaveDetails() {
  const { data: session, status } = useSession();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNewLeaveForm, setShowNewLeaveForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const leaveType = searchParams.get('type') || 'all';
  
  const ITEMS_PER_PAGE = 10;

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
      } catch (fetchError) {
        console.error('Failed to fetch data', fetchError);
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
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock3 className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock3 className="w-4 h-4 text-gray-600" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and search logic
  const filteredRequests = leaveRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         new Date(request.startDate).toLocaleDateString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

 const handleViewLeave = (leave: LeaveRequest) => {
  setSelectedLeave(leave);
  setShowViewModal(true);
};

const handleEditLeave = (leave: LeaveRequest) => {
  setSelectedLeave(leave);
  setShowEditModal(true);
};

const handleDeleteLeave = (leave: LeaveRequest) => {
  setSelectedLeave(leave);
  setShowDeleteModal(true);
};

const handleDownloadReports = () => {
  setShowDownloadModal(true);
};

const refreshData = async () => {
  try {
    setLoading(true);
    
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
  } catch (fetchError) {
    console.error('Failed to fetch data', fetchError);
  } finally {
    setLoading(false);
  }
};

  const typeInfo = getLeaveTypeInfo(leaveType);
  const IconComponent = typeInfo.icon;

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-16 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
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
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{typeInfo.name}</h1>
                  <p className="text-gray-600">Manage your leave requests and history</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewLeaveForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Request Leave</span>
              </button>
            </div>

            {/* Summary Cards */}
            {employee && leaveType !== 'all' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {leaveType === 'annual-leave' ? employee.annualLeaveTaken :
                       leaveType === 'fr-leave' ? employee.frLeaveTaken :
                       employee.sickLeaveTaken}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Days Used</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-teal-600">
                      {leaveType === 'annual-leave' ? employee.annualLeaveBalance - employee.annualLeaveTaken :
                       leaveType === 'fr-leave' ? employee.frLeaveBalance - employee.frLeaveTaken :
                       employee.sickLeaveBalance - employee.sickLeaveTaken}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Days Remaining</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock3 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {filteredRequests.filter(r => r.status === 'pending').length}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Pending Requests</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredRequests.length}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Requests</div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by reason, type, or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterType)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleDownloadReports}
                    className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                    title="Download Reports"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Leave Requests Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
              {/* Mobile View */}
              <div className="block sm:hidden">
                {paginatedRequests.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Leave Requests</h3>
                    <p className="text-gray-600">
                      {filter === 'all' ? 'No leave requests found.' : `No ${filter} requests found.`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {paginatedRequests.map((request) => (
                      <div key={request.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewLeave(request)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-800">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {request.days} day{request.days > 1 ? 's' : ''} • {request.type?.replace('-', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {request.reason}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Leave Period
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Leave Requests</h3>
                          <p className="text-gray-600">
                            {filter === 'all' ? 'No leave requests found.' : `No ${filter} requests found.`}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(request.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {new Date(request.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">
                              {request.type?.replace('-', ' ').toUpperCase()}
                            </span>
                            {request.isHalfDay && (
                              <div className="text-xs text-blue-600">
                                Half Day ({request.halfDayPeriod})
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              {request.days}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs truncate" title={request.reason}>
                              {request.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority || 'medium')}`}>
                              {(request.priority || 'medium').charAt(0).toUpperCase() + (request.priority || 'medium').slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.requestedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewLeave(request)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleEditLeave(request)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLeave(request)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                             )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-emerald-600 text-white'
                                : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
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
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </footer>

        {/* New Leave Request Form Modal */}
        {showNewLeaveForm && <LeaveRequestForm onClose={() => setShowNewLeaveForm(false)} onSuccess={() => {
          setShowNewLeaveForm(false);
          // Refresh the leave requests
          window.location.reload();
        }} />}

        {/* Leave Details Modal */}
        {showLeaveModal && selectedLeave && (
          <LeaveDetailsModal 
            leave={selectedLeave} 
            onClose={() => {
              setShowLeaveModal(false);
              setSelectedLeave(null);
            }} 
          />
        )}
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${typeInfo.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{typeInfo.name}</h1>
                  <p className="text-gray-600">Manage leave requests and history</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewLeaveForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span className="font-semibold">Request Leave</span>
              </button>
            </div>

            {/* Summary Cards */}
            {employee && leaveType !== 'all' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {leaveType === 'annual-leave' ? employee.annualLeaveTaken :
                       leaveType === 'fr-leave' ? employee.frLeaveTaken :
                       employee.sickLeaveTaken}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Days Used</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-teal-600">
                      {leaveType === 'annual-leave' ? employee.annualLeaveBalance - employee.annualLeaveTaken :
                       leaveType === 'fr-leave' ? employee.frLeaveBalance - employee.frLeaveTaken :
                       employee.sickLeaveBalance - employee.sickLeaveTaken}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Days Remaining</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock3 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {filteredRequests.filter(r => r.status === 'pending').length}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Pending Requests</div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {filteredRequests.length}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600">Total Requests</div>
                </div>
              </div>
            )}

            {/* Filters and Search */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 shadow-lg mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by reason, type, or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-0 focus:outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <select 
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as FilterType)}
                      className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Leave Requests Table */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-hidden">
              {/* Mobile View */}
              <div className="block sm:hidden">
                {paginatedRequests.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Leave Requests</h3>
                    <p className="text-gray-600">
                      {filter === 'all' ? 'No leave requests found.' : `No ${filter} requests found.`}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {paginatedRequests.map((request) => (
                      <div key={request.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(request.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleViewLeave(request)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="font-semibold text-gray-800">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            {request.days} day{request.days > 1 ? 's' : ''} • {request.type?.replace('-', ' ').toUpperCase()}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {request.reason}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Leave Period
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Days
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRequests.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Leave Requests</h3>
                          <p className="text-gray-600">
                            {filter === 'all' ? 'No leave requests found.' : `No ${filter} requests found.`}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(request.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(request.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {new Date(request.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-700">
                              {request.type?.replace('-', ' ').toUpperCase()}
                            </span>
                            {request.isHalfDay && (
                              <div className="text-xs text-blue-600">
                                Half Day ({request.halfDayPeriod})
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">
                              {request.days}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs truncate" title={request.reason}>
                              {request.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority || 'medium')}`}>
                              {(request.priority || 'medium').charAt(0).toUpperCase() + (request.priority || 'medium').slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(request.requestedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewLeave(request)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {request.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleEditLeave(request)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLeave(request)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length} results
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-emerald-600 text-white'
                                : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
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
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </footer>

        {/* New Leave Request Form Modal */}
        {showNewLeaveForm && <LeaveRequestForm onClose={() => setShowNewLeaveForm(false)} onSuccess={() => {
          setShowNewLeaveForm(false);
          // Refresh the leave requests
          window.location.reload();
        }} />}

        {/* Leave Details Modal */}
        {/* View Leave Modal */}
{showViewModal && selectedLeave && (
  <ViewLeaveModal 
    leave={selectedLeave} 
    onClose={() => {
      setShowViewModal(false);
      setSelectedLeave(null);
    }}
    onUpdate={refreshData}
    userRole={session?.user?.role}
  />
)}

{/* Edit Leave Modal */}
{showEditModal && selectedLeave && (
  <EditLeaveModal 
    leave={selectedLeave} 
    onClose={() => {
      setShowEditModal(false);
      setSelectedLeave(null);
    }}
    onUpdate={refreshData}
    userRole={session?.user?.role}
  />
)}

{/* Delete Leave Modal */}
{showDeleteModal && selectedLeave && (
  <DeleteLeaveModal 
    leave={selectedLeave} 
    onClose={() => {
      setShowDeleteModal(false);
      setSelectedLeave(null);
    }}
    onUpdate={refreshData}
    userRole={session?.user?.role}
  />
)}

{/* Download Reports Modal */}
{showDownloadModal && (
  <DownloadReportsModal 
    onClose={() => setShowDownloadModal(false)}
  />
)}
      </div>
    </div>
  );
}



