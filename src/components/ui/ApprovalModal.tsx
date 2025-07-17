'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Button } from './button';

export default function ApprovalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  function openModal(id: string) {
    setRequestId(id);
    setIsOpen(true);
  }

  async function handleApproval(action: 'approved' | 'rejected') {
    if (!requestId) return;
    await fetch(`/api/leave/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: action }),
      headers: { 'Content-Type': 'application/json' },
    });
    alert(`Request ${action}`);
    setIsOpen(false);
  }

  // Expose `openModal()` globally for demo
  if (typeof window !== 'undefined') {
    (window as any).openApprovalModal = openModal;
  }

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white p-6 rounded-lg shadow max-w-sm w-full">
          <Dialog.Title className="text-lg font-bold mb-4">Approve or Reject Leave</Dialog.Title>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={() => handleApproval('rejected')} variant="destructive">Reject</Button>
            <Button onClick={() => handleApproval('approved')} className="bg-green-600 hover:bg-green-700">Approve</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
