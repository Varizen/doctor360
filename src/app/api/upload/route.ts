import { NextRequest } from 'next/server'
import { handleUploadRequest } from '@/lib/cloudinary'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Check authentication
  const user = await getCurrentUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Determine folder based on user role
  const folder = user.role === 'DOCTOR' ? 'doctor360/doctors' : 'doctor360/patients'

  return handleUploadRequest(request, folder)
}
