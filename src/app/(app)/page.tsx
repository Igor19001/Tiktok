'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import VideoCard from '@/components/VideoCard'

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

export default function FeedPage() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const loadVideos = useCallback(async (cursor?: string) => {
    if (loading) return
    setLoading(true)
    try {
      const url = cursor ? `/api/videos?cursor=${cursor}` : '/api/videos'
      const res = await fetch(url)
      const data = await res.json()
      setVideos((v) => cursor ? [...v, ...data.videos] : data.videos)
      setNextCursor(data.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [loading])

  useEffect(() => {
    loadVideos()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = itemRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) setActiveIndex(idx)
          }
        })
      },
      { threshold: 0.6, root: container }
    )

    itemRefs.current.forEach((el) => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [videos])

  useEffect(() => {
    if (activeIndex === videos.length - 2 && nextCursor && !loading) {
      loadVideos(nextCursor)
    }
  }, [activeIndex, videos.length, nextCursor, loading, loadVideos])

  const handleDelete = (id: string) => {
    setVideos((v) => v.filter((vid) => vid.id !== id))
  }

  if (!loading && videos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/40 gap-4 px-6 text-center">
        <div className="text-6xl">🎬</div>
        <h2 className="text-xl font-bold text-white/60">Brak filmów</h2>
        <p className="text-sm">Dodaj swój pierwszy film, klikając przycisk + poniżej.</p>
      </div>
    )
  }

  return (
    <div className="feed-container" ref={containerRef}>
      {videos.map((video, idx) => (
        <div
          key={video.id}
          ref={(el) => { itemRefs.current[idx] = el }}
          className="feed-item"
        >
          <VideoCard
            video={video}
            isActive={idx === activeIndex}
            onDelete={handleDelete}
          />
        </div>
      ))}
      {loading && (
        <div className="feed-item flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
