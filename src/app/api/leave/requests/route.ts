// app/api/leave/requests/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import LeaveRequest from '@/models/LeaveRequest';

export async function GET(request: Request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const query: any = {};
  if (status && status !== 'all') query.status = status;

  const requests = await LeaveRequest.find(query)
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ requests });
}
