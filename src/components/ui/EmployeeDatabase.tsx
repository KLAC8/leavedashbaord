'use client';

import { useEffect, useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Download, PlusCircle, Trash2, Edit, Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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
    <div className="space-y-6 bg-white p-6 rounded-xl shadow border">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-semibold">Employee Records</h2>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={exportCSV} disabled={loading} variant="outline">
            <Download className="mr-2 h-4 w-4" /> CSV
          </Button>
          <Button onClick={exportPDF} disabled={loading} variant="outline">
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} disabled={loading}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search name, email, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px]"
          disabled={loading}
        />
        <Button variant="ghost" onClick={() => fetchEmployees(page)} disabled={loading}>
          {loading ? (
            <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading...</>
          ) : 'Refresh'}
        </Button>
      </div>

      <div className="w-full overflow-auto rounded-lg border mt-2">
        <table className="w-full min-w-[768px] text-sm text-gray-700">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Designation</th>
              <th className="px-4 py-2 text-left">Join Date</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees().map((emp) => (
              <tr key={emp._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">{emp.employeeId}</td>
                <td className="px-4 py-2 whitespace-nowrap">{emp.name}</td>
                <td className="px-4 py-2 whitespace-nowrap">{emp.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{emp.designation ?? '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(emp.joinedDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <Button size="sm" variant="outline" onClick={() => openViewModal(emp)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditModal(emp)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(emp._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredEmployees().length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No matching employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button variant="outline" onClick={goToPrevPage} disabled={page === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
        <Button variant="outline" onClick={goToNextPage} disabled={page === totalPages}>
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

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
