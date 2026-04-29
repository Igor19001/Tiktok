import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import path from 'path'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const video = await prisma.video.findUnique({ where: { id } })
  if (!video) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (video.userId !== session.user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const fileFull = path.join(process.cwd(), 'public', video.filePath)
    await unlink(fileFull)
  } catch {}
  if (video.thumbnail) {
    try {
      const thumbFull = path.join(process.cwd(), 'public', video.thumbnail)
      await unlink(thumbFull)
    } catch {}
  }

  await prisma.video.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
