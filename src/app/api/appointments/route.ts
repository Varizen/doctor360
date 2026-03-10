import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createAppointmentSchema = z.object({
  doctorId: z.string(),
  date: z.string(),
  duration: z.number().optional(),
  type: z.enum(['IN_PERSON', 'VIDEO_CONSULTATION', 'PHONE_CONSULTATION']).optional(),
  reason: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const where: any = {}

    if (user.role === 'PATIENT') {
      where.patientId = user.id
    } else if (user.role === 'DOCTOR') {
      const doctorProfile = await db.doctorProfile.findUnique({
        where: { userId: user.id },
      })
      if (doctorProfile) {
        where.doctorId = doctorProfile.id
      }
    }
    // Admin can see all appointments

    if (status) {
      where.status = status
    }

    if (date) {
      const dateObj = new Date(date)
      const nextDay = new Date(dateObj)
      nextDay.setDate(nextDay.getDate() + 1)
      where.date = {
        gte: dateObj,
        lt: nextDay,
      }
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            patientProfile: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        payment: true,
      },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Only patients can book appointments' }, { status: 403 })
    }

    const body = await request.json()
    const data = createAppointmentSchema.parse(body)

    // Check if doctor exists and is available
    const doctor = await db.doctorProfile.findUnique({
      where: { id: data.doctorId },
    })

    if (!doctor || !doctor.isAvailable) {
      return NextResponse.json({ error: 'Doctor not available' }, { status: 400 })
    }

    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        patientId: user.id,
        doctorId: data.doctorId,
        date: new Date(data.date),
        duration: data.duration || 30,
        type: data.type || 'IN_PERSON',
        reason: data.reason,
        status: 'DRAFT',
        sessionToken: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: {
          include: { user: { select: { id: true, name: true } } },
        },
      },
    })

    // Create pending payment
    await db.payment.create({
      data: {
        appointmentId: appointment.id,
        patientId: user.id,
        amount: doctor.consultationFee,
        status: 'PENDING',
      },
    })

    // Update status to pending payment
    await db.appointment.update({
      where: { id: appointment.id },
      data: { status: 'PENDING_PAYMENT' },
    })

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'APPOINTMENT_CREATED',
        entityType: 'Appointment',
        entityId: appointment.id,
        details: JSON.stringify({ doctorId: data.doctorId, date: data.date }),
      },
    })

    return NextResponse.json({ appointment, message: 'Appointment created successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Create appointment error:', error)
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
  }
}
