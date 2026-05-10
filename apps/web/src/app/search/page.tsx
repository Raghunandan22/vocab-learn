'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'

interface MovieResult {
  movieTitle: string
  movieOverview?: string
  posterPath?: string
}

export default function SearchPage() {
  const router = useRouter()
  const [movieTitle, setMovieTitle] = useState('')
  const [subtitleContent, setSubtitleContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [movieResult, setMovieResult] = useState<MovieResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSearching(true)

    if (!movieTitle.trim()) {
      setError('Please enter a movie title')
      setIsSearching(false)
      return
    }

    try {
      const response = await fetch('/api/vocab/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieTitle, language: 'fr' }),
      })

      if (!response.ok) {
        setError('Movie not found. Try a different title.')
        setIsSearching(false)
        return
      }

      const data = await response.json()
      setMovieResult({
        movieTitle: data.data.movieTitle,
        movieOverview: data.data.movieOverview,
        posterPath: data.data.posterPath,
      })
      setError('')
    } catch (err) {
      setError('Failed to search for movie. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    if (!subtitleContent.trim()) {
      setError('Please paste subtitle content')
      setIsLoading(false)
      return
    }

    if (!movieTitle.trim()) {
      setError('Please enter a movie title')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/vocab/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieTitle,
          language: 'fr',
          subtitleContent,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Upload failed. Check subtitle format.')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setSuccess(`✅ Extracted ${data.data.words.length} words!`)
      localStorage.setItem('lastSearch', JSON.stringify(data.data))

      setTimeout(() => {
        router.push(`/vocab/${data.data.id}`)
      }, 1000)
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Upload error:', err)
      setIsLoading(false)
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setSubtitleContent(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">📄 Extract Vocabulary from Subtitles</h1>
            <p className="text-gray-600">
              Upload a French subtitle file (SRT or VTT format) to extract vocabulary for learning
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Step 1: Search for movie */}
            {!movieResult ? (
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label htmlFor="movieTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Movie/Show Title
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="movieTitle"
                      type="text"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      placeholder="e.g., Amélie, Lupin"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isSearching}
                    />
                    <button
                      type="submit"
                      disabled={isSearching}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                    >
                      {isSearching ? '🔍' : '🎬 Find Movie'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Search TMDB to get movie info</p>
                </div>
              </form>
            ) : null}

            {/* Step 2: Movie preview */}
            {movieResult && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex gap-6">
                  {movieResult.posterPath && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w200${movieResult.posterPath}`}
                      alt={movieResult.movieTitle}
                      width={128}
                      height={192}
                      className="rounded-lg shadow-md"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-blue-900 mb-2">{movieResult.movieTitle}</h2>
                    {movieResult.movieOverview && (
                      <p className="text-sm text-blue-800 mb-4">{movieResult.movieOverview}</p>
                    )}
                    <button
                      onClick={() => setMovieResult(null)}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      ← Search another movie
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Upload subtitles */}
            {movieResult && (
              <form onSubmit={handleUpload} className="space-y-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900">Upload Subtitles for {movieResult.movieTitle}</h3>

              {/* File Upload */}
              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Subtitle File
                </label>
                <input
                  id="file"
                  type="file"
                  accept=".srt,.vtt,.txt"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Upload .srt or .vtt file (or paste content below)
                </p>
              </div>

              {/* Subtitle Content */}
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Subtitle Content (SRT or VTT)
                </label>
                <textarea
                  id="subtitle"
                  value={subtitleContent}
                  onChange={(e) => setSubtitleContent(e.target.value)}
                  placeholder={`Paste subtitle content here, e.g.:
1
00:00:00,000 --> 00:00:05,000
Bonjour, comment allez-vous?

2
00:00:05,000 --> 00:00:10,000
Je vais très bien, merci!`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm h-48"
                  required
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {subtitleContent.length} characters
                </p>
              </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-colors"
                >
                  {isLoading ? '⏳ Extracting vocabulary...' : '🚀 Extract Vocabulary'}
                </button>
              </form>
            )}

            {/* Tips */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold text-gray-700 mb-3">💡 How to Get Subtitles</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Download SRT files from OpenSubtitles, Subscene, or other subtitle sites</li>
                <li>• Look for French subtitles matching your movie</li>
                <li>• Copy the content and paste it above, or upload the .srt file</li>
                <li>• Works with any length subtitle - longer = more vocabulary</li>
              </ul>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-3">ℹ️ What Happens Next</h3>
            <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
              <li>We parse your subtitle file</li>
              <li>Extract all French words and filter by your level</li>
              <li>Translate each word to English</li>
              <li>Show you the vocabulary with examples from the movie</li>
              <li>You can save words for spaced repetition review</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}

