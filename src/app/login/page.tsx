'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Nieprawidłowy login lub hasło')
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="text-[#25f4ee]">My</span>
            <span className="text-[#fe2c55]">Tok</span>
          </h1>
          <p className="text-white/50 text-sm mt-2">Twoja prywatna platforma wideo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nazwa użytkownika"
              autoComplete="username"
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-colors"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło"
              autoComplete="current-password"
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-colors"
            />
          </div>

          {error && (
            <p className="text-[#fe2c55] text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fe2c55] hover:bg-[#e0253d] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-8">
          Nie masz konta?{' '}
          <a href="/setup" className="text-white/60 underline">
            Konfiguracja pierwszego uruchomienia
          </a>
        </p>
      </div>
    </div>
  )
}
