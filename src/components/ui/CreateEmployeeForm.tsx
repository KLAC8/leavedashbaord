'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast, Toaster } from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  User, 
  Mail, 
  Lock, 
  Hash, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Shield,
  Image as ImageIcon,
  Check,
  Loader2
} from 'lucide-react';

interface CreateEmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (newEmployee: any) => void;
}

export default function CreateEmployeeForm({ open, onClose, onCreate }: CreateEmployeeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    joinedDate: '',
    role: 'employee',
    designation: '',
    grossSalary: '',
    nid: '',
    nationality: '',
    permanentAddress: '',
    presentAddress: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      toast.error('Only image files under 5MB are allowed');
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

  const handleCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSubmit = async () => {
    const {
      name, email, password, role, designation, employeeId, joinedDate, grossSalary,
      nid, nationality, permanentAddress, presentAddress, emergencyContactName, emergencyContactNumber,
    } = formData;

    if (
      !name || !email || !password || !role || !designation || !employeeId ||
      !joinedDate || !grossSalary || !nid || !nationality || !permanentAddress ||
      !presentAddress || !emergencyContactName || !emergencyContactNumber
    ) {
      toast.error('Please fill all required fields.');
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = '';

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

      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          grossSalary: Number(grossSalary),
          imageUrl: uploadedImageUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create employee');
      }

      const data = await res.json();
      toast.success('Employee created successfully!');
      onCreate(data.employee);
      onClose();

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        employeeId: '',
        joinedDate: '',
        role: 'employee',
        designation: '',
        grossSalary: '',
        nid: '',
        nationality: '',
        permanentAddress: '',
        presentAddress: '',
        emergencyContactName: '',
        emergencyContactNumber: '',
      });
      setImageSrc(null);
      setShowCropper(false);
      setCurrentStep(1);
    } catch (err: any) {
      toast.error(err.message || 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleCropConfirm = () => {
    setShowCropper(false);
    setCurrentStep(2);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const requiredFields = ['name', 'email', 'password', 'employeeId'];
      if (requiredFields.some(f => !formData[f as keyof typeof formData])) {
        toast.error('Please fill in all required fields in Step 1');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const requiredFields = ['joinedDate', 'designation', 'grossSalary', 'role'];
      if (requiredFields.some(f => !formData[f as keyof typeof formData])) {
        toast.error('Please fill in all required fields in Step 2');
        return;
      }
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
        <p className="text-sm text-slate-600">Enter the employee's personal details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name *
          </Label>
          <Input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="John Doe"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address *
          </Label>
          <Input 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="john.doe@company.com"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password *
          </Label>
          <Input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="••••••••"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Employee ID *
          </Label>
          <Input 
            name="employeeId" 
            value={formData.employeeId} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="EMP001"
            className="h-11"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={nextStep}
          className="px-8 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center gap-2"
        >
          Next Step
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Professional Details</h3>
        <p className="text-sm text-slate-600">Complete the employee's work information</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Joined Date *
          </Label>
          <Input 
            type="date" 
            name="joinedDate" 
            value={formData.joinedDate} 
            onChange={handleChange} 
            disabled={loading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Designation *
          </Label>
          <Input 
            name="designation" 
            value={formData.designation} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="Software Engineer"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Gross Salary (MVR) *
          </Label>
          <Input 
            type="number" 
            name="grossSalary" 
            value={formData.grossSalary} 
            onChange={handleChange} 
            disabled={loading}
            placeholder="25000"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Role *
          </Label>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            disabled={loading} 
            className="h-11 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
            <option value="md">Managing Director</option>
          </select>
        </div>
      </div>

      {/* Profile Picture Upload */}
      <div className="space-y-4">
        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Profile Picture
        </Label>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {isDragActive ? 'Drop the image here...' : 'Drag & drop or click to upload'}
              </p>
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

      <div className="flex justify-between">
        <Button 
          onClick={prevStep}
          variant="outline"
          className="px-8 py-2 border-slate-300 text-slate-700 rounded-lg"
        >
          Previous
        </Button>
        <Button 
          onClick={nextStep} 
          disabled={loading}
          className="px-8 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg"
        >
          Next Step
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Personal Information</h3>
        <p className="text-sm text-slate-600">Enter personal details</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="nid" className="text-sm font-medium text-slate-700">National ID (NID) *</Label>
          <Input
            id="nid"
            name="nid"
            value={formData.nid}
            onChange={handleChange}
            disabled={loading}
            placeholder="1234567890123"
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="nationality" className="text-sm font-medium text-slate-700">Nationality *</Label>
          <Input
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            disabled={loading}
            placeholder="Maldivian"
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="permanentAddress" className="text-sm font-medium text-slate-700">Permanent Address *</Label>
          <Input
            id="permanentAddress"
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={handleChange}
            disabled={loading}
            placeholder="Hulhumale, Maldives"
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="presentAddress" className="text-sm font-medium text-slate-700">Present Address *</Label>
          <Input
            id="presentAddress"
            name="presentAddress"
            value={formData.presentAddress}
            onChange={handleChange}
            disabled={loading}
            placeholder="Male, Maldives"
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="emergencyContactName" className="text-sm font-medium text-slate-700">Emergency Contact Name *</Label>
          <Input
            id="emergencyContactName"
            name="emergencyContactName"
            value={formData.emergencyContactName}
            onChange={handleChange}
            disabled={loading}
            placeholder="Jane Doe"
            className="h-11"
          />
        </div>

        <div>
          <Label htmlFor="emergencyContactNumber" className="text-sm font-medium text-slate-700">Emergency Contact Number *</Label>
          <Input
            id="emergencyContactNumber"
            name="emergencyContactNumber"
            value={formData.emergencyContactNumber}
            onChange={handleChange}
            disabled={loading}
            placeholder="+960 1234567"
            className="h-11"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          onClick={prevStep}
          variant="outline"
          className="px-8 py-2 border-slate-300 text-slate-700 rounded-lg"
        >
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="px-8 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg flex items-center gap-2"
        >
          {loading ? (
            <>
              Submitting
              <Loader2 className="animate-spin w-4 h-4" />
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto rounded-xl p-6">
          <DialogHeader>
            <DialogTitle>Create New Employee</DialogTitle>
          </DialogHeader>

          {showCropper && imageSrc ? (
            <div className="relative w-full h-[350px] bg-gray-100 rounded-lg">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                <Button onClick={() => setShowCropper(false)} variant="outline">Cancel</Button>
                <Button onClick={handleCropConfirm}>Crop & Continue</Button>
              </div>
            </div>
          ) : (
            <>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
