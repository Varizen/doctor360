import { Redis } from '@upstash/redis'

// Initialize Redis client for Upstash
// This works in both Vercel serverless functions and Edge runtime
let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      console.warn('Upstash Redis credentials not found. Using in-memory fallback.')
      // Return a mock client for development
      return createMockRedis()
    }

    redis = new Redis({
      url,
      token,
    })
  }

  return redis
}

// Mock Redis client for local development without Upstash
function createMockRedis(): Redis {
  const store = new Map<string, { value: string; expires?: number }>()
  
  return {
    async get<T = unknown>(key: string): Promise<T | null> {
      const item = store.get(key)
      if (!item) return null
      if (item.expires && item.expires < Date.now()) {
        store.delete(key)
        return null
      }
      return JSON.parse(item.value) as T
    },
    
    async set(key: string, value: unknown, options?: { ex?: number }): Promise<'OK'> {
      const expires = options?.ex ? Date.now() + options.ex * 1000 : undefined
      store.set(key, { value: JSON.stringify(value), expires })
      return 'OK'
    },
    
    async del(key: string): Promise<number> {
      return store.delete(key) ? 1 : 0
    },
    
    async expire(key: string, seconds: number): Promise<number> {
      const item = store.get(key)
      if (!item) return 0
      item.expires = Date.now() + seconds * 1000
      return 1
    },
    
    async ttl(key: string): Promise<number> {
      const item = store.get(key)
      if (!item) return -2
      if (!item.expires) return -1
      const ttl = Math.floor((item.expires - Date.now()) / 1000)
      return ttl > 0 ? ttl : -2
    },
  } as unknown as Redis
}

// Session management helpers
const SESSION_PREFIX = 'session:'
const SESSION_EXPIRY = 7 * 24 * 60 * 60 // 7 days in seconds

export async function createRedisSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID()
  const client = getRedisClient()
  
  await client.set(
    `${SESSION_PREFIX}${sessionId}`,
    { userId, createdAt: Date.now() },
    { ex: SESSION_EXPIRY }
  )
  
  return sessionId
}

export async function getRedisSession(sessionId: string): Promise<{ userId: string } | null> {
  const client = getRedisClient()
  const session = await client.get<{ userId: string }>(`${SESSION_PREFIX}${sessionId}`)
  return session
}

export async function deleteRedisSession(sessionId: string): Promise<void> {
  const client = getRedisClient()
  await client.del(`${SESSION_PREFIX}${sessionId}`)
}

export async function extendRedisSession(sessionId: string): Promise<void> {
  const client = getRedisClient()
  await client.expire(`${SESSION_PREFIX}${sessionId}`, SESSION_EXPIRY)
}
