import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const existing = await prisma.user.count()
  if (existing > 0) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 })
  }
  const { username, displayName, password } = await req.json()
  if (!username || !displayName || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { username, displayName, passwordHash },
  })
  return NextResponse.json({ id: user.id, username: user.username })
}
