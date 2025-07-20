import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  await Employee.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { role } = await req.json();
  await connectDB();
  await Employee.findByIdAndUpdate(id, { role });
  return NextResponse.json({ success: true });
}