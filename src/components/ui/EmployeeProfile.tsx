'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  DollarSign,
  CheckCircle
} from 'lucide-react';

interface Employee {
  name: string;
  email: string;
  role: string;
  designation: string;
  imageUrl?: string;
  employeeId: string;
  joinedDate: string;
  nationality: string;
  presentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  grossSalary: number;
}

export default function EmployeeProfile() {
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
      <div className="space-y-6">
        {/* Profile Card Skeleton */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-40 mx-auto sm:mx-0" />
              <Skeleton className="h-6 w-20 mx-auto sm:mx-0" />
            </div>
          </div>
        </div>
        
        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Employee Data Found</h3>
        <p className="text-gray-600">Unable to retrieve your employee information at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Animated background elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute top-20 -left-4 w-16 h-16 bg-teal-200 rounded-full opacity-10 animate-pulse delay-1000"></div>
      
      {/* Profile Header Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="relative">
              {employee.imageUrl ? (
                <Image
                  src={employee.imageUrl}
                  alt={employee.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                  {employee.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{employee.name}</h2>
              <p className="text-emerald-100 text-lg mb-1">{employee.designation}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 capitalize px-3 py-1">
                  {employee.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm">ID: {employee.employeeId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl">
              <Calendar className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Joined Date</p>
                <p className="text-sm text-gray-600">{new Date(employee.joinedDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl">
              <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Nationality</p>
                <p className="text-sm text-gray-600">{employee.nationality}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-xl">
              <DollarSign className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">Gross Salary</p>
                <p className="text-lg font-bold text-emerald-600">MVR {employee.grossSalary.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Contact Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50/50 rounded-xl">
              <p className="text-sm font-medium text-gray-800 mb-1">Present Address</p>
              <p className="text-sm text-gray-600">{employee.presentAddress}</p>
            </div>
            
            <div className="p-3 bg-emerald-50/50 rounded-xl">
              <p className="text-sm font-medium text-gray-800 mb-1">Permanent Address</p>
              <p className="text-sm text-gray-600">{employee.permanentAddress}</p>
            </div>
            
            <div className="p-3 bg-emerald-50/50 rounded-xl">
              <p className="text-sm font-medium text-gray-800 mb-1">Emergency Contact</p>
              <p className="text-sm text-gray-600">{employee.emergencyContactName}</p>
              <p className="text-sm text-emerald-600 font-medium">{employee.emergencyContactNumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}