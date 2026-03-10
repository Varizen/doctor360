/**
 * Error Handling Utilities for Doctor360
 * Provides consistent error handling across the application
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter })
    this.name = 'RateLimitError'
  }
}

/**
 * Safe async wrapper for API routes
 */
export function asyncHandler<T>(
  fn: () => Promise<T>
): Promise<{ data: T | null; error: AppError | null }> {
  return fn()
    .then((data) => ({ data, error: null }))
    .catch((error) => {
      console.error('Async handler error:', error)
      
      if (error instanceof AppError) {
        return { data: null, error }
      }
      
      // Handle Prisma errors
      if (error.code === 'P2002') {
        return {
          data: null,
          error: new ConflictError('A record with this value already exists'),
        }
      }
      
      if (error.code === 'P2025') {
        return {
          data: null,
          error: new NotFoundError(),
        }
      }
      
      // Generic error
      return {
        data: null,
        error: new AppError(
          process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : error.message || 'Internal server error',
          500,
          'INTERNAL_ERROR'
        ),
      }
    })
}

/**
 * Validate required environment variables
 */
export function validateEnv(requiredVars: string[]): void {
  const missing = requiredVars.filter((key) => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file or Vercel environment variables.`
    )
  }
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  
  console.error({
    timestamp,
    context,
    error: errorMessage,
    stack: process.env.NODE_ENV === 'development' ? stack : undefined,
  })
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}
