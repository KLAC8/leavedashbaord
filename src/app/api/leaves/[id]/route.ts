// app/api/leaves/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaveRequest from '@/models/LeaveRequest'; 
import { connectDB } from '@/lib/db'; 
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid leave request ID' },
        { status: 400 }
      );
    }

    const leave = await LeaveRequest.findOne({
      _id: id,
      employeeId: session.user.id // Ensure user can only access their own leaves
    })
    .populate('approvedBy', 'name role')
    .populate('rejectedBy', 'name role')
    .populate('comments.userId', 'name role');

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      leave: {
        id: leave._id,
        employeeId: leave.employeeId,
        employeeName: leave.employeeName,
        leaveType: leave.leaveType,
        from: leave.from,
        to: leave.to,
        totalDays: leave.totalDays,
        reason: leave.reason,
        replacement: leave.replacement,
        emergencyContact: leave.emergencyContact,
        attachmentUrl: leave.attachmentUrl,
        doctorCertificate: leave.doctorCertificate,
        isHalfDay: leave.isHalfDay,
        halfDayPeriod: leave.halfDayPeriod,
        priority: leave.priority,
        status: leave.status,
        approvedBy: leave.approvedBy,
        approvedAt: leave.approvedAt,
        rejectedBy: leave.rejectedBy,
        rejectedAt: leave.rejectedAt,
        comments: leave.comments,
        leaveBalance: leave.leaveBalance,
        createdAt: leave.createdAt,
        updatedAt: leave.updatedAt,
        duration: leave.duration 
      }
    });

  } catch (error) {
    console.error('Error fetching leave:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const body = await request.json();
    const { action, reason, comment } = body; 

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid leave request ID' },
        { status: 400 }
      );
    }

    const leave = await LeaveRequest.findById(id)
      .populate('employeeId', 'name email role annualLeaveBalance sickLeaveBalance');

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    // Handle different actions
    if (action === 'approve' || action === 'reject') {
      // Check if user has permission to approve/reject (manager role or HR)
      // You might want to check user role from your User/Employee model
      const userRole = session.user.role; // Assuming role is in session
      
      if (!userRole || !['md', 'admin'].includes(userRole.toLowerCase())) {
        return NextResponse.json(
          { error: 'Insufficient permissions to approve/reject leave requests' },
          { status: 403 }
        );
      }

      if (leave.status !== 'pending') {
        return NextResponse.json(
          { error: 'Leave request has already been processed' },
          { status: 400 }
        );
      }

      let updateData: any = {
        status: action === 'approve' ? 'approved' : 'rejected'
      };

      if (action === 'approve') {
        updateData.approvedBy = session.user.id;
        updateData.approvedAt = new Date();

        // Add approval comment if provided
        if (comment) {
          updateData.$push = {
            comments: {
              userId: session.user.id,
              text: comment,
              role: userRole,
              createdAt: new Date()
            }
          };
        }

        // TODO: Update employee's leave balance here
        // This would depend on your Employee model structure
        /*
        await Employee.findByIdAndUpdate(leave.employeeId, {
          $inc: {
            [`${leave.leaveType}LeaveTaken`]: leave.totalDays
          }
        });
        */

      } else if (action === 'reject') {
        updateData.rejectedBy = session.user.id;
        updateData.rejectedAt = new Date();
        
        // Add rejection comment
        updateData.$push = {
          comments: {
            userId: session.user.id,
            text: reason || 'Leave request rejected',
            role: userRole,
            createdAt: new Date()
          }
        };
      }

      const updatedLeave = await LeaveRequest.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true }
      )
      .populate('approvedBy', 'name role')
      .populate('rejectedBy', 'name role')
      .populate('comments.userId', 'name role');

      return NextResponse.json({
        success: true,
        leave: updatedLeave,
        message: `Leave request ${action}d successfully`
      });

    } else if (action === 'cancel') {
      // Employee cancelling their own request
      if (leave.employeeId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only cancel your own leave requests' },
          { status: 403 }
        );
      }

      // Check if leave can be cancelled using the instance method
      if (!leave.canBeCancelled()) {
        return NextResponse.json(
          { error: 'This leave request cannot be cancelled' },
          { status: 400 }
        );
      }

      const updatedLeave = await LeaveRequest.findByIdAndUpdate(
        id,
        { 
          status: 'cancelled',
          $push: {
            comments: {
              userId: session.user.id,
              text: reason || 'Leave request cancelled by employee',
              role: 'employee',
              createdAt: new Date()
            }
          }
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        leave: updatedLeave,
        message: 'Leave request cancelled successfully'
      });

    } else if (action === 'update') {
      // Employee updating their pending request
      if (leave.employeeId.toString() !== session.user.id) {
        return NextResponse.json(
          { error: 'You can only update your own leave requests' },
          { status: 403 }
        );
      }

      if (leave.status !== 'pending') {
        return NextResponse.json(
          { error: 'Cannot update processed leave requests' },
          { status: 400 }
        );
      }

      const { leaveType, from, to, reason: updateReason, replacement, emergencyContact, isHalfDay, halfDayPeriod } = body;

      const updateData: any = {};
      if (leaveType) updateData.leaveType = leaveType;
      if (from) updateData.from = new Date(from);
      if (to) updateData.to = new Date(to);
      if (updateReason) updateData.reason = updateReason;
      if (replacement) updateData.replacement = replacement;
      if (emergencyContact) updateData.emergencyContact = emergencyContact;
      if (typeof isHalfDay === 'boolean') updateData.isHalfDay = isHalfDay;
      if (halfDayPeriod) updateData.halfDayPeriod = halfDayPeriod;

      const updatedLeave = await LeaveRequest.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      return NextResponse.json({
        success: true,
        leave: updatedLeave,
        message: 'Leave request updated successfully'
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating leave:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid leave request ID' },
        { status: 400 }
      );
    }

    const leave = await LeaveRequest.findOne({
      _id: id,
      employeeId: session.user.id // Ensure user can only delete their own leaves
    });

    if (!leave) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 }
      );
    }

    if (leave.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cannot delete processed leave requests. Use cancel instead.' },
        { status: 400 }
      );
    }

    await LeaveRequest.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Leave request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting leave:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}