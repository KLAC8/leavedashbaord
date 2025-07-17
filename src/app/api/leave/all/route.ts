import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';

export async function GET() {
  await connectDB();
  const leaves = await LeaveRequest.find({})
    .populate('employee', 'name')
    .lean();
  return NextResponse.json(leaves);
}
