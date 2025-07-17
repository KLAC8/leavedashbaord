import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';

export async function POST() {
  await connectDB();
  await Employee.updateMany({}, { annualLeaveBalance: 30, frLeaveBalance: 15 });
  return NextResponse.json({ success: true });
}
