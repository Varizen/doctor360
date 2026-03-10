import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get counts based on role
    let stats: any = {}

    if (user.role === 'ADMIN') {
      const [
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        totalRevenue,
        recentAppointments,
        appointmentsByStatus,
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { role: 'PATIENT' } }),
        db.user.count({ where: { role: 'DOCTOR' } }),
        db.appointment.count(),
        db.appointment.count({ where: { status: 'COMPLETED' } }),
        db.payment.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        }),
        db.appointment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: { select: { name: true } },
            doctor: { include: { user: { select: { name: true } } } },
          },
        }),
        db.appointment.groupBy({
          by: ['status'],
          _count: true,
        }),
      ])

      stats = {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentAppointments,
        appointmentsByStatus,
      }
    } else if (user.role === 'DOCTOR') {
      const doctorProfile = await db.doctorProfile.findUnique({
        where: { userId: user.id },
      })

      if (doctorProfile) {
        const [
          todayAppointments,
          pendingAppointments,
          completedConsultations,
          totalPatients,
          upcomingAppointments,
        ] = await Promise.all([
          db.appointment.count({
            where: {
              doctorId: doctorProfile.id,
              date: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
                lt: new Date(new Date().setHours(23, 59, 59, 999)),
              },
            },
          }),
          db.appointment.count({
            where: { doctorId: doctorProfile.id, status: 'CONFIRMED' },
          }),
          db.appointment.count({
            where: { doctorId: doctorProfile.id, status: 'COMPLETED' },
          }),
          db.appointment.groupBy({
            by: ['patientId'],
            where: { doctorId: doctorProfile.id },
          }).then(r => r.length),
          db.appointment.findMany({
            where: {
              doctorId: doctorProfile.id,
              status: 'CONFIRMED',
              date: { gte: new Date() },
            },
            take: 5,
            orderBy: { date: 'asc' },
            include: {
              patient: { select: { id: true, name: true, image: true } },
            },
          }),
        ])

        stats = {
          todayAppointments,
          pendingAppointments,
          completedConsultations,
          totalPatients,
          upcomingAppointments,
        }
      }
    } else if (user.role === 'PATIENT') {
      const [
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        pendingPayments,
        recentEMRNotes,
        prescriptions,
      ] = await Promise.all([
        db.appointment.count({ where: { patientId: user.id } }),
        db.appointment.findMany({
          where: {
            patientId: user.id,
            status: 'CONFIRMED',
            date: { gte: new Date() },
          },
          take: 5,
          orderBy: { date: 'asc' },
          include: {
            doctor: { include: { user: { select: { name: true, image: true } } } },
          },
        }),
        db.appointment.count({
          where: { patientId: user.id, status: 'COMPLETED' },
        }),
        db.payment.count({
          where: { patientId: user.id, status: 'PENDING' },
        }),
        db.eMRNote.findMany({
          where: { patientId: user.id },
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: { include: { user: { select: { name: true } } } },
          },
        }),
        db.prescription.count({ where: { patientId: user.id } }),
      ])

      stats = {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        pendingPayments,
        recentEMRNotes,
        prescriptions,
      }
    }

    return NextResponse.json({ stats, user })
  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
