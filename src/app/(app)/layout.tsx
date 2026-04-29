import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="h-full flex flex-col bg-black">
      <main className="flex-1 overflow-hidden pb-14">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
