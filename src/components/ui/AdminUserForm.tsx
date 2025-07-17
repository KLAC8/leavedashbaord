'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminUserForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    const res = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      setMsg('User created successfully.');
      setForm({ name: '', email: '', password: '', role: 'employee' });
    } else {
      const { error } = await res.json();
      setMsg(error || 'Error creating user');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow mt-8">
      <h2 className="text-lg font-semibold">Add New User</h2>
      {msg && <p className="text-sm text-green-600">{msg}</p>}
      <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="w-full border p-2 rounded"
      >
        <option value="employee">Employee</option>
        <option value="md">Managing Director</option>
        <option value="admin">Admin</option>
      </select>
      <Button type="submit">Create User</Button>
    </form>
  );
}
