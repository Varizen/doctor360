import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

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
    
    // Verify user has access to this consultation
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, image: true } },
        doctor: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 })
    }

    // Check access
    const isPatient = user.role === 'PATIENT' && appointment.patientId === user.id
    let isDoctor = false
    if (user.role === 'DOCTOR') {
      const doctorProfile = await db.doctorProfile.findUnique({
        where: { userId: user.id },
      })
      isDoctor = !!doctorProfile && appointment.doctorId === doctorProfile.id
    }

    if (!isPatient && !isDoctor && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Return consultation details with session token
    return NextResponse.json({
      consultation: {
        id: appointment.id,
        sessionToken: appointment.sessionToken,
        date: appointment.date,
        type: appointment.type,
        status: appointment.status,
        patient: appointment.patient,
        doctor: appointment.doctor,
      },
    })
  } catch (error) {
    console.error('Get consultation error:', error)
    return NextResponse.json({ error: 'Failed to fetch consultation' }, { status: 500 })
  }
}
