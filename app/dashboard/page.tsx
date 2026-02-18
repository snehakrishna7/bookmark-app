'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

 
  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setBookmarks(data || [])
  }

  
  useEffect(() => {
    if (user) fetchBookmarks()
  }, [user])

  
  useEffect(() => {
    const channel = supabase
      .channel('bookmarks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => fetchBookmarks()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  
  const addBookmark = async () => {
    await supabase.from('bookmarks').insert({
      title,
      url,
      user_id: user.id
    })

    setTitle('')
    setUrl('')
  }


  const deleteBookmark = async (id: string) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  if (!user) return <p>Loading...</p>

  return (
    <div>
      <h1>My Bookmarks</h1>

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

      <button onClick={addBookmark}>Add Bookmark</button>

      <ul>
        {bookmarks.map((b) => (
          <li key={b.id}>
            <a href={b.url} target="_blank">{b.title}</a>
            <button onClick={() => deleteBookmark(b.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
