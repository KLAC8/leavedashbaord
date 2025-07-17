'use client';

import { useEffect, useState } from 'react';
import { Input } from './input';
import { Button } from './button';

interface Employee {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminEmployeeCrud() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Form state
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [page]);

  async function fetchEmployees() {
    setLoading(true);
    const res = await fetch(`/api/employees?page=${page}&limit=10`);
    const data = await res.json();
    setEmployees(data.employees);
    setTotal(data.total);
    setLoading(false);
  }

  function resetForm() {
    setForm({ name: '', email: '', password: '', role: 'employee' });
    setEditingId(null);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || (editingId === null && !form.password)) {
      setError('Please fill all required fields');
      return;
    }

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/employees/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      resetForm();
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleEdit(emp: Employee) {
    setForm({ name: emp.name, email: emp.email, password: '', role: emp.role });
    setEditingId(emp._id);
    setError('');
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    fetchEmployees();
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-xl font-semibold">Manage Employees</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        {error && <p className="text-red-600">{error}</p>}
        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Input
          type="password"
          placeholder={editingId ? 'Leave blank to keep current password' : 'Password'}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          {...(!editingId && { required: true })}
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full border p-2 rounded"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
          <option value="md">MD</option>
        </select>

        <div className="flex gap-2">
          <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded border bg-white shadow">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center">No employees found</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{emp.name}</td>
                  <td className="p-2">{emp.email}</td>
                  <td className="p-2 capitalize">{emp.role}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls (simple) */}
      <div className="flex justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page * 10 >= total}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
