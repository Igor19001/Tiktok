import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: videoId } = await params
  const userId = session.user.id

  const existing = await prisma.like.findUnique({
    where: { userId_videoId: { userId, videoId } },
  })

  if (existing) {
    await prisma.like.delete({ where: { userId_videoId: { userId, videoId } } })
    const count = await prisma.like.count({ where: { videoId } })
    return NextResponse.json({ liked: false, count })
  }

  await prisma.like.create({ data: { userId, videoId } })

  const video = await prisma.video.findUnique({ where: { id: videoId }, select: { userId: true } })
  if (video && video.userId !== userId) {
    await prisma.notification.create({
      data: { recipientId: video.userId, senderId: userId, videoId, type: 'like' },
    })
  }

  const count = await prisma.like.count({ where: { videoId } })
  return NextResponse.json({ liked: true, count })
}
