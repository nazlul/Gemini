import { NextResponse } from 'next/server'
import { sendOtpSMS } from '@/lib/twilio'
import { setOTP, checkRateLimit } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

function generateOtp() { return Math.floor(100000 + Math.random() * 900000).toString() }

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

    // Rate limiting
    if (!(await checkRateLimit(phone))) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    const otp = generateOtp()
    
    // Store OTP in Redis with TTL
    await setOTP(phone, otp)
    
    // Send SMS
    await sendOtpSMS(phone, otp)

    // Upsert user
    await prisma.user.upsert({
      where: { phone }, create: { phone }, update: {}
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('OTP send error:', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
