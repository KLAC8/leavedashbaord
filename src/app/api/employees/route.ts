import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import bcrypt from 'bcrypt';

export async function GET(req: Request) {
  await connectDB();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') ?? '1', 10);
  const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
  const skip = (page - 1) * limit;

  const employees = await Employee.find()
    .select('-password')
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Employee.countDocuments();

  return NextResponse.json({ employees, total });
}

export async function POST(req: Request) {
  await connectDB();

  const {
    name,
    email,
    password,
    role,
    designation,
    employeeId,
    joinedDate,
    annualLeaveBalance = 30,
    annualLeaveTaken = 0,
    frLeaveBalance = 15,
    frLeaveTaken = 0,
    sickLeaveBalance = 10,
    sickLeaveTaken = 0,
    grossSalary = 0,
    imageUrl = '',
    nid,
    nationality,
    permanentAddress,
    presentAddress,
    emergencyContactName,
    emergencyContactNumber,
  } = await req.json();

  if (!name || !email || !password || !role || !designation || !employeeId || !joinedDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const exists = await Employee.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: 'Email already used' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newEmployee = new Employee({
    name,
    email,
    password: hashedPassword,
    role,
    designation,
    employeeId,
    joinedDate: new Date(joinedDate),
    annualLeaveBalance,
    annualLeaveTaken,
    frLeaveBalance,
    frLeaveTaken,
    sickLeaveBalance,
    sickLeaveTaken,
    grossSalary,
    imageUrl,
    nid,
    nationality,
    permanentAddress,
    presentAddress,
    emergencyContactName,
    emergencyContactNumber,
  });

  await newEmployee.save();

  const { password: _pw, ...employeeWithoutPassword } = newEmployee.toObject();
  return NextResponse.json({ success: true, employee: employeeWithoutPassword });
}
