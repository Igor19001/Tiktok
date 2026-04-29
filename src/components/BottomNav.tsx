'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, User, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => setUnread(d.unreadCount || 0))
      .catch(() => {})
  }, [pathname])

  const links = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/upload', icon: Plus, label: 'Upload', special: true },
    { href: '/notifications', icon: Bell, label: 'Inbox', badge: unread },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-white/10 h-14 flex items-center justify-around px-2">
      {links.map(({ href, icon: Icon, label, special, badge }) =>
        special ? (
          <Link key={href} href={href} className="flex items-center justify-center">
            <span className="flex items-center justify-center w-11 h-8 rounded-md bg-white/10 border border-white/20">
              <span className="flex items-center">
                <span className="w-5 h-5 rounded-sm bg-[#25f4ee] flex items-center justify-center" style={{ marginRight: -2 }}>
                  <Plus size={14} color="#000" strokeWidth={3} />
                </span>
                <span className="w-5 h-5 rounded-sm bg-[#fe2c55] flex items-center justify-center" style={{ marginLeft: -2 }}>
                  <Plus size={14} color="#fff" strokeWidth={3} />
                </span>
              </span>
            </span>
          </Link>
        ) : (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 min-w-[56px] py-1 ${
              pathname === href ? 'text-white' : 'text-white/50'
            }`}
          >
            <span className="relative">
              <Icon size={24} strokeWidth={pathname === href ? 2.5 : 1.5} />
              {badge ? (
                <span className="absolute -top-1 -right-1 bg-[#fe2c55] text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {badge > 99 ? '99+' : badge}
                </span>
              ) : null}
            </span>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      )}
    </nav>
  )
}
