import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  const { id } = params;
  const body = await req.json();

  const leave = await LeaveRequest.findById(id);
  if (!leave) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  leave.comments.push({
    user: body.userId || 'unknown',
    message: body.message,
    createdAt: new Date(),
  });

  await leave.save();

  // Populate employee field for frontend convenience
  await leave.populate('employee', 'name');

  return NextResponse.json(leave);
}
