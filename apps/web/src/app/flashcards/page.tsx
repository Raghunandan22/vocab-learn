'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface SavedWord {
  id: string
  word: string
  translation: string
  example?: string
  reviewCount: number
  language: string
}

export default function FlashcardsPage() {
  const { status } = useSession()
  const [words, setWords] = useState<SavedWord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [queue, setQueue] = useState<SavedWord[]>([])

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      window.location.href = '/login'
      return
    }

    async function loadWords() {
      try {
        const response = await fetch('/api/saved-words/due')
        if (response.ok) {
          const json = await response.json()
          setWords(json.data)
          setQueue(json.data)
        }
      } catch (err) {
        console.error('Error loading words:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWords()
  }, [status])

  async function handleKnowIt() {
    if (queue.length === 0) return

    const currentWord = queue[currentIndex]
    try {
      const response = await fetch(`/api/saved-words/${currentWord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 3 }),
      })

      if (response.ok) {
        setReviewedCount((prev) => prev + 1)
        moveToNext()
      }
    } catch (err) {
      console.error('Error updating word:', err)
    }
  }

  async function handlePracticeLater() {
    if (queue.length === 0) return

    const currentWord = queue[currentIndex]
    try {
      await fetch(`/api/saved-words/${currentWord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 1 }),
      })
      moveToNext()
    } catch (err) {
      console.error('Error updating word:', err)
      moveToNext()
    }
  }

  function moveToNext() {
    const newQueue = [...queue]
    newQueue.push(newQueue.shift()!)
    setQueue(newQueue)
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="container-center py-6">
            <Link href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Practice Flashcards</h1>
          </div>
        </header>

        <main className="container-center py-12">
          <div className="max-w-2xl mx-auto">
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4 text-lg">All caught up for today!</p>
              <p className="text-gray-400 mb-6">
                You've reviewed all due words. Come back tomorrow for more!
              </p>
              <Link href="/search" className="button-primary inline-block">
                Search a New Movie
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const currentWord = queue[currentIndex]
  const progressPercent = ((reviewedCount / words.length) * 100) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container-center py-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Practice Flashcards</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-center py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-gray-700">Progress</p>
              <p className="text-sm text-gray-600">
                {reviewedCount} / {words.length}
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="mb-8 cursor-pointer perspective"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative w-full h-80 transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-xl p-8 flex flex-col justify-center items-center text-white"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-sm opacity-75 mb-4">French Word</p>
                <h2 className="text-5xl font-bold text-center mb-6">{currentWord.word}</h2>
                <p className="text-sm opacity-75">Click to reveal translation</p>
              </div>

              {/* Back */}
              <div
                className="absolute w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-xl p-8 flex flex-col justify-center items-center text-white"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <p className="text-sm opacity-75 mb-4">English Translation</p>
                <h2 className="text-4xl font-bold text-center mb-6">
                  {currentWord.translation}
                </h2>
                {currentWord.example && (
                  <p className="text-sm italic opacity-90 text-center mt-4">
                    {currentWord.example}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center mb-8">
            <button
              onClick={handlePracticeLater}
              className="button-secondary"
            >
              Practice More
            </button>
            <button
              onClick={handleKnowIt}
              className="button-primary"
            >
              ✓ Know It
            </button>
          </div>

          {/* Queue Info */}
          <div className="card text-center">
            <p className="text-gray-600">
              Card {currentIndex + 1} of {queue.length} in current queue
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Words reviewed: {reviewedCount} / {words.length}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
