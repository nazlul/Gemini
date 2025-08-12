import { NextResponse } from 'next/server'
import { getOTP, deleteOTP } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json()
    if (!phone || !code) return NextResponse.json({ error: 'Phone and code required' }, { status: 400 })

    // Development bypass
    if (process.env.DEV_ALLOW_ANY_OTP === '1' && (code === '123456' || code === '000000')) {
      const user = await prisma.user.upsert({
        where: { phone }, create: { phone }, update: {}
      })
      return NextResponse.json({ success: true, user })
    }

    // Production: Validate against Redis
    const storedOTP = await getOTP(phone)
    if (!storedOTP || storedOTP !== code) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    // Delete OTP after successful verification
    await deleteOTP(phone)

    const user = await prisma.user.upsert({
      where: { phone }, create: { phone }, update: {}
    })

    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    console.error('OTP verify error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
