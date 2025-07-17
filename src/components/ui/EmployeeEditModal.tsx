'use client';

import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDropzone, FileRejection } from 'react-dropzone';
import { toast, Toaster } from 'react-hot-toast';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import {
  User, Mail, Hash, Calendar, Briefcase, DollarSign, Shield,
  Upload, ImageIcon, Check, Crop, X
} from 'lucide-react';

interface Employee {
  _id: string;
  name: string;
  email: string;
  employeeId: string;
  joinedDate: string;
  designation?: string;
  role: string;
  annualLeaveBalance?: number;
  annualLeaveTaken?: number;
  frLeaveBalance?: number;
  frLeaveTaken?: number;
  sickLeaveBalance?: number;
  sickLeaveTaken?: number;
  grossSalary?: number;
  imageUrl?: string;

  // New fields
  nid?: string;
  nationality?: string;
  permanentAddress?: string;
  presentAddress?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (updated: Employee) => void;
}

export default function EmployeeEditModal({ open, onClose, employee, onSave }: Props) {
  const [formData, setFormData] = useState<Employee | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData(employee ? { ...employee } : null);
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['annualLeaveBalance', 'annualLeaveTaken', 'frLeaveBalance', 'frLeaveTaken', 'sickLeaveBalance', 'sickLeaveTaken', 'grossSalary'];
    setFormData((prev) =>
      prev ? { ...prev, [name]: numericFields.includes(name) ? Number(value) : value } : prev
    );
  };

  const onDrop = useCallback((acceptedFiles: File[], rejections: FileRejection[]) => {
    if (rejections.length > 0) {
      toast.error('Only image files under 5MB allowed');
      return;
    }
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSubmit = async () => {
    if (!formData) return;
    const requiredFields = ['name', 'email', 'employeeId', 'joinedDate', 'role'];
    if (requiredFields.some((f) => !formData[f as keyof Employee])) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrl = formData.imageUrl || '';

      if (imageSrc && croppedAreaPixels) {
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        const file = new File([croppedBlob], 'cropped.jpg', { type: 'image/jpeg' });

        const authRes = await fetch('/api/imagekit-auth');
        const auth = await authRes.json();

        const form = new FormData();
        form.append('file', file);
        form.append('fileName', file.name);
        form.append('publicKey', process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
        form.append('signature', auth.signature);
        form.append('expire', auth.expire);
        form.append('token', auth.token);
        form.append('folder', 'employees');

        const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
          method: 'POST',
          body: form,
        });

        const uploadData = await uploadRes.json();
        uploadedImageUrl = uploadData.url;
      }

      const res = await fetch(`/api/employees/${formData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrl: uploadedImageUrl }),
      });

      if (!res.ok) throw new Error('Update failed');

      const data = await res.json();
      toast.success('Employee updated');
      onSave(data.employee);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Toaster />
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-800">
                Edit Employee
              </DialogTitle>
              <p className="text-sm text-slate-600 mt-1">
                Update employee information and manage profile details
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Personal Info */}
        <div className="py-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name *
              </Label>
              <Input name="name" value={formData.name} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address *
              </Label>
              <Input name="email" value={formData.email} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Employee ID *
              </Label>
              <Input name="employeeId" value={formData.employeeId} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined Date *
              </Label>
              <Input type="date" name="joinedDate" value={formData.joinedDate?.slice(0, 10)} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Designation
              </Label>
              <Input name="designation" value={formData.designation || ''} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Gross Salary (MVR)
              </Label>
              <Input type="number" name="grossSalary" value={formData.grossSalary ?? 0} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role *
              </Label>
              <select name="role" value={formData.role} onChange={handleChange} disabled={loading} className="h-11 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                <option value="md">Managing Director</option>
              </select>
            </div>
          </div>

          {/* New fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                National ID (NID)
              </Label>
              <Input name="nid" value={formData.nid || ''} onChange={handleChange} disabled={loading} className="h-11" placeholder="E.g. A123456" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Nationality
              </Label>
              <Input name="nationality" value={formData.nationality || ''} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium text-slate-700">
                Permanent Address
              </Label>
              <Input name="permanentAddress" value={formData.permanentAddress || ''} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2 col-span-2">
              <Label className="text-sm font-medium text-slate-700">
                Present Address
              </Label>
              <Input name="presentAddress" value={formData.presentAddress || ''} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Emergency Contact Name
              </Label>
              <Input name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} disabled={loading} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Emergency Contact Number
              </Label>
              <Input name="emergencyContactNumber" value={formData.emergencyContactNumber || ''} onChange={handleChange} disabled={loading} className="h-11" />
            </div>
          </div>

          {/* Upload */}
          <div className="space-y-4 mt-6">
            <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Profile Picture
            </Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{isDragActive ? 'Drop image here...' : 'Drag & drop or click to upload'}</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
            {imageSrc && !showCropper && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">Image uploaded and cropped successfully</span>
              </div>
            )}
          </div>

          {/* Leaves */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
            {[
              ['Sick', 'sickLeaveBalance', 'sickLeaveTaken'],
              ['Annual', 'annualLeaveBalance', 'annualLeaveTaken'],
              ['FR', 'frLeaveBalance', 'frLeaveTaken'],
            ].map(([label, bal, taken]) => (
              <div key={label} className="bg-slate-50 p-4 rounded-xl border space-y-2">
                <Label className="text-sm font-semibold text-slate-700">{label} Leave</Label>
                <Input
                  type="number"
                  name={bal}
                  value={formData[bal as keyof Employee] ?? 0}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Eligible"
                />
                <Input
                  type="number"
                  name={taken}
                  value={formData[taken as keyof Employee] ?? 0}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Taken"
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 mt-6"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>

        {/* Cropper Modal */}
        {showCropper && imageSrc && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Crop Image</h3>
                <button onClick={() => setShowCropper(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="relative w-full h-64 mb-4 bg-slate-100 rounded-lg overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button onClick={() => setShowCropper(false)} variant="outline" className="px-4 py-2">
                  Cancel
                </Button>
                <Button onClick={() => setShowCropper(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Crop className="w-4 h-4" />
                  Apply Crop
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
