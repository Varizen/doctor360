import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Save AI chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, patientId, assistantType, messages, assessmentResult } = body

    // Create or update chat session
    const session = await db.aIChatSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        patientId,
        assistantType: assistantType?.toUpperCase() || 'ROMJAN',
        status: 'COMPLETED',
        primarySymptom: assessmentResult?.primarySymptom,
        symptoms: JSON.stringify(assessmentResult?.symptoms || []),
        assessmentResult: JSON.stringify(assessmentResult || {}),
        urgencyLevel: assessmentResult?.urgency || 'LOW',
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        primarySymptom: assessmentResult?.primarySymptom,
        symptoms: JSON.stringify(assessmentResult?.symptoms || []),
        assessmentResult: JSON.stringify(assessmentResult || {}),
        urgencyLevel: assessmentResult?.urgency || 'LOW',
        completedAt: new Date(),
      }
    })

    // Save messages
    if (messages && messages.length > 0) {
      for (const msg of messages) {
        await db.aIChatMessage.create({
          data: {
            sessionId: session.id,
            sender: msg.sender,
            message: msg.message,
            messageType: msg.type || 'text',
            metadata: JSON.stringify(msg.metadata || {}),
          }
        })
      }
    }

    // Save to central archive
    await db.centralArchive.create({
      data: {
        patientId,
        archiveType: 'chat_session',
        referenceId: session.id,
        data: JSON.stringify({
          session,
          messages,
          assessmentResult
        }),
      }
    })

    // If urgency is HIGH or EMERGENCY, find and assign a doctor
    if (assessmentResult?.urgency === 'HIGH' || assessmentResult?.urgency === 'EMERGENCY') {
      const specialty = assessmentResult.suggestedSpecialty
      
      // Find available doctor with matching specialty
      const doctor = await db.doctorProfile.findFirst({
        where: {
          specialization: specialty,
          isAvailable: true,
          isVerified: true,
        },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })

      if (doctor) {
        await db.aIChatSession.update({
          where: { id: session.id },
          data: {
            assignedDoctorId: doctor.id,
            status: assessmentResult.urgency === 'EMERGENCY' ? 'ESCALATED_TO_HOSPITAL' : 'ESCALATED_TO_DOCTOR'
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
      message: 'Chat session saved successfully'
    })
  } catch (error) {
    console.error('Error saving AI chat session:', error)
    return NextResponse.json(
      { error: 'Failed to save chat session' },
      { status: 500 }
    )
  }
}

// GET - Retrieve chat session history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      // Get specific session
      const session = await db.aIChatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          assignedDoctor: {
            include: {
              user: {
                select: { name: true, email: true, image: true }
              }
            }
          }
        }
      })
      return NextResponse.json(session)
    }

    if (patientId) {
      // Get all sessions for patient
      const sessions = await db.aIChatSession.findMany({
        where: { patientId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          },
          assignedDoctor: {
            include: {
              user: {
                select: { name: true, email: true, image: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
      return NextResponse.json(sessions)
    }

    return NextResponse.json({ error: 'Missing patientId or sessionId' }, { status: 400 })
  } catch (error) {
    console.error('Error retrieving chat sessions:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve chat sessions' },
      { status: 500 }
    )
  }
}
