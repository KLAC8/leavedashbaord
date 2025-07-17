import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectDB();

  try {
    const {
      name,
      email,
      password,
      employeeId,
      designation,
      nid,
      nationality,
      presentAddress,
      permanentAddress,
      emergencyContactName,
      emergencyContactNumber,
      joinedDate,
    } = await req.json();

    // Check for existing employee
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    await Employee.create({
      name,
      email,
      password: hashedPassword,
      employeeId,
      designation,
      nid,
      nationality,
      presentAddress,
      permanentAddress,
      emergencyContactName,
      emergencyContactNumber,
      joinedDate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
