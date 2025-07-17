// components/ui/UserTable.tsx
'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'md' | 'employee';
  createdAt: string;
}

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'createdAt' | 'role'>('createdAt');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  async function fetchUsers() {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function deleteUser(id: string) {
    await fetch(`/api/users/${id}`, { method: 'DELETE' });
    setUsers(users.filter((u) => u._id !== id));
    setConfirmId(null);
  }

  async function updateRole(id: string, role: string) {
    await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  }

  const filtered = users
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.role.localeCompare(b.role);
    });

  return (
    <div className="mt-6 space-y-2">
      <div className="flex gap-2 mb-2">
        <input
          placeholder="Search name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as any)} className="border px-3 py-2 rounded">
          <option value="createdAt">Sort by Date</option>
          <option value="role">Sort by Role</option>
        </select>
      </div>

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user._id} className="border-t">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">
                <select
                  value={user.role}
                  onChange={(e) => updateRole(user._id, e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="employee">Employee</option>
                  <option value="md">MD</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="p-2 text-center">
                <Button onClick={() => setConfirmId(user._id)} className="bg-red-500 hover:bg-red-600">
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirm Delete Modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this user?</h2>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setConfirmId(null)} className="bg-gray-300 text-black">
                Cancel
              </Button>
              <Button onClick={() => deleteUser(confirmId)} className="bg-red-600 hover:bg-red-700">
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
