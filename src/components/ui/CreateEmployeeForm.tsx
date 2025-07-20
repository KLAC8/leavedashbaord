'use client';
import { useCallback, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { toast, Toaster } from 'react-hot-toast';
import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Check,
  Loader2,
  Building2,
  CreditCard,
  Globe,
  MapPin,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';

interface EmployeeData {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  joinedDate: string;
  role: string;
  designation: string;
  grossSalary: number;
  nid: string;
  nationality: string;
  permanentAddress: string;
  presentAddress: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  imageUrl?: string;
}

interface CreateEmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (newEmployee: EmployeeData) => void;
}

export default function CreateEmployeeForm({ open, onClose, onCreate }: CreateEmployeeFormProps) {
  const [formData, setFormData] = useState<Omit<EmployeeData, 'imageUrl' | 'grossSalary'> & { grossSalary: string }>({
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const totalSteps = 4;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
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

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSubmit = async () => {
    const {
      name,
      email,
      password,
      role,
      designation,
      employeeId,
      joinedDate,
      grossSalary,
      nid,
      nationality,
      permanentAddress,
      presentAddress,
      emergencyContactName,
      emergencyContactNumber,
    } = formData;

    if (
      !name ||
      !email ||
      !password ||
      !role ||
      !designation ||
      !employeeId ||
      !joinedDate ||
      !grossSalary ||
      !nid ||
      !nationality ||
      !permanentAddress ||
      !presentAddress ||
      !emergencyContactName ||
      !emergencyContactNumber
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error occurred.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCropConfirm = () => {
    setShowCropper(false);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      const requiredFields = ['name', 'email', 'password', 'employeeId'];
      if (requiredFields.some((f) => !formData[f as keyof typeof formData])) {
        toast.error('Please fill in all required fields in Step 1');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const requiredFields = ['joinedDate', 'designation', 'grossSalary', 'role'];
      if (requiredFields.some((f) => !formData[f as keyof typeof formData])) {
        toast.error('Please fill in all required fields in Step 2');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const requiredFields = ['nid', 'nationality', 'permanentAddress', 'presentAddress'];
      if (requiredFields.some((f) => !formData[f as keyof typeof formData])) {
        toast.error('Please fill in all required fields in Step 3');
        return;
      }
      setCurrentStep(4);
    }
  };

  const prevStep = () => {
    if (currentStep === 4) setCurrentStep(3);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const renderStep1 = () => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h2>
      
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 pr-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="employeeId" className="text-sm font-medium text-gray-700">Employee ID</label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="employeeId"
            name="employeeId"
            type="text"
            placeholder="Enter employee ID"
            value={formData.employeeId}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Professional Information</h2>
      
      <div className="space-y-1">
        <label htmlFor="joinedDate" className="text-sm font-medium text-gray-700">Joined Date</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="joinedDate"
            name="joinedDate"
            type="date"
            value={formData.joinedDate}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="designation" className="text-sm font-medium text-gray-700">Designation</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="designation"
            name="designation"
            type="text"
            placeholder="Enter job designation"
            value={formData.designation}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="grossSalary" className="text-sm font-medium text-gray-700">Gross Salary (MVR)</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="grossSalary"
            name="grossSalary"
            type="number"
            placeholder="Enter gross salary"
            value={formData.grossSalary}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
        <div className="relative">
          <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 w-full border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 bg-white text-sm"
            required
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
            <option value="md">Managing Director</option>
          </select>
        </div>
      </div>

      {/* Profile Picture Upload */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
            isDragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">
                {isDragActive ? 'Drop the image here...' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>
        {imageSrc && !showCropper && (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-emerald-700">Image uploaded and cropped successfully</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h2>
      
      <div className="space-y-1">
        <label htmlFor="nid" className="text-sm font-medium text-gray-700">National ID / Passport</label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="nid"
            name="nid"
            type="text"
            placeholder="Enter NID or Passport"
            value={formData.nid}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="nationality" className="text-sm font-medium text-gray-700">Nationality</label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="nationality"
            name="nationality"
            type="text"
            placeholder="Enter nationality"
            value={formData.nationality}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="permanentAddress" className="text-sm font-medium text-gray-700">Permanent Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <textarea
            id="permanentAddress"
            name="permanentAddress"
            placeholder="Enter permanent address"
            value={formData.permanentAddress}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 p-2 w-full border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 resize-none h-16 text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="presentAddress" className="text-sm font-medium text-gray-700">Present Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
          <textarea
            id="presentAddress"
            name="presentAddress"
            placeholder="Enter present address"
            value={formData.presentAddress}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 p-2 w-full border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-emerald-500 resize-none h-16 text-sm"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Emergency Contact</h2>
      
      <div className="space-y-1">
        <label htmlFor="emergencyContactName" className="text-sm font-medium text-gray-700">Emergency Contact Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="emergencyContactName"
            name="emergencyContactName"
            type="text"
            placeholder="Enter emergency contact name"
            value={formData.emergencyContactName}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="emergencyContactNumber" className="text-sm font-medium text-gray-700">Emergency Contact Number</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="emergencyContactNumber"
            name="emergencyContactNumber"
            type="tel"
            placeholder="Enter contact number"
            value={formData.emergencyContactNumber}
            onChange={handleChange}
            disabled={loading}
            className="pl-9 h-10 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg text-sm"
            required
          />
        </div>
      </div>

      <div className="bg-emerald-50 p-3 rounded-lg mt-4">
        <h3 className="font-medium text-emerald-800 mb-2 text-sm">Review Your Information</h3>
        <div className="text-xs text-emerald-700 space-y-1">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Role:</strong> {formData.role}</p>
          <p><strong>Employee ID:</strong> {formData.employeeId}</p>
          <p><strong>Designation:</strong> {formData.designation}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md w-full rounded-2xl p-0 border-0">
          <DialogTitle></DialogTitle>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-white/20">
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
                  <Button 
                    onClick={() => setShowCropper(false)} 
                    variant="outline"
                    className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-sm h-9 px-4"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCropConfirm}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm h-9 px-4"
                  >
                    Crop & Continue
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-3">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">Create New Employee</h1>
                  <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-gray-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Multi-Step Form */}
                <div className="space-y-4">
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-4">
                    {currentStep > 1 && (
                      <Button
                        onClick={prevStep}
                        variant="outline"
                        className="px-4 py-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-sm h-9"
                        disabled={loading}
                      >
                        Previous
                      </Button>
                    )}
                    
                    {currentStep < totalSteps ? (
                      <Button
                        onClick={nextStep}
                        className="ml-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm h-9"
                        disabled={loading}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="ml-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm h-9"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Creating...
                          </div>
                        ) : (
                          'Create Employee'
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-center text-xs text-gray-600">
                    All fields marked with * are required
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}