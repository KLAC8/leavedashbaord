'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, EyeOff, Mail, Lock, User, Building2, Calendar, MapPin, Phone, CreditCard, Briefcase, Shield, Globe } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    designation: '',
    employeeId: '',
    joinedDate: '',
    nid: '',
    nationality: '',
    permanentAddress: '',
    presentAddress: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    grossSalary: '',
    imageUrl: ''
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = {
        ...form,
        grossSalary: form.grossSalary ? parseFloat(form.grossSalary) : 0,
        joinedDate: new Date(form.joinedDate).toISOString()
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });

      setLoading(false);

      if (res.ok) {
        router.push('/login');
      } else {
        let errorMsg = 'Registration failed';
        try {
          const data = await res.json();
          errorMsg = data.error || errorMsg;
        } catch {
          // ignore json parse error
        }
        setError(errorMsg);
      }
    } catch (fetchError) {
      setLoading(false);
      setError('Network error, please try again.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 relative overflow-hidden">
      {/* Faded Company Logo Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="opacity-5 transform scale-150">
          <Building2 className="w-96 h-96 text-gray-400" />
        </div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-teal-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-cyan-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      
      {/* Register Form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Registration</h1>
            <p className="text-gray-600">Step {currentStep} of {totalSteps}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Multi-Step Form */}
          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
                
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={form.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={form.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      id="role"
                      value={form.role}
                      onChange={(e) => updateForm('role', e.target.value)}
                      className="pl-10 h-12 w-full border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="md">Managing Director</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h2>
                
                <div className="space-y-2">
                  <label htmlFor="employeeId" className="text-sm font-medium text-gray-700">Employee ID</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="Enter employee ID"
                      value={form.employeeId}
                      onChange={(e) => updateForm('employeeId', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="designation" className="text-sm font-medium text-gray-700">Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="designation"
                      type="text"
                      placeholder="Enter job designation"
                      value={form.designation}
                      onChange={(e) => updateForm('designation', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="joinedDate" className="text-sm font-medium text-gray-700">Joined Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="joinedDate"
                      type="date"
                      value={form.joinedDate}
                      onChange={(e) => updateForm('joinedDate', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="grossSalary" className="text-sm font-medium text-gray-700">Gross Salary</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="grossSalary"
                      type="number"
                      placeholder="Enter gross salary"
                      value={form.grossSalary}
                      onChange={(e) => updateForm('grossSalary', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">Profile Image URL (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="Enter image URL"
                      value={form.imageUrl}
                      onChange={(e) => updateForm('imageUrl', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Personal Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                
                <div className="space-y-2">
                  <label htmlFor="nid" className="text-sm font-medium text-gray-700">National ID / Passport</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="nid"
                      type="text"
                      placeholder="Enter NID (A123456) or Passport"
                      value={form.nid}
                      onChange={(e) => updateForm('nid', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="nationality"
                      type="text"
                      placeholder="Enter nationality"
                      value={form.nationality}
                      onChange={(e) => updateForm('nationality', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="permanentAddress" className="text-sm font-medium text-gray-700">Permanent Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="permanentAddress"
                      placeholder="Enter permanent address"
                      value={form.permanentAddress}
                      onChange={(e) => updateForm('permanentAddress', e.target.value)}
                      className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 resize-none h-20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="presentAddress" className="text-sm font-medium text-gray-700">Present Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      id="presentAddress"
                      placeholder="Enter present address"
                      value={form.presentAddress}
                      onChange={(e) => updateForm('presentAddress', e.target.value)}
                      className="pl-10 p-3 w-full border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 resize-none h-20"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Emergency Contact */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h2>
                
                <div className="space-y-2">
                  <label htmlFor="emergencyContactName" className="text-sm font-medium text-gray-700">Emergency Contact Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="emergencyContactName"
                      type="text"
                      placeholder="Enter emergency contact name"
                      value={form.emergencyContactName}
                      onChange={(e) => updateForm('emergencyContactName', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="emergencyContactNumber" className="text-sm font-medium text-gray-700">Emergency Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="emergencyContactNumber"
                      type="tel"
                      placeholder="Enter 7-digit number (7/9/3xxxxxx)"
                      value={form.emergencyContactNumber}
                      onChange={(e) => updateForm('emergencyContactNumber', e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg"
                      pattern="[793]\d{6}"
                      maxLength={7}
                      required
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-medium text-emerald-800 mb-2">Review Your Information</h3>
                  <div className="text-sm text-emerald-700 space-y-1">
                    <p><strong>Name:</strong> {form.name}</p>
                    <p><strong>Email:</strong> {form.email}</p>
                    <p><strong>Role:</strong> {form.role}</p>
                    <p><strong>Employee ID:</strong> {form.employeeId}</p>
                    <p><strong>Designation:</strong> {form.designation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  onClick={prevStep}
                  variant="outline"
                  className="px-6 py-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="ml-auto px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleRegister}
                  className="ml-auto px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              By creating an account, you agree to our terms of service
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          © 2025 Your Company. All rights reserved.
        </div>
      </div>
    </div>
  );
}