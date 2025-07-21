'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/Sidebar';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Mail,
  Lock,
  Camera,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/login');
  }, [session, status, router]);

  useEffect(() => {
    // Fetch current user details
    fetch('/api/employees/me')
      .then(res => res.json())
      .then(data => {
        setName(data.name || '');
        setEmail(data.email || '');
        setPreview(data.image || null);
      })
      .catch(() => {
        toast.error('Failed to load profile data');
      });
  }, []);

  // Real-time validation
  useEffect(() => {
    if (name.trim() && name.length < 2) {
      setNameError('Name must be at least 2 characters');
    } else {
      setNameError('');
    }
  }, [name]);

  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  }, [email]);

  // Real-time password confirmation check
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      toast.dismiss('password-mismatch');
      toast.error('Passwords do not match', {
        id: 'password-mismatch',
        duration: 2000,
        icon: <XCircle className="w-5 h-5 text-red-500" />,
      });
    } else if (confirmPassword && password === confirmPassword && password.length > 0) {
      toast.dismiss('password-mismatch');
      toast.success('Passwords match!', {
        id: 'password-match',
        duration: 1500,
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      });
    }
  }, [password, confirmPassword]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) return { score: score * 20, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score: score * 20, label: 'Fair', color: 'bg-yellow-500' };
    if (score <= 4) return { score: score * 20, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  // Enhanced toast notifications
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string, description?: string) => {
    const icons = {
      success: <CheckCircle className="w-5 h-5 text-green-500" />,
      error: <XCircle className="w-5 h-5 text-red-500" />,
      warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
      info: <Info className="w-5 h-5 text-blue-500" />,
    };

    const colors = {
      success: 'bg-green-50 border-green-200',
      error: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200',
    };

    toast.custom((t) => (
      <div className={`max-w-md w-full ${colors[type]} border rounded-lg p-4 shadow-lg ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-900">{message}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => toast.dismiss(t.id)}
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    ), {
      duration: type === 'error' ? 5000 : 3000,
    });
  };

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null;

  const role = session.user?.role;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', 'File too large', 'Please select an image smaller than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Invalid file type', 'Please select a valid image file');
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      showToast('success', 'Image selected successfully', 'Your profile picture will be updated when you save changes');
    }
  };

  const validateForm = () => {
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      showToast('error', 'Name is required', 'Please enter your full name');
      isValid = false;
    } else if (name.length < 2) {
      showToast('error', 'Invalid name', 'Name must be at least 2 characters long');
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      showToast('error', 'Email is required', 'Please enter a valid email address');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('error', 'Invalid email format', 'Please enter a valid email address');
      isValid = false;
    }

    // Password validation (only if user is trying to change password)
    if (password || currentPassword || confirmPassword) {
      if (!currentPassword) {
        showToast('error', 'Current password required', 'Please enter your current password to change it');
        isValid = false;
      }

      if (!password) {
        showToast('error', 'New password required', 'Please enter a new password');
        isValid = false;
      } else if (passwordStrength.score < 60) {
        showToast('warning', 'Weak password', 'Please choose a stronger password for better security');
        isValid = false;
      }

      if (!confirmPassword) {
        showToast('error', 'Password confirmation required', 'Please confirm your new password');
        isValid = false;
      } else if (password !== confirmPassword) {
        showToast('error', 'Passwords do not match', 'New password and confirmation must be the same');
        isValid = false;
      }

      // Check if new password is same as current
      if (password === currentPassword) {
        showToast('warning', 'Same password detected', 'Your new password must be different from your current password');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Show loading toast
    const loadingToastId = toast.loading('Updating your profile...', {
      duration: Infinity,
    });

    let uploadedImageUrl = preview;

    try {
      // Handle image upload first
      if (image) {
        toast.loading('Uploading profile picture...', { id: loadingToastId });
        
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'your_upload_preset');
        formData.append('folder', 'employee-profile');

        const imageRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const imgData = await imageRes.json();
        
        if (!imageRes.ok) {
          throw new Error(imgData.error || 'Failed to upload image');
        }
        
        if (imgData?.url) {
          uploadedImageUrl = imgData.url;
          showToast('success', 'Profile picture uploaded successfully');
        }
      }

      // Update profile
      toast.loading('Saving profile changes...', { id: loadingToastId });
      
      const res = await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          currentPassword: password ? currentPassword : undefined,
          password: password || undefined,
          image: uploadedImageUrl,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        // Clear password fields after successful update
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
        setImage(null);

        toast.dismiss(loadingToastId);

        if (password) {
          showToast('success', 'Password changed successfully!', 'Your password has been updated. Please use the new password for future logins.');
        } else {
          showToast('success', 'Profile updated successfully!', 'Your changes have been saved.');
        }

        // Optional: Update session data if needed
        // window.location.reload();
      } else {
        toast.dismiss(loadingToastId);
        
        // Handle specific error cases
        if (result.error?.includes('current password')) {
          showToast('error', 'Incorrect current password', 'The current password you entered is not correct');
        } else if (result.error?.includes('email')) {
          showToast('error', 'Email update failed', result.error);
        } else if (result.error?.includes('password')) {
          showToast('error', 'Password update failed', result.error);
        } else {
          showToast('error', 'Update failed', result.error || 'An unexpected error occurred');
        }
      }
    } catch (err: any) {
      toast.dismiss(loadingToastId);
      console.error('Settings update error:', err);
      
      if (err.message?.includes('network') || err.message?.includes('fetch')) {
        showToast('error', 'Network error', 'Please check your internet connection and try again');
      } else {
        showToast('error', 'Something went wrong', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Render Complete Form Fields with all password features
  const renderFormFields = () => (
    <>
      {/* Profile Image Section */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-xl">
            {preview ? (
              <Image src={preview} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-600 transition shadow-lg">
            <Camera className="w-4 h-4 text-white" />
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-2">Click the camera icon to update your photo</p>
        <p className="text-xs text-gray-400 mt-1">Max file size: 5MB</p>
      </div>

      {/* Name & Email */}
      <div className="space-y-4 mt-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 text-emerald-600" />
            Full Name *
          </label>
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 bg-white/50 backdrop-blur-sm ${
              nameError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
            }`}
            placeholder="Enter your full name"
          />
          {nameError && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 text-emerald-600" />
            Email Address *
          </label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-emerald-500 bg-white/50 backdrop-blur-sm ${
              emailError ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-emerald-500'
            }`}
            placeholder="Enter your email address"
          />
          {emailError && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              {emailError}
            </p>
          )}
        </div>

        {/* Password Section Header */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Change Password</h3>
          <p className="text-sm text-gray-500 mb-4">Leave blank if you don't want to change your password</p>
        </div>

        {/* Current Password */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            Current Password
          </label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
              placeholder="Enter your current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Required only when changing password</p>
        </div>

        {/* New Password */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            New Password
          </label>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/50 backdrop-blur-sm"
              placeholder="Enter a new password (optional)"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Password Strength:</span>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength.label === 'Weak'
                      ? 'text-red-600'
                      : passwordStrength.label === 'Fair'
                      ? 'text-yellow-600'
                      : passwordStrength.label === 'Good'
                      ? 'text-blue-600'
                      : 'text-green-600'
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.score}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Password requirements:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                    {password.length >= 8 ? '✓' : '○'} 8+ characters
                  </span>
                  <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                    {/[A-Z]/.test(password) ? '✓' : '○'} Uppercase letter
                  </span>
                  <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                    {/[a-z]/.test(password) ? '✓' : '○'} Lowercase letter
                  </span>
                  <span className={/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                    {/\d/.test(password) ? '✓' : '○'} Number
                  </span>
                  <span
                    className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600' : 'text-gray-400'}
                  >
                    {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} Special character
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            Confirm New Password
          </label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 pr-12 rounded-xl border focus:ring-2 focus:ring-emerald-500 bg-white/50 backdrop-blur-sm ${
                confirmPassword && !passwordsMatch
                  ? 'border-red-300 focus:border-red-500'
                  : confirmPassword && passwordsMatch
                  ? 'border-green-300 focus:border-green-500'
                  : 'border-gray-200 focus:border-emerald-500'
              }`}
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && (
            <p
              className={`text-xs mt-1 flex items-center gap-1 ${
                passwordsMatch ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {passwordsMatch ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Passwords match
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Passwords do not match
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </>
  );

  if (role === 'employee') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="opacity-5 transform scale-150">
            <Building2 className="w-96 h-96 text-gray-400" />
          </div>
        </div>

        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-2xl border-b border-emerald-400/30 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Account Settings</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{session.user?.name || 'User'}</p>
                <p className="text-xs text-emerald-100">{session.user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
                <span className="text-white text-sm font-medium">{session.user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Update Your Profile</h2>
                <p className="text-gray-600">Manage your account settings and profile information</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {renderFormFields()}

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !!nameError || !!emailError}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        Update Settings
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
        {/* Footer */}
        <footer className="bg-gradient-to-r from-emerald-600 to-teal-700 border-t border-emerald-500/30 px-4 sm:px-6 py-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-white">
                &copy; {new Date().getFullYear()} Leave Management Portal. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-emerald-100">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/support" className="hover:text-white">Support</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Admin/MD view (with sidebar) - Now uses the same complete form fields
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="opacity-5 transform scale-150">
          <Building2 className="w-96 h-96 text-gray-400" />
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex-shrink-0">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-2xl border-b border-emerald-400/30 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 bg-white/20 rounded-lg lg:hidden hover:bg-white/30" onClick={() => setSidebarOpen(true)}>
                <Calendar className="w-5 h-5 text-white" />
              </button>
              <button className="hidden lg:flex p-2 rounded-lg hover:bg-white/10" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5 text-white" /> : <ChevronLeft className="w-5 h-5 text-white" />}
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Account Settings</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{session.user?.name || 'User'}</p>
                <p className="text-xs text-emerald-100">{session.user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center ring-2 ring-white/30">
                <span className="text-white text-sm font-medium">{session.user?.name?.charAt(0) || 'U'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Update Your Profile</h2>
                <p className="text-gray-600">Manage your account settings and profile information</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {renderFormFields()}

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading || !!nameError || !!emailError}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        Update Settings
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-emerald-600 to-teal-700 border-t border-emerald-500/30 px-4 sm:px-6 py-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm text-white">
                &copy; {new Date().getFullYear()} Leave Management Portal. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-emerald-100">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <a href="/support" className="hover:text-white">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}