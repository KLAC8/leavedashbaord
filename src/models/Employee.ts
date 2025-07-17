import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IEmployee extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'md' | 'employee';
  annualLeaveBalance: number;
  annualLeaveTaken: number;
  frLeaveBalance: number;
  frLeaveTaken: number;
  sickLeaveBalance: number;
  sickLeaveTaken: number;
  grossSalary: number;
  imageUrl?: string;
  designation: string;
  employeeId: string;
  joinedDate: Date;
  nid: string;
  nationality: string;
  permanentAddress: string;
  presentAddress: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'md', 'employee'], default: 'employee' },

    annualLeaveBalance: { type: Number, default: 30 },
    annualLeaveTaken: { type: Number, default: 0 },
    frLeaveBalance: { type: Number, default: 15 },
    frLeaveTaken: { type: Number, default: 0 },
    sickLeaveBalance: { type: Number, default: 10 },
    sickLeaveTaken: { type: Number, default: 0 },

    grossSalary: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    designation: { type: String, required: true },
    employeeId: { type: String, required: true },
    joinedDate: { type: Date, required: true },

    nid: {
      type: String,
      required: true,
      validate: {
        validator: function (value: string) {
          const maldivianNID = /^[A-Z]{1}\d{6}$/; // e.g., A405466
          const foreignNID = /^[A-Z0-9]{5,20}$/i; // e.g., PAS123456, FG89DK123
          return maldivianNID.test(value) || foreignNID.test(value);
        },
        message: 'Invalid NID format. Must be Maldivian (A123456) or valid foreign ID/passport.',
      },
    },

    nationality: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    presentAddress: { type: String, required: true },
    emergencyContactName: { type: String, required: true },
    emergencyContactNumber: {
      type: String,
      required: true,
      match: [/^[793]\d{6}$/, 'Phone number must be 7 digits starting with 7, 9, or 3'],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-uppercase NID before saving
EmployeeSchema.pre<IEmployee>('save', function (next) {
  if (this.nid) {
    this.nid = this.nid.toUpperCase();
  }
  next();
});

const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

export default Employee;
