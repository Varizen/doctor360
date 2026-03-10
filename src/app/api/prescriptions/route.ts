import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createPrescriptionSchema = z.object({
  appointmentId: z.string(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    notes: z.string().optional(),
  })),
  instructions: z.string().optional(),
  validUntil: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    const where: any = {}

    if (user.role === 'PATIENT') {
      where.patientId = user.id
    } else if (patientId) {
      where.patientId = patientId
    }

    const prescriptions = await db.prescription.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        appointment: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Parse medications JSON
    const parsedPrescriptions = prescriptions.map(p => ({
      ...p,
      medications: typeof p.medications === 'string' ? JSON.parse(p.medications) : p.medications,
    }))

    return NextResponse.json({ prescriptions: parsedPrescriptions })
  } catch (error) {
    console.error('Get prescriptions error:', error)
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Only doctors can create prescriptions' }, { status: 403 })
    }

    const body = await request.json()
    const data = createPrescriptionSchema.parse(body)

    // Get appointment to find patient
    const appointment = await db.appointment.findUnique({
      where: { id: data.appointmentId },
    })
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if prescription already exists
    const existingPrescription = await db.prescription.findUnique({
      where: { appointmentId: data.appointmentId },
    })
    if (existingPrescription) {
      return NextResponse.json({ error: 'Prescription already exists for this appointment' }, { status: 400 })
    }

    const prescription = await db.prescription.create({
      data: {
        appointmentId: data.appointmentId,
        patientId: appointment.patientId,
        medications: JSON.stringify(data.medications),
        instructions: data.instructions,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    })

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'PRESCRIPTION_CREATED',
        entityType: 'Prescription',
        entityId: prescription.id,
        details: JSON.stringify({ appointmentId: data.appointmentId, patientId: appointment.patientId }),
      },
    })

    return NextResponse.json({ prescription, message: 'Prescription created successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Create prescription error:', error)
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 })
  }
}
