import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';
import Employee from '@/models/Employee';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route'; // adjust path if needed
import path from 'path';
import { writeFile } from 'fs/promises';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  let query = {};
  // If not admin, restrict to their own requests
  if (session.user.role !== 'admin') {
    query = { employeeEmail: session.user.email };
  }

  const leaveRequests = await LeaveRequest.find(query).lean();

  return NextResponse.json({ leaveRequests });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();

  // Extract form data
  const leaveType = formData.get('leaveType') as string;
  const from = new Date(formData.get('from') as string);
  const to = new Date(formData.get('to') as string);
  const reason = formData.get('reason') as string;
  const replacement = formData.get('replacement') as string | undefined;
  const emergencyContact = formData.get('emergencyContact') as string | undefined;
  const employeeName = formData.get('employeeName') as string;

  // Handle file upload (optional)
  let attachmentUrl: string | undefined;
  const file = formData.get('file') as File | null;
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(uploadsDir, fileName);
    await writeFile(filePath, buffer);
    attachmentUrl = `/uploads/${fileName}`;
  }

  await connectDB();

  // Find employee by logged-in user's email
  const employee = await Employee.findOne({ email: session.user.email });
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  // Create and save leave request
  const newLeaveRequest = new LeaveRequest({
    employeeId: employee._id,
    employeeName,
    leaveType,
    from,
    to,
    reason,
    replacement,
    emergencyContact,
    attachmentUrl,
    status: 'pending',
    comments: [],
  });

  await newLeaveRequest.save();

  return NextResponse.json({ success: true });
}
