import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

async function generateThumbnail(videoPath: string, thumbPath: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ffmpeg = require('fluent-ffmpeg')
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const ffmpegStatic = require('ffmpeg-static')
      ffmpeg.setFfmpegPath(ffmpegStatic)

      const dir = path.dirname(thumbPath)
      const filename = path.basename(thumbPath)

      ffmpeg(videoPath)
        .on('end', () => resolve())
        .on('error', () => resolve())
        .screenshots({
          timestamps: ['00:00:01'],
          filename,
          folder: dir,
          size: '540x960',
        })
    } catch {
      resolve()
    }
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('video') as File | null
  const caption = (formData.get('caption') as string) || ''
  const musicName = (formData.get('musicName') as string) || ''

  if (!file) return NextResponse.json({ error: 'No video file' }, { status: 400 })

  const MAX_SIZE = 200 * 1024 * 1024
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 200MB)' }, { status: 413 })

  const ext = file.name.split('.').pop() || 'mp4'
  const id = randomUUID()
  const filename = `${id}.${ext}`
  const thumbFilename = `${id}.jpg`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos')
  const thumbDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails')
  await mkdir(uploadDir, { recursive: true })
  await mkdir(thumbDir, { recursive: true })

  const videoPath = path.join(uploadDir, filename)
  const thumbPath = path.join(thumbDir, thumbFilename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(videoPath, buffer)

  await generateThumbnail(videoPath, thumbPath)

  const { existsSync } = await import('fs')
  const hasThumbnail = existsSync(thumbPath)

  const video = await prisma.video.create({
    data: {
      userId: session.user.id,
      filePath: `/uploads/videos/${filename}`,
      thumbnail: hasThumbnail ? `/uploads/thumbnails/${thumbFilename}` : null,
      caption,
      musicName: musicName || null,
    },
  })

  return NextResponse.json(video)
}
