'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Bookmark = {
  id: number
  title: string
  url: string
  user_id: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  // Get user session
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Fetch bookmarks + realtime
  useEffect(() => {
    if (!user) return

    fetchBookmarks()

    const channel = supabase
      .channel('bookmarks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookmarks' },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchBookmarks = async () => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setBookmarks(data || [])
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const addBookmark = async () => {
    if (!title || !url) return

    await supabase.from('bookmarks').insert([
      {
        title,
        url,
        user_id: user.id,
      },
    ])

    setTitle('')
    setUrl('')
  }

  const deleteBookmark = async (id: number) => {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Smart Bookmark App
        </h1>

        {!user ? (
          <button
            onClick={signInWithGoogle}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Sign in with Google
          </button>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-600">
                Logged in as {user.email}
              </p>
              <button
                onClick={signOut}
                className="text-red-500 text-sm"
              >
                Logout
              </button>
            </div>

            <div className="mb-4 space-y-2">
              <input
                type="text"
                placeholder="Bookmark title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Bookmark URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <button
                onClick={addBookmark}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Add Bookmark
              </button>
            </div>

            <ul className="space-y-2">
              {bookmarks.map((bookmark) => (
                <li
                  key={bookmark.id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <a
                    href={bookmark.url}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    {bookmark.title}
                  </a>
                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}
