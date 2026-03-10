import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const updateAppointmentSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED']).optional(),
  date: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: { id: true, name: true, email: true, image: true, patientProfile: true },
        },
        doctor: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        },
        emrNote: true,
        prescription: true,
        payment: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check access
    if (user.role === 'PATIENT' && appointment.patientId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (user.role === 'DOCTOR') {
      const doctorProfile = await db.doctorProfile.findUnique({
        where: { userId: user.id },
      })
      if (!doctorProfile || appointment.doctorId !== doctorProfile.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json({ appointment })
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updateAppointmentSchema.parse(body)

    const appointment = await db.appointment.findUnique({
      where: { id },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check access and validate status transitions
    const updateData: any = {}
    
    if (data.status) {
      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
        PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['IN_CONSULTATION', 'CANCELLED'],
        IN_CONSULTATION: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
      }

      if (!validTransitions[appointment.status].includes(data.status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${appointment.status} to ${data.status}` },
          { status: 400 }
        )
      }
      updateData.status = data.status
    }

    if (data.date) updateData.date = new Date(data.date)
    if (data.reason) updateData.reason = data.reason
    if (data.notes) updateData.notes = data.notes

    const updatedAppointment = await db.appointment.update({
      where: { id },
      data: updateData,
    })

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'APPOINTMENT_UPDATED',
        entityType: 'Appointment',
        entityId: id,
        details: JSON.stringify({ changes: updateData }),
      },
    })

    return NextResponse.json({ appointment: updatedAppointment, message: 'Appointment updated' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Update appointment error:', error)
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Cancel instead of delete
    const appointment = await db.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'APPOINTMENT_CANCELLED',
        entityType: 'Appointment',
        entityId: id,
      },
    })

    return NextResponse.json({ appointment, message: 'Appointment cancelled' })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })
  }
}
