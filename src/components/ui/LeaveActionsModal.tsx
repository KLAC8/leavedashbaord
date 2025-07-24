// components/leave/LeaveActionsModal.tsx
'use client';

import { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock3,
  CalendarDays,
  Download,
  FileText,
  AlertTriangle
} from 'lucide-react';

import { LeaveRequest } from '@/types/leave';

// Define a proper type for comments

interface LeaveActionsModalProps {
  leave: LeaveRequest;
  onClose: () => void;
  onUpdate: () => void;
  userRole?: string;
}

// View Leave Details Modal
export function ViewLeaveModal({ leave, onClose }: LeaveActionsModalProps) {
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

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/leaves/${leave.id}/download`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leave-request-${leave.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download leave request');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-800">Leave Request Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                title="Download PDF"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(leave.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(leave.status)}`}>
              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
            </span>
            {leave.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(leave.priority)}`}>
                {leave.priority.toUpperCase()} PRIORITY
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="font-semibold text-emerald-800">{leave.employeeName || 'N/A'}</div>
                <div className="text-sm text-emerald-600">Employee</div>
              </div>
            </div>
          </div>

          {/* Leave Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Leave Information
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Leave Type</label>
                  <div className="text-gray-800 font-semibold">
                    {leave.type?.replace('-', ' ').toUpperCase()}
                    {leave.isHalfDay && (
                      <span className="ml-2 text-sm text-blue-600">
                        (Half Day - {leave.halfDayPeriod})
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <div className="text-gray-800 font-semibold">
                    {leave.days} day{leave.days > 1 ? 's' : ''}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Leave Period</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Requested On</label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{new Date(leave.requestedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Additional Details
              </h3>
              
              <div className="space-y-3">
                {leave.replacement && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Replacement</label>
                    <div className="text-gray-800">{leave.replacement}</div>
                  </div>
                )}

                {leave.emergencyContact && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                    <div className="text-gray-800">{leave.emergencyContact}</div>
                  </div>
                )}

                {leave.attachmentUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Supporting Document</label>
                    <a 
                      href={leave.attachmentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      View Document
                    </a>
                  </div>
                )}

                {leave.doctorCertificate && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Medical Certificate</label>
                    <a 
                      href={leave.doctorCertificate} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      View Certificate
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
              Reason for Leave
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{leave.reason}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3">
              Request Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="font-medium text-blue-800">Request Submitted</div>
                  <div className="text-sm text-blue-600">
                    {new Date(leave.requestedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {leave.status === 'approved' && leave.approvedDate && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-green-800">Request Approved</div>
                    <div className="text-sm text-green-600">
                      {new Date(leave.approvedDate).toLocaleDateString()}
                      {leave.approvedBy && ` by ${leave.approvedBy}`}
                    </div>
                  </div>
                </div>
              )}

              {leave.status === 'rejected' && leave.rejectedDate && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <div className="font-medium text-red-800">Request Rejected</div>
                    <div className="text-sm text-red-600">
                      {new Date(leave.rejectedDate).toLocaleDateString()}
                      {leave.rejectedBy && ` by ${leave.rejectedBy}`}
                    </div>
                    {leave.rejectionReason && (
                      <div className="text-sm text-red-700 mt-1 p-2 bg-red-100 rounded">
                        {leave.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          {leave.comments && leave.comments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({leave.comments.length})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {leave.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {comment.userId?.name || 'User'}
                        </span>
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                          {comment.role || 'Employee'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Leave Modal
export function EditLeaveModal({ leave, onClose, onUpdate }: LeaveActionsModalProps) {
  const [formData, setFormData] = useState({
    leaveType: leave.type?.replace('-leave', '') || 'annual',
    from: leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '',
    to: leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '',
    reason: leave.reason || '',
    replacement: leave.replacement || '',
    emergencyContact: leave.emergencyContact || '',
    isHalfDay: leave.isHalfDay || false,
    halfDayPeriod: leave.halfDayPeriod || 'morning',
    priority: leave.priority || 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/leaves/${leave.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: 'update',
          leaveType: formData.leaveType,
          from: formData.from,
          to: formData.to,
          reason: formData.reason,
          replacement: formData.replacement,
          emergencyContact: formData.emergencyContact,
          isHalfDay: formData.isHalfDay,
          halfDayPeriod: formData.halfDayPeriod,
          priority: formData.priority
        })
      });

      const data = await response.json();

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        setError(data.error || 'Failed to update leave request');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('An error occurred while updating the request');
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Leave Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select 
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
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
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              name="isHalfDay"
              id="editIsHalfDay"
              checked={formData.isHalfDay}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="editIsHalfDay" className="text-sm font-medium text-gray-700">
              This is a half-day leave request
            </label>
          </div>

          {/* Half Day Period */}
          {formData.isHalfDay && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Half Day Period <span className="text-red-500">*</span>
              </label>
              <select 
                name="halfDayPeriod"
                value={formData.halfDayPeriod}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                required={formData.isHalfDay}
              >
                <option value="morning">Morning (First Half)</option>
                <option value="afternoon">Afternoon (Second Half)</option>
              </select>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="from"
                value={formData.from}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                name="to"
                value={formData.to}
                onChange={handleChange}
                min={formData.from}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Days Calculation Display */}
          {formData.from && formData.to && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700">
                  Total Leave Duration: {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level</label>
            <select 
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Leave <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Please provide a detailed reason for your leave request..."
              required
            ></textarea>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Replacement/Coverage <span className="text-gray-400">(Optional)</span>
              </label>
              <input 
                type="text" 
                name="replacement"
                value={formData.replacement}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Who will cover your responsibilities?"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Emergency Contact <span className="text-gray-400">(Optional)</span>
              </label>
              <input 
                type="text" 
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Emergency contact details"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.from || !formData.to || !formData.reason}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                'Update Leave Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
export function DeleteLeaveModal({ leave, onClose, onUpdate }: LeaveActionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/leaves/${leave.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        onUpdate();
        onClose();
      } else {
        setError(data.error || 'Failed to delete leave request');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('An error occurred while deleting the request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Delete Leave Request</h2>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Leave Request Details:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Type:</span> {leave.type?.replace('-', ' ').toUpperCase()}</p>
            <p><span className="font-medium">Period:</span> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Duration:</span> {leave.days} day{leave.days > 1 ? 's' : ''}</p>
            <p><span className="font-medium">Status:</span> {leave.status.toUpperCase()}</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this leave request? This will permanently remove it from the system.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </div>
            ) : (
              'Delete Request'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Download Leave Reports Component
export function DownloadReportsModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    format: 'pdf',
    dateRange: 'all',
    status: 'all',
    leaveType: 'all',
    fromDate: '',
    toDate: ''
  });

  const handleDownload = async () => {
    setLoading(true);
    
    try {
      const queryParams = new URLSearchParams({
        format: filters.format,
        dateRange: filters.dateRange,
        status: filters.status,
        leaveType: filters.leaveType,
        ...(filters.dateRange === 'custom' && {
          fromDate: filters.fromDate,
          toDate: filters.toDate
        })
      });

      const response = await fetch(`/api/leaves/download?${queryParams}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leave-report-${new Date().toISOString().split('T')[0]}.${filters.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        onClose();
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Download Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <select
              name="format"
              value={filters.format}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Time</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleFilterChange}
                  min={filters.fromDate}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Leave Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
            <select
              name="leaveType"
              value={filters.leaveType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
              <option value="nopay">No Pay Leave</option>
              <option value="fr">FR Leave</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || (filters.dateRange === 'custom' && (!filters.fromDate || !filters.toDate))}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}