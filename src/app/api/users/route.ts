import { connectDB } from '@/lib/db';
import Employee from '@/models/Employee';
import { NextResponse } from 'next/server';
import bcrypt from "bcrypt";

export async function GET(req: Request) {
  await connectDB();
  const url = new URL(req.url);
  const sort = url.searchParams.get('sort') || 'createdAt';

  const users = await Employee.find().sort({ [sort]: 1 });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  await connectDB();
  const existing = await Employee.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const newUser = new Employee({ name, email, password: hashed, role });
  await newUser.save();

  return NextResponse.json({ success: true });
}