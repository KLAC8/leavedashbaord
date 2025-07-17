import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  await Employee.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { role } = await req.json();
  await connectDB();
  await Employee.findByIdAndUpdate(params.id, { role });
  return NextResponse.json({ success: true });
}
