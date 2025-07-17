import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILeaveRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  leaveType: 'annual' | 'fr';
  from: Date;
  to: Date;
  reason: string;
  replacement?: string;
  emergencyContact?: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: { userId: mongoose.Types.ObjectId; text: string; createdAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    employeeName: { type: String, required: true },
    leaveType: { type: String, enum: ['annual', 'fr'], required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    reason: { type: String, required: true },
    replacement: { type: String },
    emergencyContact: { type: String },
    attachmentUrl: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'Employee' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const LeaveRequest: Model<ILeaveRequest> = mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;
