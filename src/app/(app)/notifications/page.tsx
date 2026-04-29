'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Bell } from 'lucide-react'

interface Notif {
  id: string
  type: string
  read: boolean
  createdAt: string
  sender: { id: string; username: string; displayName: string; avatar: string | null } | null
  video: { id: string; thumbnail: string | null; caption: string | null } | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false))

    fetch('/api/notifications', { method: 'PATCH' }).catch(() => {})
  }, [])

  const typeText = (type: string) => {
    if (type === 'like') return 'polubił(a) Twój film'
    if (type === 'comment') return 'skomentował(a) Twój film'
    return type
  }

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'like') return <Heart size={14} fill="#fe2c55" className="text-[#fe2c55]" />
    if (type === 'comment') return <MessageCircle size={14} className="text-[#25f4ee]" />
    return <Bell size={14} />
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-black">
      <div className="max-w-lg mx-auto">
        <div className="px-4 py-4 border-b border-white/10">
          <h1 className="font-bold text-lg">Powiadomienia</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-3">
            <Bell size={40} strokeWidth={1} />
            <p className="text-sm">Brak powiadomień</p>
          </div>
        ) : (
          <div>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-center gap-3 px-4 py-3 border-b border-white/5 ${!n.read ? 'bg-white/5' : ''}`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                    {n.sender?.avatar ? (
                      <Image src={n.sender.avatar} alt={n.sender.displayName} width={40} height={40} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                        {n.sender?.displayName?.[0] ?? '?'}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <TypeIcon type={n.type} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">{n.sender?.displayName ?? 'Ktoś'}</span>{' '}
                    <span className="text-white/70">{typeText(n.type)}</span>
                  </p>
                  {n.video?.caption && (
                    <p className="text-xs text-white/40 truncate mt-0.5">{n.video.caption}</p>
                  )}
                  <p className="text-xs text-white/30 mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString('pl-PL', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {n.video?.thumbnail && (
                  <div className="w-10 h-14 rounded bg-white/10 overflow-hidden flex-shrink-0">
                    <Image src={n.video.thumbnail} alt="" width={40} height={56} className="object-cover w-full h-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
