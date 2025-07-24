"use client"
import { CalendarDays, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

// Define types for the form component
interface LeaveRequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

type LeaveType = 'annual' | 'sick' | 'maternity' | 'paternity' | 'nopay' | 'fr';
type HalfDayPeriod = 'morning' | 'afternoon';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface FormData {
  leaveType: LeaveType;
  from: string;
  to: string;
  reason: string;
  replacement: string;
  emergencyContact: string;
  attachmentUrl: string;
  doctorCertificate: string;
  isHalfDay: boolean;
  halfDayPeriod: HalfDayPeriod;
  priority: Priority;
}

// Leave Request Form Component
export function LeaveRequestForm({ onClose, onSuccess }: LeaveRequestFormProps) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<FormData>({
    leaveType: 'annual',
    from: '',
    to: '',
    reason: '',
    replacement: '',
    emergencyContact: '',
    attachmentUrl: '',
    doctorCertificate: '',
    isHalfDay: false,
    halfDayPeriod: 'morning',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        employeeId: session?.user?.id,
        employeeName: session?.user?.name,
        leaveType: formData.leaveType,
        from: new Date(formData.from).toISOString(),
        to: new Date(formData.to).toISOString(),
        reason: formData.reason,
        replacement: formData.replacement || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        attachmentUrl: formData.attachmentUrl || undefined,
        doctorCertificate: formData.doctorCertificate || undefined,
        isHalfDay: formData.isHalfDay,
        halfDayPeriod: formData.isHalfDay ? formData.halfDayPeriod : undefined,
        priority: formData.priority
      };

      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to submit leave request');
      }
    } catch (submitError) {
      console.error('Submit error:', submitError);
      setError('An error occurred while submitting the request');
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
          <h2 className="text-2xl font-bold text-gray-800">Request New Leave</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6 text-gray-500" />
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
              id="isHalfDay"
              checked={formData.isHalfDay}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isHalfDay" className="text-sm font-medium text-gray-700">
              This is a half-day leave request
            </label>
          </div>

          {/* Half Day Period - only show if half day is selected */}
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

          {/* Additional Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Replacement */}
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

            {/* Emergency Contact */}
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

          {/* Doctor Certificate URL - only show for sick leave */}
          {formData.leaveType === 'sick' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Medical Certificate URL <span className="text-gray-400">(Optional)</span>
              </label>
              <input 
                type="url" 
                name="doctorCertificate"
                value={formData.doctorCertificate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="https://example.com/medical-certificate.pdf"
              />
            </div>
          )}

          {/* General Attachment URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supporting Document URL <span className="text-gray-400">(Optional)</span>
            </label>
            <input 
              type="url" 
              name="attachmentUrl"
              value={formData.attachmentUrl}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="https://example.com/supporting-document.pdf"
            />
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
                  Submitting Request...
                </div>
              ) : (
                'Submit Leave Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}