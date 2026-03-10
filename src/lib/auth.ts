import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { User, UserRole } from '@prisma/client'
import {
  createRedisSession,
  getRedisSession,
  deleteRedisSession,
} from '@/lib/redis'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  image?: string | null
}

export interface AuthResult {
  success: boolean
  user?: SessionUser
  error?: string
}

const SESSION_COOKIE = 'doctor360_session'
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Session management using Redis (Upstash)
export async function createSession(userId: string): Promise<string> {
  return createRedisSession(userId)
}

export async function getSession(sessionId: string): Promise<{ userId: string } | null> {
  return getRedisSession(sessionId)
}

export async function deleteSession(sessionId: string): Promise<void> {
  return deleteRedisSession(sessionId)
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  
  if (!sessionId) return null
  
  const session = await getSession(sessionId)
  if (!session) return null
  
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
    },
  })
  
  return user
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const user = await db.user.findUnique({
    where: { email },
  })
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }
  
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return { success: false, error: 'Invalid email or password' }
  }
  
  const sessionId = await createSession(user.id)
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY / 1000,
  })
  
  // Log audit
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
    },
  })
  
  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    },
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value
  
  if (sessionId) {
    const session = await getSession(sessionId)
    if (session) {
      await db.auditLog.create({
        data: {
          userId: session.userId,
          action: 'LOGOUT',
          entityType: 'User',
        },
      })
    }
    await deleteSession(sessionId)
  }
  
  cookieStore.delete(SESSION_COOKIE)
}

export async function register(data: {
  email: string
  password: string
  name: string
  role?: UserRole
  phone?: string
  dateOfBirth?: string
  gender?: string
}): Promise<AuthResult> {
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  })
  
  if (existingUser) {
    return { success: false, error: 'Email already registered' }
  }
  
  const hashedPassword = await hashPassword(data.password)
  
  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || 'PATIENT',
      emailVerified: new Date(),
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      patientProfile: data.role === 'PATIENT' || !data.role ? {
        create: {
          phone: data.phone,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender,
        },
      } : undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
    },
  })
  
  // Log audit
  await db.auditLog.create({
    data: {
      userId: user.id,
      action: 'REGISTER',
      entityType: 'User',
      entityId: user.id,
    },
  })
  
  const sessionId = await createSession(user.id)
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY / 1000,
  })
  
  return { success: true, user }
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  
  return user
}
