import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor')
  const limit = 10

  const videos = await prisma.video.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatar: true } },
      likes: { select: { userId: true } },
      _count: { select: { comments: true } },
    },
  })

  const userId = session.user.id
  const hasMore = videos.length > limit
  const items = videos.slice(0, limit).map((v) => ({
    ...v,
    likeCount: v.likes.length,
    liked: v.likes.some((l) => l.userId === userId),
    commentCount: v._count.comments,
    likes: undefined,
    _count: undefined,
  }))

  return NextResponse.json({
    videos: items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  })
}
