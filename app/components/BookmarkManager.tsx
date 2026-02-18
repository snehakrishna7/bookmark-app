'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function BookmarkManager({ user }: { user: any }) {
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  // 👇 STEP 10 — Fetch Bookmarks
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  // fetch when page loads
  useEffect(() => {
    fetchBookmarks()
  }, [])

  // STEP 9 — Add Bookmark
  const addBookmark = async () => {
    await supabase.from('bookmarks').insert({
      title,
      url,
      user_id: user.id
    })

    fetchBookmarks()
    setTitle('')
    setUrl('')
  }

  return (
    <div>
      <h2>My Bookmarks</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        placeholder="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <button onClick={addBookmark}>Add</button>

      <ul>
        {bookmarks.map((b) => (
          <li key={b.id}>
            {b.title} - {b.url}
          </li>
        ))}
      </ul>
    </div>
  )
}
