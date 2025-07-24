// app/api/leaves/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaveRequest from '@/models/LeaveRequest';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';

// Define interfaces for populated fields
interface PopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  role: string;
}

interface PopulatedComment {
  userId: PopulatedUser;
  text: string;
  role: string;
  createdAt: Date;
}

interface PopulatedLeaveRequest {
  _id: mongoose.Types.ObjectId;
  employeeName?: string;
  employeeId: string;
  leaveType: string;
  from: Date;
  to: Date;
  totalDays: number;
  priority?: string;
  status: string;
  isHalfDay?: boolean;
  halfDayPeriod?: string;
  reason: string;
  replacement?: string;
  emergencyContact?: string;
  createdAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  approvedBy?: PopulatedUser;
  rejectedBy?: PopulatedUser;
  comments?: PopulatedComment[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid leave request ID' },
        { status: 400 }
      );
    }

    const leave = await LeaveRequest.findOne({
      _id: id,
      employeeId: session.user.id // Ensure user can only download their own leaves
    })
    .populate('approvedBy', 'name role')
    .populate('rejectedBy', 'name role')
    .populate('comments.userId', 'name role')
    .lean() as PopulatedLeaveRequest | null;

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('KLAC Management Portal', { align: 'center' });
    doc.fontSize(16).font('Helvetica').text('Leave Request Details', { align: 'center' });
    doc.moveDown(2);

    // Employee Information
    doc.fontSize(14).font('Helvetica-Bold').text('Employee Information:');
    doc.fontSize(12).font('Helvetica')
       .text(`Name: ${leave.employeeName || 'N/A'}`)
       .text(`Employee ID: ${leave.employeeId}`)
       .text(`Request Date: ${new Date(leave.createdAt).toLocaleDateString()}`)
       .moveDown();

    // Leave Details
    doc.fontSize(14).font('Helvetica-Bold').text('Leave Details:');
    doc.fontSize(12).font('Helvetica')
       .text(`Leave Type: ${leave.leaveType?.replace('-', ' ').toUpperCase()}`)
       .text(`Start Date: ${new Date(leave.from).toLocaleDateString()}`)
       .text(`End Date: ${new Date(leave.to).toLocaleDateString()}`)
       .text(`Duration: ${leave.totalDays} day${leave.totalDays > 1 ? 's' : ''}`)
       .text(`Priority: ${(leave.priority || 'medium').toUpperCase()}`)
       .text(`Status: ${leave.status.toUpperCase()}`);

    if (leave.isHalfDay) {
      doc.text(`Half Day Period: ${leave.halfDayPeriod || 'N/A'}`);
    }
    doc.moveDown();

    // Reason
    doc.fontSize(14).font('Helvetica-Bold').text('Reason for Leave:');
    doc.fontSize(12).font('Helvetica').text(leave.reason, { width: 500 }).moveDown();

    // Additional Information
    if (leave.replacement || leave.emergencyContact) {
      doc.fontSize(14).font('Helvetica-Bold').text('Additional Information:');
      if (leave.replacement) {
        doc.fontSize(12).font('Helvetica').text(`Replacement: ${leave.replacement}`);
      }
      if (leave.emergencyContact) {
        doc.fontSize(12).font('Helvetica').text(`Emergency Contact: ${leave.emergencyContact}`);
      }
      doc.moveDown();
    }

    // Status Timeline
    doc.fontSize(14).font('Helvetica-Bold').text('Request Timeline:');
    doc.fontSize(12).font('Helvetica')
       .text(`• Submitted: ${new Date(leave.createdAt).toLocaleDateString()}`);

    if (leave.status === 'approved' && leave.approvedAt) {
      const approverName = leave.approvedBy?.name ? ` by ${leave.approvedBy.name}` : '';
      doc.text(`• Approved: ${new Date(leave.approvedAt).toLocaleDateString()}${approverName}`);
    }

    if (leave.status === 'rejected' && leave.rejectedAt) {
      const rejectorName = leave.rejectedBy?.name ? ` by ${leave.rejectedBy.name}` : '';
      doc.text(`• Rejected: ${new Date(leave.rejectedAt).toLocaleDateString()}${rejectorName}`);
    }

    doc.moveDown();

    // Comments
    if (leave.comments && leave.comments.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('Comments:');
      leave.comments.forEach((comment) => {
        const userName = comment.userId?.name || 'User';
        const userRole = comment.role || comment.userId?.role || 'Employee';
        doc.fontSize(12).font('Helvetica-Bold')
           .text(`${userName} (${userRole}) - ${new Date(comment.createdAt).toLocaleDateString()}:`);
        doc.fontSize(11).font('Helvetica')
           .text(comment.text, { indent: 20 })
           .moveDown(0.5);
      });
    }

    // Footer
    doc.fontSize(10).font('Helvetica')
       .text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 
             50, doc.page.height - 50, { align: 'center' });

    doc.end();

    const pdfBuffer = await pdfPromise;

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="leave-request-${leave._id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}