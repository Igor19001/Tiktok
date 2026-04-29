'use client'

import Image from 'next/image'
import { Play, Heart } from 'lucide-react'

interface VideoItem {
  id: string
  thumbnail: string | null
  views: number
  likeCount: number
  caption: string | null
}

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export default function VideoGrid({ videos, onVideoClick }: {
  videos: VideoItem[]
  onVideoClick?: (id: string) => void
}) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/40">
        <Play size={40} strokeWidth={1} />
        <p className="mt-3 text-sm">Brak filmów</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-0.5">
      {videos.map((v) => (
        <button
          key={v.id}
          onClick={() => onVideoClick?.(v.id)}
          className="relative aspect-[9/16] bg-white/5 overflow-hidden"
        >
          {v.thumbnail ? (
            <Image src={v.thumbnail} alt={v.caption || ''} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center">
              <Play size={20} className="text-white/40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-1 flex items-center gap-1"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}>
            <Play size={12} fill="white" className="text-white" />
            <span className="text-white text-xs font-semibold">{formatCount(v.views)}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
