import { createClient } from 'redis'

const client = createClient({ url: process.env.REDIS_URL })
client.on('error', err => console.error('Redis error:', err))

export async function setOTP(phone: string, code: string) {
  await client.connect()
  await client.setEx(`otp:${phone}`, 300, code) // 5 min TTL
  await client.disconnect()
}

export async function getOTP(phone: string): Promise<string | null> {
  await client.connect()
  const code = await client.get(`otp:${phone}`)
  await client.disconnect()
  return code
}

export async function deleteOTP(phone: string) {
  await client.connect()
  await client.del(`otp:${phone}`)
  await client.disconnect()
}

export async function checkRateLimit(phone: string): Promise<boolean> {
  await client.connect()
  const key = `rate:${phone}`
  const count = await client.incr(key)
  if (count === 1) await client.expire(key, 3600) // 1 hour
  await client.disconnect()
  return count <= 3 // Max 3 attempts per hour
}