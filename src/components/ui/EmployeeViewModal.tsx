'use client';

import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from './button';
import {
  Mail,
  Calendar,
  Building,
  User,
  DollarSign,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Phone,
} from 'lucide-react';

interface EmployeeViewModalProps {
  open: boolean;
  onClose: () => void;
  employeeId?: string | null;
  employee?: any;
}

export default function EmployeeViewModal({ open, onClose, employee }: EmployeeViewModalProps) {
  if (!open || !employee) return null;

  const {
    name,
    email,
    employeeId,
    designation,
    role,
    joinedDate,
    sickLeaveBalance = 30,
    sickLeaveTaken = 0,
    annualLeaveBalance = 30,
    annualLeaveTaken = 0,
    frLeaveBalance = 15,
    frLeaveTaken = 0,
    grossSalary,
    imageUrl,
    nid,
    nationality,
    permanentAddress,
    presentAddress,
    emergencyContactName,
    emergencyContactNumber,
  } = employee;

  const profileImageSrc = imageUrl || '/placeholder-profile.jpg';

  const leaveData = [
    {
      type: 'Sick Leave',
      eligible: sickLeaveBalance,
      taken: sickLeaveTaken,
      balance: sickLeaveBalance - sickLeaveTaken,
      icon: AlertCircle,
    },
    {
      type: 'Annual Leave',
      eligible: annualLeaveBalance,
      taken: annualLeaveTaken,
      balance: annualLeaveBalance - annualLeaveTaken,
      icon: Calendar,
    },
    {
      type: 'FR Leave',
      eligible: frLeaveBalance,
      taken: frLeaveTaken,
      balance: frLeaveBalance - frLeaveTaken,
      icon: Clock,
    },
  ];

  const detailItems = [
    { label: 'Email', value: email, icon: Mail },
    { label: 'Employee ID', value: employeeId, icon: User },
    { label: 'Designation', value: designation || '-', icon: Building },
    { label: 'Role', value: role, icon: Building },
    {
      label: 'Joined Date',
      value: joinedDate ? new Date(joinedDate).toLocaleDateString() : '-',
      icon: Calendar,
    },
    {
      label: 'Salary',
      value: grossSalary != null ? `MVR ${grossSalary.toLocaleString()}` : '-',
      icon: DollarSign,
    },

    // Personal Information
    { label: 'NID', value: nid || '-', icon: User },
    { label: 'Nationality', value: nationality || '-', icon: User },
    { label: 'Permanent Address', value: permanentAddress || '-', icon: MapPin },
    { label: 'Present Address', value: presentAddress || '-', icon: MapPin },
    { label: 'Emergency Contact Name', value: emergencyContactName || '-', icon: User },
    { label: 'Emergency Contact Number', value: emergencyContactNumber || '-', icon: Phone },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-full max-w-2xl h-[85vh] sm:h-[90vh] overflow-hidden rounded-xl p-0 bg-white shadow-lg border mx-auto flex flex-col">
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Header */}
        <div className="relative bg-gray-50 border-b p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                <Image
                  src={profileImageSrc}
                  alt={`${name} photo`}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized={!imageUrl}
                  priority={false}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <DialogTitle className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-1">
                {name}
              </DialogTitle>
              <p className="text-gray-600 text-base font-medium mb-1">
                {designation || role}
              </p>
              <p className="text-gray-500 text-sm">ID: {employeeId}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 scrollbar-hide">
          <section className="mb-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Employee Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {detailItems.map(({ label, value, icon: Icon }) => (
                <div key={label} className="group">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                      <p className="text-base text-gray-900 break-words">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Leave Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaveData.map(({ type, eligible, taken, balance, icon: Icon }) => (
                <div key={type} className="p-6 rounded-lg border bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="font-medium text-[13px] text-gray-900">{type}</h4>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Eligible</span>
                      <span className="font-medium text-gray-900">{eligible}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taken</span>
                      <span className="font-medium text-gray-900">{taken}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Balance</span>
                      <span className="font-semibold text-gray-900">{balance}</span>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-gray-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${eligible > 0 ? (taken / eligible) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {eligible > 0 ? Math.round((taken / eligible) * 100) : 0}% used
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="border-t p-4 flex justify-end">
          <Button variant="outline" onClick={onClose} className="px-6 py-2 rounded-lg">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
