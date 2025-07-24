// app/api/leaves/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Employee from '@/models/Employee';
import mongoose from 'mongoose';

// Define the filter type interface
interface LeaveFilter {
  employeeId?: string;
  leaveType?: string;
  status?: string;
}

// GET /api/leaves?type=annual-leave
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const type = req.nextUrl.searchParams.get('type');
    const status = req.nextUrl.searchParams.get('status');

    const filter: LeaveFilter = {
      employeeId: session.user.id // Only get current user's leaves for employees
    };

    // If user is admin/manager, they might want to see all leaves
    const userRole = session.user.role;
    if (userRole && ['admin', 'md'].includes(userRole.toLowerCase())) {
      delete filter.employeeId; // Remove filter to see all leaves
    }

    if (type && type !== 'all') {
      // Map frontend type to backend leaveType
      const typeMapping: Record<string, string> = {
        'annual-leave': 'annual',
        'sick-leave': 'sick',
        'fr-leave': 'fr',
        'maternity-leave': 'maternity',
        'paternity-leave': 'paternity',
        'nopay-leave': 'nopay'
      };
      filter.leaveType = typeMapping[type] || type;
    }

    if (status) {
      filter.status = status;
    }

    const leaves = await LeaveRequest.find(filter)
      .populate('employeeId', 'name role')
      .populate('approvedBy', 'name role')
      .populate('rejectedBy', 'name role')
      .populate('comments.userId', 'name role')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, leaves });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}

function isHoliday(date: Date, publicHolidays: string[]): boolean {
  const day = date.getDay(); // 0 = Sunday, 5 = Friday, 6 = Saturday
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  return (
    day === 5 || // Friday
    publicHolidays.includes(dateStr)
  );
}

// Calculate working days between two dates
function calculateWorkingDays(fromDate: Date, toDate: Date, publicHolidays: string[]): number {
  let count = 0;
  const currentDate = new Date(fromDate);

  while (currentDate <= toDate) {
    if (!isHoliday(currentDate, publicHolidays)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

// POST /api/leaves
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      employeeId,
      employeeName,
      leaveType,
      from,
      to,
      reason,
      replacement,
      emergencyContact,
      attachmentUrl,
      doctorCertificate,
      isHalfDay,
      halfDayPeriod,
      priority
    } = body;

    if (!leaveType || !from || !to || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: leaveType, from, to, and reason are required' },
        { status: 400 }
      );
    }

    const validLeaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'nopay', 'fr'];
    if (!validLeaveTypes.includes(leaveType)) {
      return NextResponse.json({ error: 'Invalid leave type' }, { status: 400 });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate > toDate) {
      return NextResponse.json({ error: 'From date cannot be later than to date' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (fromDate < today && priority !== 'urgent' && leaveType !== 'sick') {
      return NextResponse.json({
        error: 'Cannot request leave for past dates unless urgent or sick leave'
      }, { status: 400 });
    }

    if (isHalfDay && !halfDayPeriod) {
      return NextResponse.json({ error: 'Half day period is required' }, { status: 400 });
    }

    if (isHalfDay && !['morning', 'afternoon'].includes(halfDayPeriod)) {
      return NextResponse.json({ error: 'Invalid half day period' }, { status: 400 });
    }

    const finalEmployeeId = employeeId || session.user.id;
    const finalEmployeeName = employeeName || session.user.name;

    if (finalEmployeeId !== session.user.id) {
      const userRole = session.user.role;
      if (!userRole || !['admin', 'md'].includes(userRole.toLowerCase())) {
        return NextResponse.json(
          { error: 'You can only create leave requests for yourself' },
          { status: 403 }
        );
      }
    }

    if (mongoose.Types.ObjectId.isValid(finalEmployeeId)) {
      const employeeExists = await Employee.findById(finalEmployeeId);
      if (!employeeExists) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 400 });
      }
    }

    // Define Maldivian public holidays (YYYY-MM-DD format)
    const publicHolidays = [
      '2025-01-01', '2025-03-26', '2025-04-08', '2025-05-01', '2025-06-15', 
      '2025-07-26', '2025-10-03', '2025-10-28', '2025-11-03', '2025-11-11'
    ];

    let totalDays: number;

    if (isHalfDay) {
      totalDays = 0.5;
    } else {
      totalDays = calculateWorkingDays(fromDate, toDate, publicHolidays);
    }

    const newLeave = new LeaveRequest({
      employeeId: finalEmployeeId,
      employeeName: finalEmployeeName,
      leaveType,
      from: fromDate,
      to: toDate,
      reason,
      replacement: replacement || undefined,
      emergencyContact: emergencyContact || undefined,
      attachmentUrl: attachmentUrl || undefined,
      doctorCertificate: doctorCertificate || undefined,
      isHalfDay: Boolean(isHalfDay),
      halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
      priority: priority || 'medium',
      totalDays,
      status: 'pending',
      comments: []
    });

    await newLeave.save();

    const populatedLeave = await LeaveRequest.findById(newLeave._id)
      .populate('employeeId', 'name role')
      .populate('approvedBy', 'name role')
      .populate('rejectedBy', 'name role');

    return NextResponse.json({
      success: true,
      leave: populatedLeave,
      message: 'Leave request submitted successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating leave request:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error: ' + error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create leave request' },
      { status: 500 }
    );
  }
}