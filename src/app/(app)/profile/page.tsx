'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { Edit2, LogOut, Grid, Heart, Camera } from 'lucide-react'
import VideoGrid from '@/components/VideoGrid'

interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string | null
  avatar: string | null
}

interface VideoItem {
  id: string
  thumbnail: string | null
  views: number
  likeCount: number
  caption: string | null
}

interface ProfileData {
  user: UserProfile
  stats: { videos: number; likes: number }
  videos: VideoItem[]
  likedVideos: VideoItem[]
}

function StatItem({ value, label }: { value: number; label: string }) {
  const fmt = (n: number) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-bold">{fmt(value)}</span>
      <span className="text-xs text-white/50">{label}</span>
    </div>
  )
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null)
  const [tab, setTab] = useState<'videos' | 'liked'>('videos')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ displayName: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  const load = () =>
    fetch('/api/profile').then((r) => r.json()).then(setData).catch(() => {})

  useEffect(() => { load() }, [])

  const startEdit = () => {
    if (!data) return
    setEditForm({ displayName: data.user.displayName, bio: data.user.bio || '' })
    setEditing(true)
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData()
    fd.append('displayName', editForm.displayName)
    fd.append('bio', editForm.bio)
    const avatarFile = avatarRef.current?.files?.[0]
    if (avatarFile) fd.append('avatar', avatarFile)
    await fetch('/api/profile', { method: 'PATCH', body: fd })
    setSaving(false)
    setEditing(false)
    load()
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  const { user, stats, videos, likedVideos } = data

  return (
    <div className="h-full overflow-y-auto bg-black">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="font-semibold text-base">@{user.username}</h1>
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 text-white/60 hover:text-white">
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 px-4 pb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/10 overflow-hidden">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.displayName} width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                  {user.displayName[0]}
                </div>
              )}
            </div>
            {editing && (
              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#fe2c55] flex items-center justify-center"
              >
                <Camera size={13} />
              </button>
            )}
          </div>

          <div className="text-center">
            <h2 className="font-bold text-lg">{user.displayName}</h2>
            {user.bio && <p className="text-sm text-white/60 mt-1 max-w-[280px]">{user.bio}</p>}
          </div>

          <div className="flex gap-8">
            <StatItem value={stats.videos} label="Filmy" />
            <StatItem value={stats.likes} label="Polubień" />
          </div>

          {!editing ? (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 border border-white/30 text-white text-sm font-semibold px-6 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Edit2 size={14} />
              Edytuj profil
            </button>
          ) : (
            <form onSubmit={saveProfile} className="w-full space-y-3">
              <input
                value={editForm.displayName}
                onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Wyświetlana nazwa"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-white/40"
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Bio..."
                rows={2}
                maxLength={150}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm outline-none resize-none focus:border-white/40"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-white/30 text-sm font-semibold py-2.5 rounded-lg">
                  Anuluj
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#fe2c55] text-sm font-semibold py-2.5 rounded-lg disabled:opacity-50">
                  {saving ? 'Zapisywanie...' : 'Zapisz'}
                </button>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" />
            </form>
          )}
        </div>

        <div className="flex border-b border-white/10">
          {[
            { id: 'videos', icon: Grid, label: 'Filmy' },
            { id: 'liked', icon: Heart, label: 'Polubione' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id as 'videos' | 'liked')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === id ? 'border-white text-white' : 'border-transparent text-white/40'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <VideoGrid
          videos={tab === 'videos' ? videos : likedVideos}
        />
      </div>
    </div>
  )
}
