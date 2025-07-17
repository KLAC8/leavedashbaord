import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;
  const leave = await LeaveRequest.findById(id);
  if (!leave) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  leave.status = 'approved';
  await leave.save();
  return NextResponse.json(leave);
}