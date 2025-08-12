import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const roomId = url.searchParams.get('roomId')
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 })
  const messages = await prisma.message.findMany({ where: { chatroomId: roomId }, orderBy: { timestamp: 'asc' } })
  return NextResponse.json(messages)
}

export async function POST(req: Request) {
  try {
    const { roomId, message } = await req.json()
    if (!roomId || !message) return NextResponse.json({ error: 'Missing' }, { status: 400 })
    const created = await prisma.message.create({
      data: {
        text: message.text || null,
        imageUrl: message.image || null,
        sender: message.sender || 'user',
        chatroom: { connect: { id: roomId } }
      }
    })
    return NextResponse.json(created, { status: 201 })
  } catch (err:any) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
