import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'
import { NextRequest, NextResponse } from 'next/server'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface UploadResult {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

/**
 * Upload an image to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Folder to store the image (e.g., 'doctors', 'patients')
 * @param publicId - Optional custom public ID
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string = 'doctor360',
  publicId?: string
): Promise<UploadResult> {
  try {
    const uploadOptions: cloudinary.UploadApiOptions = {
      folder,
      resource_type: 'image',
      overwrite: true,
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    }

    if (publicId) {
      uploadOptions.public_id = publicId
    }

    // If file is a buffer, convert to base64 string
    const fileData = Buffer.isBuffer(file)
      ? `data:image/jpeg;base64,${file.toString('base64')}`
      : file

    const result = await cloudinary.uploader.upload(fileData, uploadOptions) as UploadApiResponse

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image
 */
export async function deleteImage(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await cloudinary.uploader.destroy(publicId)
    return { success: true }
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    }
  }
}

/**
 * Get optimized URL for an image
 * @param publicId - The public ID of the image
 * @param options - Transformation options
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: 'fill' | 'scale' | 'fit' | 'thumb'
    format?: 'auto' | 'jpg' | 'png' | 'webp'
  } = {}
): string {
  const { width, height, crop = 'fill', format = 'auto' } = options

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      {
        width,
        height,
        crop,
        fetch_format: format,
        quality: 'auto:good',
      },
    ],
  })
}

/**
 * API handler for file uploads
 */
export async function handleUploadRequest(
  request: NextRequest,
  folder: string = 'doctor360'
): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadImage(buffer, folder)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
    })
  } catch (error) {
    console.error('Upload handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export configured cloudinary instance
export { cloudinary }
