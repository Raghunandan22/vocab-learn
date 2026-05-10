'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface SavedWord {
  id: string
  word: string
  translation: string
  example?: string
  createdAt: string
}

interface Stats {
  savedWordsCount: number
  reviewedWordsCount: number
  streakDays: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [savedWords, setSavedWords] = useState<SavedWord[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      window.location.href = '/login'
      return
    }

    async function loadData() {
      try {
        const [wordsRes, statsRes] = await Promise.all([
          fetch('/api/saved-words'),
          fetch('/api/stats'),
        ])

        if (wordsRes.ok) {
          const json = await wordsRes.json()
          setSavedWords(json.data.slice(0, 5))
        }

        if (statsRes.ok) {
          const json = await statsRes.json()
          setStats(json.data)
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [status])
  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container-center py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session.user?.name || session.user?.email}!</h1>
            <p className="text-gray-600 mt-1">Extract vocabulary from French movies and TV shows</p>
          </div>
          <div className="flex gap-4">
            <Link href="/flashcards" className="button-primary">
              📚 Practice Flashcards
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-center py-12">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Search Section */}
          <Link href="/search" className="card card-hover hover:shadow-lg transition-shadow block">
            <h2 className="text-2xl font-bold mb-4">🎬 Search Movies</h2>
            <p className="text-gray-600 mb-6">
              Find French subtitles and extract vocabulary from your favorite movies and TV shows.
            </p>
            <div className="button-primary inline-block">
              Start Searching
            </div>
          </Link>

          {/* Saved Words Section */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">💾 Saved Words</h2>
            {savedWords.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {savedWords.map((word) => (
                    <div
                      key={word.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-blue-600">{word.word}</p>
                          <p className="text-sm text-gray-600">{word.translation}</p>
                          {word.example && (
                            <p className="text-xs text-gray-500 mt-1 italic">{word.example}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/flashcards"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Practice all saved words →
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-6">
                  You haven't saved any words yet. Start by searching for a movie!
                </p>
                <Link href="/search" className="button-primary inline-block">
                  Search a Movie
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No vocabulary lists yet</p>
            <p className="text-gray-400 text-sm">
              Start by <Link href="/search" className="text-blue-600 hover:underline">searching for a movie</Link>
            </p>
          </div>
        </div>

        {/* Learning Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="card text-center">
            <div className="text-4xl font-bold text-blue-600">{stats?.reviewedWordsCount || 0}</div>
            <p className="text-gray-600 mt-2">Words Learned</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-green-600">{stats?.savedWordsCount || 0}</div>
            <p className="text-gray-600 mt-2">Words Saved</p>
          </div>
          <div className="card text-center">
            <div className="text-4xl font-bold text-purple-600">{stats?.streakDays || 0}</div>
            <p className="text-gray-600 mt-2">Days Streak</p>
          </div>
        </div>
      </main>
    </div>
  )
}
