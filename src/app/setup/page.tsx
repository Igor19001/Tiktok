'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', displayName: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Hasła nie są zgodne')
    if (form.password.length < 6) return setError('Hasło musi mieć min. 6 znaków')
    setLoading(true)
    const res = await fetch('/api/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, displayName: form.displayName, password: form.password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/login')
    } else {
      const d = await res.json()
      setError(d.error || 'Błąd konfiguracji')
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-[#25f4ee]">My</span>
            <span className="text-[#fe2c55]">Tok</span>
          </h1>
          <p className="text-white/50 text-sm mt-2">Pierwsze uruchomienie — utwórz konto</p>
        </div>

        <form onSubmit={handle} className="space-y-4">
          {[
            { key: 'username', label: 'Nazwa użytkownika', type: 'text', autocomplete: 'username' },
            { key: 'displayName', label: 'Wyświetlana nazwa', type: 'text', autocomplete: 'name' },
            { key: 'password', label: 'Hasło', type: 'password', autocomplete: 'new-password' },
            { key: 'confirm', label: 'Potwierdź hasło', type: 'password', autocomplete: 'new-password' },
          ].map(({ key, label, type, autocomplete }) => (
            <input
              key={key}
              type={type}
              value={form[key as keyof typeof form]}
              onChange={set(key as keyof typeof form)}
              placeholder={label}
              autoComplete={autocomplete}
              required
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/40 transition-colors"
            />
          ))}

          {error && <p className="text-[#fe2c55] text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fe2c55] hover:bg-[#e0253d] text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Tworzenie...' : 'Utwórz konto'}
          </button>
        </form>
      </div>
    </div>
  )
}
