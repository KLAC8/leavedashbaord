// app/api/leaves/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaveRequest, { ILeaveRequestDocument } from '@/models/LeaveRequest';
import { connectDB } from '@/lib/db';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';

interface LeaveFilter {
  employeeId?: string;
  leaveType?: string;
  status?: string;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

interface PopulatedUser {
  _id: string;
  name: string;
  role?: string;
}

interface PopulatedLeaveRequest extends Omit<ILeaveRequestDocument, 'employeeId' | 'approvedBy' | 'rejectedBy'> {
  employeeId: PopulatedUser;
  approvedBy?: PopulatedUser;
  rejectedBy?: PopulatedUser;
}

// Helper functions to safely access populated fields
function getEmployeeName(leave: PopulatedLeaveRequest): string {
  return leave.employeeName || leave.employeeId?.name || 'N/A';
}

function getApproverName(approver?: PopulatedUser): string {
  return approver?.name || 'N/A';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';
    const dateRange = searchParams.get('dateRange') || 'all';
    const status = searchParams.get('status') || 'all';
    const leaveType = searchParams.get('leaveType') || 'all';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build filter
    const filter: LeaveFilter = {
      employeeId: session.user.id // Only get current user's leaves for employees
    };

    // If user is admin/manager, they can see all leaves
    const userRole = session.user.role;
    if (userRole && ['admin', 'md'].includes(userRole.toLowerCase())) {
      delete filter.employeeId;
    }

    if (status !== 'all') {
      filter.status = status;
    }

    if (leaveType !== 'all') {
      filter.leaveType = leaveType;
    }

    // Date range filtering
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date = now;

      switch (dateRange) {
        case 'thisMonth': {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        }
        case 'lastMonth': {
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        }
        case 'thisYear': {
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        }
        case 'custom': {
          if (!fromDate || !toDate) {
            return NextResponse.json(
              { error: 'From and To dates are required for custom range' },
              { status: 400 }
            );
          }
          startDate = new Date(fromDate);
          endDate = new Date(toDate);
          break;
        }
        default: {
          startDate = new Date(0); // Beginning of time
        }
      }

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const leaves = await LeaveRequest.find(filter)
      .populate('employeeId', 'name role')
      .populate('approvedBy', 'name role')
      .populate('rejectedBy', 'name role')
      .sort({ createdAt: -1 });

    // Type the result properly
    const typedLeaves = leaves as unknown as PopulatedLeaveRequest[];

    if (format === 'pdf') {
      return generatePDFReport(typedLeaves);
    } else if (format === 'excel') {
      return generateExcelReport(typedLeaves);
    } else if (format === 'csv') {
      return generateCSVReport(typedLeaves);
    } else {
      return NextResponse.json(
        { error: 'Invalid format specified' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function generatePDFReport(leaves: PopulatedLeaveRequest[]): Promise<Response> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  
  const pdfPromise = new Promise<Buffer>((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });

  // Header
  doc.fontSize(20).font('Helvetica-Bold').text('KLAC Management Portal', { align: 'center' });
  doc.fontSize(16).font('Helvetica').text('Leave Requests Report', { align: 'center' });
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);

  // Summary
  doc.fontSize(14).font('Helvetica-Bold').text('Summary:');
  doc.fontSize(12).font('Helvetica')
     .text(`Total Requests: ${leaves.length}`)
     .text(`Pending: ${leaves.filter(l => l.status === 'pending').length}`)
     .text(`Approved: ${leaves.filter(l => l.status === 'approved').length}`)
     .text(`Rejected: ${leaves.filter(l => l.status === 'rejected').length}`)
     .moveDown(2);

  // Leave requests table
  doc.fontSize(14).font('Helvetica-Bold').text('Leave Requests:');
  doc.moveDown();

  leaves.forEach((leave, index) => {
    if (doc.y > 700) { // Start new page if needed
      doc.addPage();
    }

    doc.fontSize(12).font('Helvetica-Bold')
       .text(`${index + 1}. ${getEmployeeName(leave)} - ${leave.leaveType?.toUpperCase()}`);
    doc.fontSize(10).font('Helvetica')
       .text(`   Period: ${new Date(leave.from).toLocaleDateString()} to ${new Date(leave.to).toLocaleDateString()}`)
       .text(`   Duration: ${leave.totalDays} days | Status: ${leave.status.toUpperCase()}`)
       .text(`   Reason: ${leave.reason.substring(0, 100)}${leave.reason.length > 100 ? '...' : ''}`)
       .moveDown();
  });

  doc.end();

  const pdfBuffer = await pdfPromise;

  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="leave-report-${new Date().toISOString().split('T')[0]}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  });
}

async function generateExcelReport(leaves: PopulatedLeaveRequest[]): Promise<Response> {
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for Excel
  const data = leaves.map(leave => ({
    'Employee Name': getEmployeeName(leave),
    'Leave Type': leave.leaveType?.toUpperCase(),
    'Start Date': new Date(leave.from).toLocaleDateString(),
    'End Date': new Date(leave.to).toLocaleDateString(),
    'Duration (Days)': leave.totalDays,
    'Status': leave.status.toUpperCase(),
    'Priority': leave.priority.toUpperCase(),
    'Half Day': leave.isHalfDay ? 'Yes' : 'No',
    'Half Day Period': leave.halfDayPeriod || 'N/A',
    'Reason': leave.reason,
    'Replacement': leave.replacement || 'N/A',
    'Emergency Contact': leave.emergencyContact || 'N/A',
    'Requested Date': new Date(leave.createdAt).toLocaleDateString(),
    'Approved By': getApproverName(leave.approvedBy),
    'Approved Date': leave.approvedAt ? new Date(leave.approvedAt).toLocaleDateString() : 'N/A',
    'Rejected By': getApproverName(leave.rejectedBy),
    'Rejected Date': leave.rejectedAt ? new Date(leave.rejectedAt).toLocaleDateString() : 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leave Requests');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

  return new Response(excelBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="leave-report-${new Date().toISOString().split('T')[0]}.xlsx"`,
      'Content-Length': excelBuffer.length.toString(),
    },
  });
}

async function generateCSVReport(leaves: PopulatedLeaveRequest[]): Promise<Response> {
  const headers = [
    'Employee Name',
    'Leave Type',
    'Start Date',
    'End Date',
    'Duration (Days)',
    'Status',
    'Priority',
    'Half Day',
    'Half Day Period',
    'Reason',
    'Replacement',
    'Emergency Contact',
    'Requested Date',
    'Approved By',
    'Approved Date',
    'Rejected By',
    'Rejected Date'
  ];

  const csvData = leaves.map(leave => [
    getEmployeeName(leave),
    leave.leaveType?.toUpperCase(),
    new Date(leave.from).toLocaleDateString(),
    new Date(leave.to).toLocaleDateString(),
    leave.totalDays,
    leave.status.toUpperCase(),
    leave.priority.toUpperCase(),
    leave.isHalfDay ? 'Yes' : 'No',
    leave.halfDayPeriod || 'N/A',
    `"${leave.reason.replace(/"/g, '""')}"`, // Escape quotes
    leave.replacement || 'N/A',
    leave.emergencyContact || 'N/A',
    new Date(leave.createdAt).toLocaleDateString(),
    getApproverName(leave.approvedBy),
    leave.approvedAt ? new Date(leave.approvedAt).toLocaleDateString() : 'N/A',
    getApproverName(leave.rejectedBy),
    leave.rejectedAt ? new Date(leave.rejectedAt).toLocaleDateString() : 'N/A'
  ]);

  const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
  const csvBuffer = Buffer.from(csvContent, 'utf-8');

  return new Response(csvBuffer, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="leave-report-${new Date().toISOString().split('T')[0]}.csv"`,
      'Content-Length': csvBuffer.length.toString(),
    },
  });
}