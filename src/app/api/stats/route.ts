import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import Employee from '@/models/Employee';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();

  const totalEmployees = await Employee.countDocuments();
  const pendingRequests = await LeaveRequest.countDocuments({ status: 'pending' });
  const approvedLeaves = await LeaveRequest.countDocuments({ status: 'approved' });

  return NextResponse.json({
    totalEmployees,
    pendingRequests,
    approvedLeaves,
  });
}
