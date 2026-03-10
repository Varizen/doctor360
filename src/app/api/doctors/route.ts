import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(request.url)
    const specialization = searchParams.get('specialization')
    const available = searchParams.get('available')
    
    const where: any = {}
    
    if (specialization) {
      where.specialization = { equals: specialization, mode: 'insensitive' }
    }
    
    if (available === 'true') {
      where.isAvailable = true
    }
    
    const doctors = await db.doctorProfile.findMany({
      where,
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
      orderBy: {
        user: { name: 'asc' },
      },
    })
    
    return NextResponse.json({ doctors })
  } catch (error) {
    console.error('Get doctors error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    )
  }
}
