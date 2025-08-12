import { NextResponse } from 'next/server'
import { sendOtpSMS } from '@/lib/twilio'
import { prisma } from '@/lib/prisma'

function generateOtp(){ return Math.floor(100000 + Math.random()*900000).toString() }

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Phone required' }, { status: 400 })

    const otp = generateOtp()
    // NOTE: For a proper setup, store hashed OTP with TTL in Redis. Here we log and (optionally) save to DB for demo.
    console.log('[OTP] generated for', phone, otp)
    await sendOtpSMS(phone, otp)

    // Upsert user
    let user = await prisma.user.findUnique({ where: { phone } })
    if (!user) user = await prisma.user.create({ data: { phone } })

    return NextResponse.json({ ok: true })
  } catch (err:any) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
