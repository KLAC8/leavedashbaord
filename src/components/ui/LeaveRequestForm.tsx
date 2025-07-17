'use client';

import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

export default function LeaveRequestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

    const fromDate = new Date(formData.get('from') as string);
    const toDate = new Date(formData.get('to') as string);
    if (toDate < fromDate) {
      setError('End date cannot be earlier than start date');
      return;
    }

    setLoading(true);
    setError('');

    const res = await fetch('/api/leave', {
      method: 'POST',
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      alert('Leave request submitted');
      form.reset();
    } else {
      const result = await res.json();
      setError(result.error || 'Failed to submit leave request');
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 max-w-xl bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold">Submit Leave Request</h2>

      {error && <p className="text-red-600">{error}</p>}

      <div>
        <label className="block font-medium text-sm text-gray-700">Name</label>
        <Input name="employeeName" defaultValue={session?.user?.name || ''} readOnly className="bg-gray-100" />
      </div>

      <div>
        <label className="block font-medium text-sm text-gray-700">Leave Type</label>
        <select
          name="leaveType"
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">-- Select --</option>
          <option value="annual">Annual Leave</option>
          <option value="fr">FR Leave</option>
        </select>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium text-sm text-gray-700">From</label>
          <Input type="date" name="from" required />
        </div>
        <div className="flex-1">
          <label className="block font-medium text-sm text-gray-700">To</label>
          <Input type="date" name="to" required />
        </div>
      </div>

      <div>
        <label className="block font-medium text-sm text-gray-700">Reason</label>
        <Textarea name="reason" placeholder="Reason for leave" required />
      </div>

      <div>
        <label className="block font-medium text-sm text-gray-700">Replacement Person (Optional)</label>
        <Input name="replacement" placeholder="Name of person covering you" />
      </div>

      <div>
        <label className="block font-medium text-sm text-gray-700">Emergency Contact (Optional)</label>
        <Input name="emergencyContact" placeholder="Phone number" />
      </div>

      <div>
        <label className="block font-medium text-sm text-gray-700">Attachment (Optional)</label>
        <Input type="file" name="file" />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Leave Request'}
      </Button>
    </form>
  );
}
