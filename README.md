# ⏱ TimeKeeper

A personal productivity web app built for people who are confused about
their goals, career direction, and where their time actually goes.

## The Idea

Set ONE goal per week. Break it into tasks. Track every minute you spend
on it. Ship something every Sunday.

## Tech Stack

- ⚛️ React + Vite (JavaScript)
- 🟩 Supabase (PostgreSQL + Auth + Row Level Security)
- 🎨 Custom CSS — no UI library

## Features

- 🎯 Weekly goal engine
- ✅ Task management with completion tracking
- ⏱ Precision time tracker (start, pause, stop)
- 📊 Progress dashboard
- 💬 Mid-week motivation nudges
- 🏆 Weekly win celebration
- 🔐 Secure — every user only sees their own data

## Status

🚧 Currently in active development — building in public.

## Getting Started

```bash
git clone https://github.com/yourusername/personal-timekeeper
cd personal-timekeeper
npm install
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local
npm run dev
```

## Environment Variables

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
