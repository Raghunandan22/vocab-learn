'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export default function SearchPage() {
  const router = useRouter()
  const [movieTitle, setMovieTitle] = useState('')
  const [level, setLevel] = useState('B1')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/vocab/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle,
          language: 'fr',
          level,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Search failed. Try another movie.')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      localStorage.setItem('lastSearch', JSON.stringify(data))
      router.push(`/vocab/${data.id}`)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Search error:', err)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container-center py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            VocabLearn
          </Link>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-center py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">🎬 Search Movies & Shows</h1>
            <p className="text-gray-600">
              Find French subtitles and extract vocabulary from your favorite content
            </p>
          </div>

          <div className="card">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <label
                  htmlFor="movieTitle"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Movie or TV Show Title
                </label>
                <input
                  id="movieTitle"
                  type="text"
                  value={movieTitle}
                  onChange={(e) => setMovieTitle(e.target.value)}
                  placeholder="e.g., Amélie, Lupin, Engrenages"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the title of any French movie or TV show
                </p>
              </div>

              <div>
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Language Level
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  {LANGUAGE_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l} - {getLevelDescription(l)}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select your proficiency level to filter appropriate vocabulary
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-colors"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block mr-2 loading-spinner"></span>
                    Extracting vocabulary...
                  </>
                ) : (
                  'Search & Extract'
                )}
              </button>
            </form>

            {/* Popular Movies */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-medium text-gray-700 mb-4">Popular French Films</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Amélie',
                  'Ratatouille',
                  'Intouchables',
                  'Léon',
                  'Taxi',
                  'Coco',
                ].map((movie) => (
                  <button
                    key={movie}
                    onClick={() => {
                      setMovieTitle(movie)
                      setError('')
                    }}
                    className="p-3 bg-gray-100 hover:bg-blue-100 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                  >
                    {movie}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Try popular French films for best results (Amélie, Taxi, Intouchables)</li>
              <li>• More words = longer movies with more dialogue</li>
              <li>• Select your actual language level for better learning</li>
              <li>• Words are automatically filtered by CEFR difficulty</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

function getLevelDescription(level: string): string {
  const descriptions: Record<string, string> = {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Mastery',
  }
  return descriptions[level] || ''
}
