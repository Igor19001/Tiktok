import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, displayName: true, bio: true, avatar: true, createdAt: true },
  })

  const videoCount = await prisma.video.count({ where: { userId: session.user.id } })
  const likeCount = await prisma.like.count({ where: { video: { userId: session.user.id } } })

  const videos = await prisma.video.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      likes: { select: { userId: true } },
      _count: { select: { comments: true } },
    },
  })

  const likedVideos = await prisma.like.findMany({
    where: { userId: session.user.id },
    include: {
      video: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatar: true } },
          likes: { select: { userId: true } },
          _count: { select: { comments: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const userId = session.user.id

  return NextResponse.json({
    user,
    stats: { videos: videoCount, likes: likeCount },
    videos: videos.map((v) => ({
      ...v,
      likeCount: v.likes.length,
      liked: v.likes.some((l) => l.userId === userId),
      commentCount: v._count.comments,
      likes: undefined,
      _count: undefined,
    })),
    likedVideos: likedVideos.map((l) => ({
      ...l.video,
      likeCount: l.video.likes.length,
      liked: l.video.likes.some((lk) => lk.userId === userId),
      commentCount: l.video._count.comments,
      likes: undefined,
      _count: undefined,
    })),
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const displayName = formData.get('displayName') as string
  const bio = formData.get('bio') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatarPath: string | undefined
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() || 'jpg'
    const filename = `${randomUUID()}.${ext}`
    const dir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    await mkdir(dir, { recursive: true })
    const buffer = Buffer.from(await avatarFile.arrayBuffer())
    await writeFile(path.join(dir, filename), buffer)
    avatarPath = `/uploads/avatars/${filename}`
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(displayName ? { displayName } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(avatarPath ? { avatar: avatarPath } : {}),
    },
    select: { id: true, username: true, displayName: true, bio: true, avatar: true },
  })

  return NextResponse.json(updated)
}
