import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {}

    if (user.role === 'PATIENT') {
      where.patientId = user.id
    }

    if (status) {
      where.status = status
    }

    const payments = await db.payment.findMany({
      where,
      include: {
        appointment: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
          },
        },
        patient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('Get payments error:', error)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Only patients can make payments' }, { status: 403 })
    }

    const body = await request.json()
    const { appointmentId } = body

    // Get the pending payment
    const payment = await db.payment.findUnique({
      where: { appointmentId },
      include: { appointment: true },
    })

    if (!payment || payment.patientId !== user.id) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 400 })
    }

    // Mock payment processing - always succeeds
    const updatedPayment = await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paymentMethod: 'Credit Card',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paidAt: new Date(),
      },
    })

    // Update appointment status
    await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
    })

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'PAYMENT_CREATED',
        entityType: 'Payment',
        entityId: payment.id,
        details: JSON.stringify({ amount: payment.amount, status: 'PAID' }),
      },
    })

    return NextResponse.json({ payment: updatedPayment, message: 'Payment successful' })
  } catch (error) {
    console.error('Process payment error:', error)
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 })
  }
}
