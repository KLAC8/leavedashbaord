import { LeaveRequest } from "@/types/leave";
import { Calendar, CheckCircle, Clock3, MessageSquare, User, XCircle } from "lucide-react";

interface LeaveDetailsModalProps {
  leave: LeaveRequest;
  onClose: () => void;
}

export function LeaveDetailsModal({ leave, onClose }: LeaveDetailsModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-800">Leave Request Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {leave.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {leave.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
            {leave.status === 'pending' && <Clock3 className="w-5 h-5 text-yellow-600" />}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(leave.status)}`}>
              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Leave Type</div>
              <div className="text-lg font-semibold text-gray-800">
                {leave.type?.replace('-', ' ').toUpperCase()}
              </div>
              {leave.isHalfDay && (
                <div className="text-sm text-blue-600 mt-1">
                  Half Day ({leave.halfDayPeriod})
                </div>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">Duration</div>
              <div className="text-lg font-semibold text-gray-800">
                {leave.days} day{leave.days > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Date Information */}
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="text-sm font-medium text-emerald-700 mb-2">Leave Period</div>
            <div className="flex items-center gap-2 text-emerald-800">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold">
                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Priority */}
          {leave.priority && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Priority:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(leave.priority)}`}>
                {leave.priority.charAt(0).toUpperCase() + leave.priority.slice(1)}
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <div className="text-sm font-medium text-gray-600 mb-2">Reason</div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-800">{leave.reason}</p>
            </div>
          </div>

          {/* Additional Information */}
          {(leave.replacement || leave.emergencyContact) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {leave.replacement && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Replacement</div>
                  <div className="flex items-center gap-2 text-gray-800">
                    <User className="w-4 h-4" />
                    <span>{leave.replacement}</span>
                  </div>
                </div>
              )}
              {leave.emergencyContact && (
                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Emergency Contact</div>
                  <div className="text-gray-800">{leave.emergencyContact}</div>
                </div>
              )}
            </div>
          )}

          {/* Request Timeline */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm font-medium text-gray-600 mb-3">Request Timeline</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="text-sm text-gray-700">
                  Requested on {new Date(leave.requestedDate).toLocaleDateString()}
                </div>
              </div>
              
              {leave.status === 'approved' && leave.approvedDate && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="text-sm text-gray-700">
                    Approved on {new Date(leave.approvedDate).toLocaleDateString()}
                    {leave.approvedBy && ` by ${leave.approvedBy}`}
                  </div>
                </div>
              )}
              
              {leave.status === 'rejected' && leave.rejectedDate && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="text-sm text-gray-700">
                    Rejected on {new Date(leave.rejectedDate).toLocaleDateString()}
                    {leave.rejectedBy && ` by ${leave.rejectedBy}`}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Reason */}
          {leave.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-800 mb-2">Rejection Reason</div>
              <p className="text-red-700">{leave.rejectionReason}</p>
            </div>
          )}

          {/* Comments */}
          {leave.comments && leave.comments.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments ({leave.comments.length})
              </div>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {leave.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-800">
                        {comment.userId?.name || 'User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {leave.status === 'pending' && (
              <div className="flex gap-2">
                <button className="px-4 py-2 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  Edit
                </button>
                <button className="px-4 py-2 text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  Cancel Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
