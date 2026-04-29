import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      sender: { select: { id: true, username: true, displayName: true, avatar: true } },
      video: { select: { id: true, thumbnail: true, caption: true } },
    },
  })

  const unreadCount = await prisma.notification.count({
    where: { recipientId: session.user.id, read: false },
  })

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, read: false },
    data: { read: true },
  })

  return NextResponse.json({ ok: true })
}
