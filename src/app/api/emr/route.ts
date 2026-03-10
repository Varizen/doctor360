import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createEMRSchema = z.object({
  appointmentId: z.string(),
  chiefComplaint: z.string().optional(),
  presentIllness: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  vitalSigns: z.any().optional(),
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

    const emrNotes = await db.eMRNote.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true, email: true } },
        doctor: {
          include: { user: { select: { id: true, name: true } } },
        },
        appointment: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ emrNotes })
  } catch (error) {
    console.error('Get EMR notes error:', error)
    return NextResponse.json({ error: 'Failed to fetch EMR notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Only doctors can create EMR notes' }, { status: 403 })
    }

    const doctorProfile = await db.doctorProfile.findUnique({
      where: { userId: user.id },
    })
    if (!doctorProfile) {
      return NextResponse.json({ error: 'Doctor profile not found' }, { status: 400 })
    }

    const body = await request.json()
    const data = createEMRSchema.parse(body)

    // Get appointment to find patient
    const appointment = await db.appointment.findUnique({
      where: { id: data.appointmentId },
    })
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // Check if EMR already exists
    const existingEMR = await db.eMRNote.findUnique({
      where: { appointmentId: data.appointmentId },
    })
    if (existingEMR) {
      return NextResponse.json({ error: 'EMR note already exists for this appointment' }, { status: 400 })
    }

    const emrNote = await db.eMRNote.create({
      data: {
        appointmentId: data.appointmentId,
        patientId: appointment.patientId,
        doctorId: doctorProfile.id,
        chiefComplaint: data.chiefComplaint,
        presentIllness: data.presentIllness,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        vitalSigns: data.vitalSigns ? JSON.stringify(data.vitalSigns) : null,
      },
    })

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'EMR_CREATED',
        entityType: 'EMRNote',
        entityId: emrNote.id,
        details: JSON.stringify({ appointmentId: data.appointmentId, patientId: appointment.patientId }),
      },
    })

    return NextResponse.json({ emrNote, message: 'EMR note created successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error('Create EMR note error:', error)
    return NextResponse.json({ error: 'Failed to create EMR note' }, { status: 500 })
  }
}
