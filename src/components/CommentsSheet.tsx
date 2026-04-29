'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Send } from 'lucide-react'
import Image from 'next/image'

interface Comment {
  id: string
  text: string
  createdAt: string
  user: { id: string; username: string; displayName: string; avatar: string | null }
}

interface Props {
  videoId: string
  onClose: () => void
}

export default function CommentsSheet({ videoId, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {})
  }, [videoId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const comment = await res.json()
      setComments((c) => [...c, comment])
      setText('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1c1c1c] rounded-t-2xl flex flex-col" style={{ height: '70vh' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="font-semibold text-sm">{comments.length} komentarzy</span>
          <button onClick={onClose} className="p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          {comments.length === 0 && (
            <p className="text-center text-white/40 text-sm mt-8">Brak komentarzy. Napisz pierwszy!</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                {c.user.avatar ? (
                  <Image src={c.user.avatar} alt={c.user.displayName} width={32} height={32} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                    {c.user.displayName[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white/70">{c.user.displayName}</p>
                <p className="text-sm mt-0.5">{c.text}</p>
                <p className="text-xs text-white/40 mt-1">
                  {new Date(c.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={submit} className="px-4 py-3 border-t border-white/10 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Napisz komentarz..."
            className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none placeholder:text-white/40"
            maxLength={300}
          />
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="p-2 rounded-full bg-[#fe2c55] disabled:opacity-40 transition-opacity"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
