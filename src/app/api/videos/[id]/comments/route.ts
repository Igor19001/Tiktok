import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: videoId } = await params
  const comments = await prisma.comment.findMany({
    where: { videoId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
  })
  return NextResponse.json(comments)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: videoId } = await params
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'Empty comment' }, { status: 400 })

  const userId = session.user.id
  const comment = await prisma.comment.create({
    data: { userId, videoId, text: text.trim() },
    include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
  })

  const video = await prisma.video.findUnique({ where: { id: videoId }, select: { userId: true } })
  if (video && video.userId !== userId) {
    await prisma.notification.create({
      data: { recipientId: video.userId, senderId: userId, videoId, type: 'comment' },
    })
  }

  return NextResponse.json(comment)
}
