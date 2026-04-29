# MyTok 🎬

Prywatna platforma wideo — pełny klon TikToka dla jednej osoby.

## Pierwsze uruchomienie

### 1. Zainstaluj zależności
```bash
npm install
```

### 2. Uruchom serwer deweloperski
```bash
npm run dev
```

### 3. Utwórz konto
Otwórz http://localhost:3000/setup i utwórz swoje konto (tylko raz — przy pierwszym uruchomieniu).

### 4. Zaloguj się i używaj!
http://localhost:3000 → zaloguj się → przeglądaj, uploaduj i polub filmy.

## Funkcje
- 📱 Pionowy feed wideo (snap scroll, autoplay, loop)
- ❤️ Like'i z animacją serduszka (podwójne kliknięcie)
- 💬 Komentarze (slide-up panel)
- 📤 Upload wideo (drag & drop, max 200MB)
- 🖼️ Automatyczne thumbnaily (FFmpeg, jeśli zainstalowany)
- 👤 Profil z historią i polubieniami
- 🔔 Powiadomienia (like'i, komentarze)
- 🔒 Prywatne konto z logowaniem hasłem
- 📲 PWA — można zainstalować na telefonie

## Technologia
- **Next.js 16** (App Router)
- **Prisma 7** + SQLite
- **NextAuth.js** (JWT sessions)
- **better-sqlite3** (driver adapter)
- **FFmpeg** (fluent-ffmpeg + ffmpeg-static)
- **TailwindCSS**

## Uruchamianie produkcyjne

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
