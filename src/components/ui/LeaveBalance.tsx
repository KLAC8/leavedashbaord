'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  Heart,
  Briefcase
} from 'lucide-react';

interface Employee {
  annualLeaveBalance: number;
  annualLeaveTaken: number;
  frLeaveBalance: number;
  frLeaveTaken: number;
  sickLeaveBalance: number;
  sickLeaveTaken: number;
}

export default function LeaveBalance() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch('/api/employees/me', { credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
          setEmployee(data.employee);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Failed to fetch employee', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Leave Data Unavailable</h3>
        <p className="text-gray-600 text-sm">Unable to retrieve leave balance information.</p>
      </div>
    );
  }

  const leaveTypes = [
    {
      name: 'Annual Leave',
      taken: employee.annualLeaveTaken,
      balance: employee.annualLeaveBalance,
      icon: Calendar,
      color: 'from-emerald-500 to-green-600'
    },
    {
      name: 'FR Leave',
      taken: employee.frLeaveTaken,
      balance: employee.frLeaveBalance,
      icon: Clock,
      color: 'from-teal-500 to-cyan-600'
    },
    {
      name: 'Sick Leave',
      taken: employee.sickLeaveTaken,
      balance: employee.sickLeaveBalance,
      icon: Heart,
      color: 'from-emerald-600 to-teal-700'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 h-fit">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Leave Balance</h3>
      </div>
      
      <div className="space-y-4">
        {leaveTypes.map((leave, index) => {
          const percentage = leave.balance > 0 ? (leave.taken / leave.balance) * 100 : 0;
          const IconComponent = leave.icon;
          
          return (
            <div key={index} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${leave.color} rounded-xl flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 flex-1">{leave.name}</h4>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">{leave.taken}</div>
                  <div className="text-xs text-gray-600">/ {leave.balance}</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="w-full bg-emerald-200/50 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${leave.color} h-2 rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Usage: {percentage.toFixed(0)}%</span>
                  <span className="text-emerald-600 font-medium">
                    {leave.balance - leave.taken} remaining
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="mt-6 pt-4 border-t border-emerald-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-emerald-50/50 rounded-lg p-3">
            <div className="text-lg font-bold text-emerald-600">
              {leaveTypes.reduce((sum, leave) => sum + leave.taken, 0)}
            </div>
            <div className="text-xs text-gray-600">Total Used</div>
          </div>
          <div className="bg-teal-50/50 rounded-lg p-3">
            <div className="text-lg font-bold text-teal-600">
              {leaveTypes.reduce((sum, leave) => sum + (leave.balance - leave.taken), 0)}
            </div>
            <div className="text-xs text-gray-600">Total Remaining</div>
          </div>
        </div>
      </div>
    </div>
  );
}