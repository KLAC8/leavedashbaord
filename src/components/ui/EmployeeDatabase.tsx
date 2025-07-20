'use client';

import { useEffect, useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Download, PlusCircle, Trash2, Edit, Loader2, ChevronLeft, ChevronRight, Eye, Search, Users } from 'lucide-react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import EmployeeModal from './EmployeeEditModal';
import CreateEmployeeForm from './CreateEmployeeForm';
import EmployeeViewModal from './EmployeeViewModal';

interface Employee {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  joinedDate: string;
  role: string;
  designation?: string;
  annualLeaveBalance?: number;
  annualLeaveTaken?: number;
  frLeaveBalance?: number;
  frLeaveTaken?: number;
  sickLeaveBalance?: number;
  sickLeaveTaken?: number;
  grossSalary?: number;
  imageUrl?: string;
}

export default function EmployeeDatabase() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchEmployees(page);
  }, [page]);

  async function fetchEmployees(pageNumber: number) {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      const res = await fetch(`/api/employees?page=${pageNumber}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      setEmployees(data.employees || []);
      setTotalEmployees(data.total || 0);
    } catch (error) {
      alert('Failed to fetch employees');
      console.error(error)
    } finally {
      setLoading(false);
    }
  }

  function filteredEmployees() {
    const loweredSearch = search.toLowerCase();
    return employees.filter(emp =>
      (emp.name?.toLowerCase() ?? '').includes(loweredSearch) ||
      (emp.email?.toLowerCase() ?? '').includes(loweredSearch) ||
      (emp.employeeId ?? '').includes(search)
    );
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      fetchEmployees(page);
    } catch {
      alert('Failed to delete employee');
    }
  }

  function exportCSV() {
    const headers = ['Employee ID', 'Name', 'Email', 'Designation', 'Join Date'];
    const rows = filteredEmployees().map(emp => [
      emp.employeeId,
      emp.name,
      emp.email,
      emp.designation ?? '',
      emp.joinedDate,
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    saveAs(blob, 'employees.csv');
  }

  function exportPDF() {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Employee ID', 'Name', 'Email', 'Designation', 'Join Date']],
      body: filteredEmployees().map(emp => [
        emp.employeeId,
        emp.name,
        emp.email,
        emp.designation ?? '',
        emp.joinedDate,
      ]),
    });
    doc.save('employees.pdf');
  }

  function openEditModal(emp: Employee) {
    setEditingEmployee(emp);
    setIsEditModalOpen(true);
  }

  async function openViewModal(emp: Employee) {
    setViewEmployee(emp);
    setIsViewModalOpen(true);
  }

  function closeViewModal() {
    setViewEmployee(null);
    setIsViewModalOpen(false);
  }

  function handleEmployeeSave(updatedEmployee: Employee) {
    setEmployees((prev) =>
      prev.map((emp) => (emp._id === updatedEmployee._id ? updatedEmployee : emp))
    );
    if (viewEmployee?._id === updatedEmployee._id) {
      setViewEmployee(updatedEmployee);
    }
    setIsEditModalOpen(false);
    setIsViewModalOpen(true);
    setEditingEmployee(null);
  }

  function handleCreateSuccess() {
    setIsCreateModalOpen(false);
    fetchEmployees(page);
  }

  const totalPages = Math.ceil(totalEmployees / PAGE_SIZE);

  const goToPrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-600/90 rounded-xl shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Management
            </h1>
          </div>
          <p className="text-gray-600 font-medium">
            Manage your team with ease • {totalEmployees} employees
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-emerald-600/10 to-emerald-500/5 border-b border-emerald-200/50 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Employee Records</h2>
                <p className="text-gray-600 text-sm">
                  {filteredEmployees().length} of {totalEmployees} employees
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={exportCSV} 
                  disabled={loading} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 transition-all duration-200"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
                <Button 
                  onClick={exportPDF} 
                  disabled={loading}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 transition-all duration-200"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)} 
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all duration-200"
                  size="sm"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Employee
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20 bg-white"
                  disabled={loading}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => fetchEmployees(page)} 
                disabled={loading}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 min-w-[120px]"
              >
                {loading ? (
                  <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...</>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[768px] text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Employee ID</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 hidden sm:table-cell">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 hidden md:table-cell">Designation</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-700 hidden lg:table-cell">Join Date</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees().map((emp, index) => (
                    <tr 
                      key={emp._id} 
                      className={`transition-all duration-200 hover:bg-emerald-50/50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">
                              {emp.name?.charAt(0)?.toUpperCase() || 'E'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{emp.employeeId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{emp.name}</div>
                        <div className="text-sm text-gray-500 sm:hidden">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 hidden sm:table-cell">{emp.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {emp.designation || 'Not Set'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 hidden lg:table-cell">
                        {new Date(emp.joinedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openViewModal(emp)}
                            className="border-gray-300 text-gray-600 hover:bg-gray-50 p-2"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openEditModal(emp)}
                            className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 p-2"
                            title="Edit Employee"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDelete(emp._id)}
                            className="border-red-300 text-red-600 hover:bg-red-50 p-2"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredEmployees().length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No employees found</h3>
                          <p className="text-gray-500">
                            {search ? 'Try adjusting your search criteria' : 'Get started by adding your first employee'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-t border-emerald-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={goToPrevPage} 
                  disabled={page === 1}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button 
                  variant="outline" 
                  onClick={goToNextPage} 
                  disabled={page === totalPages}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-emerald-700">
                <span className="font-medium">
                  Page {page} of {totalPages}
                </span>
                <span className="text-emerald-600">
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalEmployees)} to {Math.min(page * PAGE_SIZE, totalEmployees)} of {totalEmployees} results
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmployeeModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={editingEmployee}
        onSave={handleEmployeeSave}
      />

      <CreateEmployeeForm
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSuccess}
      />

      <EmployeeViewModal
        open={isViewModalOpen}
        onClose={closeViewModal}
        employeeId={viewEmployee?._id ?? null}
        employee={viewEmployee}
      />
    </div>
  );
}