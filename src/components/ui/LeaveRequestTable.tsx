'use client';

import React, { useEffect, useState } from 'react';

interface LeaveRequest {
  _id: string;
  employeeName: string;
  leaveType: string;
  from: string;
  to: string;
  reason: string;
  replacement?: string;
  emergencyContact?: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string[]; // Optional comments array
}

interface LeaveRequestTableProps {
  role?: string;
  withExport?: boolean;
  withPagination?: boolean;
  withFilters?: boolean;
  withComments?: boolean;
}

export default function LeaveRequestTable({
  withExport = false,
  withPagination = false,
  withFilters = false,
  withComments = false,
}: LeaveRequestTableProps) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination state (if enabled)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter state (if enabled)
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Fetch leave requests (simple fetch, modify for pagination/filter)
  useEffect(() => {
    async function fetchLeaveRequests() {
      setLoading(true);
      let url = '/api/leave';
      const params = new URLSearchParams();
      if (withPagination) {
        params.append('page', page.toString());
        params.append('limit', pageSize.toString());
      }
      if (withFilters && filterStatus) {
        params.append('status', filterStatus);
      }
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaveRequests(data.leaveRequests || []);
      } else {
        setLeaveRequests([]);
      }
      setLoading(false);
    }
    fetchLeaveRequests();
  }, [page, filterStatus, withPagination, withFilters]);

  if (loading) return <p>Loading leave requests...</p>;
  if (leaveRequests.length === 0) return <p>No leave requests found.</p>;

  return (
    <div>
      {withFilters && (
        <div className="mb-4">
          <label htmlFor="statusFilter" className="mr-2 font-semibold">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="border rounded p-1"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Employee</th>
            <th className="border border-gray-300 p-2">Leave Type</th>
            <th className="border border-gray-300 p-2">From</th>
            <th className="border border-gray-300 p-2">To</th>
            <th className="border border-gray-300 p-2">Replacement</th>
            <th className="border border-gray-300 p-2">Emergency Contact</th>
            <th className="border border-gray-300 p-2">Attachment</th>
            <th className="border border-gray-300 p-2">Status</th>
            {withComments && <th className="border border-gray-300 p-2">Comments</th>}
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((req) => (
            <tr key={req._id}>
              <td className="border border-gray-300 p-2">{req.employeeName}</td>
              <td className="border border-gray-300 p-2 capitalize">{req.leaveType}</td>
              <td className="border border-gray-300 p-2">{new Date(req.from).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2">{new Date(req.to).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2">{req.replacement || '-'}</td>
              <td className="border border-gray-300 p-2">{req.emergencyContact || '-'}</td>
              <td className="border border-gray-300 p-2">
                {req.attachmentUrl ? (
                  <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td className="border border-gray-300 p-2 capitalize">{req.status}</td>
              {withComments && (
                <td className="border border-gray-300 p-2">
                  {req.comments && req.comments.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {req.comments.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  ) : (
                    '-'
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {withPagination && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      )}

      {withExport && (
        <div className="mt-4">
          <button
            onClick={() => {
              // Simple CSV export example
              const headers = [
                'Employee',
                'Leave Type',
                'From',
                'To',
                'Replacement',
                'Emergency Contact',
                'Status',
              ];
              const rows = leaveRequests.map((req) => [
                req.employeeName,
                req.leaveType,
                new Date(req.from).toLocaleDateString(),
                new Date(req.to).toLocaleDateString(),
                req.replacement || '-',
                req.emergencyContact || '-',
                req.status,
              ]);

              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [headers, ...rows].map((e) => e.join(',')).join('\n');

              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', 'leave_requests.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
}
