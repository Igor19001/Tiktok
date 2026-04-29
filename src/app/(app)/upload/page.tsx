'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Music, Film } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [musicName, setMusicName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('video/')) {
      alert('Wybierz plik wideo!')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const f = e.dataTransfer.files[0]
      if (f) handleFile(f)
    },
    [handleFile]
  )

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file || uploading) return
    setUploading(true)
    setProgress(10)

    const formData = new FormData()
    formData.append('video', file)
    formData.append('caption', caption)
    formData.append('musicName', musicName)

    try {
      const xhr = new XMLHttpRequest()
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(xhr.responseText))
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.open('POST', '/api/upload')
        xhr.send(formData)
      })
      setProgress(100)
      router.push('/')
      router.refresh()
    } catch (err) {
      alert('Błąd przesyłania: ' + (err instanceof Error ? err.message : 'Nieznany błąd'))
      setUploading(false)
      setProgress(0)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setCaption('')
    setMusicName('')
    setProgress(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="h-full overflow-y-auto bg-black">
      <div className="max-w-lg mx-auto px-4 py-6 pb-8">
        <h1 className="text-xl font-bold mb-6 text-center">Dodaj film</h1>

        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors py-16 px-6 text-center ${
              dragging ? 'border-[#fe2c55] bg-[#fe2c55]/10' : 'border-white/20 hover:border-white/40'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Film size={32} className="text-white/60" />
            </div>
            <div>
              <p className="font-semibold">Przeciągnij film tutaj</p>
              <p className="text-white/50 text-sm mt-1">lub kliknij, aby wybrać plik</p>
              <p className="text-white/30 text-xs mt-2">MP4, MOV, WebM — max 200MB</p>
            </div>
            <button className="bg-[#fe2c55] text-white px-6 py-2 rounded-full text-sm font-semibold">
              Wybierz plik
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[60vh] mx-auto flex items-center justify-center">
              <video
                src={preview!}
                controls
                className="w-full h-full object-contain"
                playsInline
              />
              <button
                onClick={reset}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Opis</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Napisz coś o tym filmie... #hashtag"
                  maxLength={500}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 outline-none resize-none focus:border-white/40 transition-colors"
                />
                <p className="text-xs text-white/30 text-right mt-1">{caption.length}/500</p>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">
                  <Music size={14} className="inline mr-1" />
                  Muzyka (opcjonalnie)
                </label>
                <input
                  type="text"
                  value={musicName}
                  onChange={(e) => setMusicName(e.target.value)}
                  placeholder="np. Ariana Grande - Thank u, next"
                  maxLength={100}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 outline-none focus:border-white/40 transition-colors"
                />
              </div>

              {uploading && (
                <div>
                  <div className="flex justify-between text-xs text-white/60 mb-1.5">
                    <span>Przesyłanie...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#fe2c55] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 bg-[#fe2c55] hover:bg-[#e0253d] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50"
              >
                <Upload size={18} />
                {uploading ? 'Przesyłanie...' : 'Opublikuj film'}
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="video/*"
          onChange={onFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
