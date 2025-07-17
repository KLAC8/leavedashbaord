import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const employee = await Employee.findById(id).select('-password');

  if (!employee) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ employee });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const body = await request.json();

  const {
    name,
    email,
    password,
    role,
    designation,
    employeeId,
    joinedDate,
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
  } = body;

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
  }

  const updateData: Partial<typeof body> = {
    name,
    email,
    role,
    designation,
    employeeId,
    imageUrl,
    nid,
    nationality,
    permanentAddress,
    presentAddress,
    emergencyContactName,
    emergencyContactNumber,
  };

  if (joinedDate) updateData.joinedDate = new Date(joinedDate);
  if (typeof annualLeaveBalance === 'number') updateData.annualLeaveBalance = annualLeaveBalance;
  if (typeof annualLeaveTaken === 'number') updateData.annualLeaveTaken = annualLeaveTaken;
  if (typeof frLeaveBalance === 'number') updateData.frLeaveBalance = frLeaveBalance;
  if (typeof frLeaveTaken === 'number') updateData.frLeaveTaken = frLeaveTaken;
  if (typeof sickLeaveBalance === 'number') updateData.sickLeaveBalance = sickLeaveBalance;
  if (typeof sickLeaveTaken === 'number') updateData.sickLeaveTaken = sickLeaveTaken;
  if (typeof grossSalary === 'number') updateData.grossSalary = grossSalary;
  if (password) updateData.password = await bcrypt.hash(password, 10);

  const updated = await Employee.findByIdAndUpdate(id, updateData, {
    new: true,
  }).select('-password');

  if (!updated) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, employee: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  await connectDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const deleted = await Employee.findByIdAndDelete(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
