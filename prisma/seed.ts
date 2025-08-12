import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main(){
  const u = await prisma.user.upsert({ where: { phone: '+10000000000' }, update: {}, create: { phone: '+10000000000' } })
  const room = await prisma.chatroom.create({ data: { name: 'Welcome', ownerId: u.id } })
  await prisma.message.create({ data: { text: 'Welcome to Gemini!', sender: 'ai', chatroomId: room.id } })
  console.log('Seed done')
}
main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
