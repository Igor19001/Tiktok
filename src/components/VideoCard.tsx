'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, Music, Volume2, VolumeX, Trash2 } from 'lucide-react'
import CommentsSheet from './CommentsSheet'
import { useSession } from 'next-auth/react'

interface VideoData {
  id: string
  filePath: string
  thumbnail: string | null
  caption: string | null
  musicName: string | null
  views: number
  likeCount: number
  liked: boolean
  commentCount: number
  createdAt: string
  user: { id: string; username: string; displayName: string; avatar: string | null }
}

interface Props {
  video: VideoData
  isActive: boolean
  onDelete?: (id: string) => void
}

function formatCount(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export default function VideoCard({ video, isActive, onDelete }: Props) {
  const { data: session } = useSession()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [liked, setLiked] = useState(video.liked)
  const [likeCount, setLikeCount] = useState(video.likeCount)
  const [commentCount, setCommentCount] = useState(video.commentCount)
  const [muted, setMuted] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [paused, setPaused] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 })
  const viewedRef = useRef(false)
  const likeInFlight = useRef(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (isActive) {
      el.play().catch(() => {})
      if (!viewedRef.current) {
        viewedRef.current = true
        fetch(`/api/videos/${video.id}/view`, { method: 'POST' }).catch(() => {})
      }
    } else {
      el.pause()
      el.currentTime = 0
    }
  }, [isActive, video.id])

  const toggleLike = useCallback(async () => {
    if (likeInFlight.current) return
    likeInFlight.current = true
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount((c) => c + (newLiked ? 1 : -1))
    try {
      const res = await fetch(`/api/videos/${video.id}/like`, { method: 'POST' })
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount(data.count)
    } catch {
      setLiked(!newLiked)
      setLikeCount((c) => c + (newLiked ? -1 : 1))
    } finally {
      likeInFlight.current = false
    }
  }, [liked, video.id])

  const handleDoubleTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!liked) {
        toggleLike()
      }
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setHeartPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 1000)
    },
    [liked, toggleLike]
  )

  const handleTap = useCallback(() => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play().catch(() => {})
      setPaused(false)
    } else {
      el.pause()
      setPaused(true)
    }
  }, [])

  const shareVideo = async () => {
    const url = `${window.location.origin}/video/${video.id}`
    if (navigator.share) {
      await navigator.share({ title: video.caption || 'MyTok', url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('Link skopiowany!')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Usunąć ten film?')) return
    await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
    onDelete?.(video.id)
  }

  const isOwner = session?.user?.id === video.user.id

  return (
    <div className="feed-item bg-black select-none">
      <div
        className="absolute inset-0"
        onClick={handleTap}
        onDoubleClick={handleDoubleTap}
      >
        <video
          ref={videoRef}
          src={video.filePath}
          loop
          muted={muted}
          playsInline
          poster={video.thumbnail || undefined}
          className="w-full h-full object-cover"
          preload={isActive ? 'auto' : 'metadata'}
        />

        {paused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {showHeart && (
          <div
            className="absolute float-heart pointer-events-none"
            style={{ left: heartPos.x - 40, top: heartPos.y - 40 }}
          >
            <Heart size={80} className="text-[#fe2c55]" fill="#fe2c55" />
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }} />

      <div className="absolute bottom-4 left-4 right-16 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex-shrink-0">
            {video.user.avatar ? (
              <Image src={video.user.avatar} alt={video.user.displayName} width={32} height={32} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                {video.user.displayName[0]}
              </div>
            )}
          </div>
          <span className="font-semibold text-sm text-white drop-shadow">@{video.user.username}</span>
        </div>
        {video.caption && (
          <p className="text-sm text-white drop-shadow line-clamp-2">{video.caption}</p>
        )}
        {video.musicName && (
          <div className="flex items-center gap-1 mt-1">
            <Music size={12} className="text-white/80" />
            <span className="text-xs text-white/80 truncate max-w-[200px]">{video.musicName}</span>
          </div>
        )}
      </div>

      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-5">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1">
          <div className={`w-10 h-10 flex items-center justify-center ${liked ? 'heart-pop' : ''}`}>
            <Heart
              size={28}
              fill={liked ? '#fe2c55' : 'transparent'}
              className={liked ? 'text-[#fe2c55]' : 'text-white'}
              strokeWidth={2}
            />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">{formatCount(likeCount)}</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); setShowComments(true) }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <MessageCircle size={28} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">{formatCount(commentCount)}</span>
        </button>

        <button onClick={shareVideo} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 flex items-center justify-center">
            <Share2 size={26} className="text-white" strokeWidth={2} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">Udostępnij</span>
        </button>

        {isOwner && (
          <button onClick={handleDelete} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 flex items-center justify-center">
              <Trash2 size={24} className="text-white/70" strokeWidth={2} />
            </div>
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); setMuted((m) => !m) }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            {muted
              ? <VolumeX size={26} className="text-white" strokeWidth={2} />
              : <Volume2 size={26} className="text-white" strokeWidth={2} />
            }
          </div>
        </button>

        {video.musicName && (
          <div className="w-10 h-10 rounded-full border-2 border-white/30 bg-[#161823] flex items-center justify-center spin-slow">
            <Music size={14} className="text-white" />
          </div>
        )}
      </div>

      {showComments && (
        <CommentsSheet
          videoId={video.id}
          onClose={() => { setShowComments(false); setCommentCount((c) => c) }}
        />
      )}
    </div>
  )
}
