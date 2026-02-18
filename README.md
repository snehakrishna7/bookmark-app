# Smart Bookmark App

My bookmark app project.
git add README.md

## Features
- Google OAuth login
- Private bookmarks per user
- Realtime updates
- Deployed on Vercel

## Tech Stack
- Next.js App Router
- Supabase Auth + Database + Realtime
- Tailwind CSS

## Problems & Solutions

### Problem: Google OAuth redirect failed
Solution: Fixed redirect URL in Supabase settings.

### Problem: Users could see others' bookmarks
Solution: Enabled Row Level Security and policies.

### Problem: Realtime not updating
Solution: Added Supabase channel listener for postgres_changes.
