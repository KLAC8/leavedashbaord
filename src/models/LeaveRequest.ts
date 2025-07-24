import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the leave request document
export interface ILeaveRequest {
  employeeId: mongoose.Types.ObjectId;
  employeeName: string;
  leaveType: 
    | 'annual' | 'sick' |'maternity' | 'paternity' | 'nopay'  | 'fr';
  from: Date;
  to: Date;
  totalDays: number;
  reason: string;
  replacement?: string;
  emergencyContact?: string;
  attachmentUrl?: string;
  doctorCertificate?: string;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'afternoon';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  comments: {
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
    role: 'employee' | 'md' | 'admin';
  }[];
  leaveBalance?: {
    beforeLeave: number;
    afterLeave: number;
    leaveType: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Define virtual properties interface
export interface ILeaveRequestVirtuals {
  duration: number;
}

// Define instance methods interface
export interface ILeaveRequestMethods {
  canBeCancelled(): boolean;
}

// Define static methods interface
export interface ILeaveRequestStatics {
  getLeaveStats(employeeId: mongoose.Types.ObjectId, year: number): Promise<any[]>;
}

// Combined document interface
export interface ILeaveRequestDocument 
  extends ILeaveRequest, 
          ILeaveRequestVirtuals, 
          ILeaveRequestMethods, 
          Document {}

// Model interface
export interface ILeaveRequestModel 
  extends Model<ILeaveRequestDocument>, 
          ILeaveRequestStatics {}

const LeaveRequestSchema = new Schema<ILeaveRequestDocument, ILeaveRequestModel>(
  {
    employeeId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Employee', 
      required: true 
    },
    employeeName: { 
      type: String, 
      required: true 
    },
    leaveType: { 
      type: String, 
      enum: [
        'annual', 'sick', 'maternity', 'paternity', 'nopay', 'fr'
      ], 
      required: true 
    },
    from: { 
      type: Date, 
      required: true 
    },
    to: { 
      type: Date, 
      required: true 
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5
    },
    reason: { 
      type: String, 
      required: true 
    },
    replacement: { 
      type: String 
    },
    emergencyContact: { 
      type: String 
    },
    attachmentUrl: { 
      type: String 
    },
    doctorCertificate: {
      type: String
    },
    isHalfDay: {
      type: Boolean,
      default: false
    },
    halfDayPeriod: {
      type: String,
      enum: ['morning', 'afternoon'],
      required: function(this: ILeaveRequestDocument) {
        return this.isHalfDay;
      }
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected', 'cancelled'], 
      default: 'pending' 
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    approvedAt: {
      type: Date
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee'
    },
    rejectedAt: {
      type: Date
    },
    comments: [
      {
        userId: { 
          type: Schema.Types.ObjectId, 
          ref: 'Employee',
          required: true
        },
        text: {
          type: String,
          required: true
        },
        createdAt: { 
          type: Date, 
          default: Date.now 
        },
        role: {
          type: String,
          enum: ['employee', 'manager', 'hr', 'admin'],
          required: true
        }
      },
    ],
    leaveBalance: {
      beforeLeave: Number,
      afterLeave: Number,
      leaveType: String
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for calculating leave duration
LeaveRequestSchema.virtual('duration').get(function(this: ILeaveRequestDocument): number {
  if (this.isHalfDay) {
    return 0.5;
  }
  const timeDiff = this.to.getTime() - this.from.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
});

// Index for better query performance
LeaveRequestSchema.index({ employeeId: 1, status: 1 });
LeaveRequestSchema.index({ from: 1, to: 1 });
LeaveRequestSchema.index({ leaveType: 1 });
LeaveRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate total days
LeaveRequestSchema.pre('save', function(this: ILeaveRequestDocument, next) {
  if (this.isHalfDay) {
    this.totalDays = 0.5;
  } else {
    const timeDiff = this.to.getTime() - this.from.getTime();
    this.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
  next();
});

// Instance method to check if leave can be cancelled
LeaveRequestSchema.methods.canBeCancelled = function(this: ILeaveRequestDocument): boolean {
  return this.status === 'pending' || (this.status === 'approved' && this.from > new Date());
};

// Static method to get leave statistics
LeaveRequestSchema.statics.getLeaveStats = function(
  this: ILeaveRequestModel,
  employeeId: mongoose.Types.ObjectId, 
  year: number
): Promise<any[]> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  return this.aggregate([
    {
      $match: {
        employeeId,
        from: { $gte: startDate, $lte: endDate },
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$leaveType',
        totalDays: { $sum: '$totalDays' },
        count: { $sum: 1 }
      }
    }
  ]);
};

const LeaveRequest: ILeaveRequestModel = 
  (mongoose.models.LeaveRequest as ILeaveRequestModel) || 
  mongoose.model<ILeaveRequestDocument, ILeaveRequestModel>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;