'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface VocabWord {
  id: string
  word: string
  translation: string
  frequency: number
  level: string
  example: string
  timestamp: string
}

interface VocabList {
  id: string
  movieTitle: string
  words: VocabWord[]
}

export default function VocabPage() {
  const params = useParams()
  const [vocabList, setVocabList] = useState<VocabList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterLevel, setFilterLevel] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'frequency' | 'alphabetical'>('frequency')
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set())
  const [savingWord, setSavingWord] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVocab() {
      try {
        const cached = localStorage.getItem('lastSearch')
        if (cached) {
          const json = JSON.parse(cached)
          // Ensure words have IDs
          const vocabWithIds = {
            ...json,
            words: json.words.map((w: any, idx: number) => ({
              ...w,
              id: w.id || `word_${w.word}_${idx}`
            }))
          }
          setVocabList(vocabWithIds)
          setIsLoading(false)
        } else {
          const response = await fetch(`/api/vocab/${params.id}`)
          if (!response.ok) throw new Error('Failed to fetch')
          const json = await response.json()
          const vocabWithIds = {
            ...json.data,
            words: json.data.words.map((w: any, idx: number) => ({
              ...w,
              id: w.id || `word_${w.word}_${idx}`
            }))
          }
          setVocabList(vocabWithIds)
          setIsLoading(false)
        }
      } catch (err) {
        setError('Failed to load vocabulary')
        console.error('Error:', err)
        setIsLoading(false)
      }
    }

    async function fetchSavedWords() {
      try {
        const response = await fetch('/api/saved-words')
        if (response.ok) {
          const json = await response.json()
          setSavedWords(new Set(json.data.map((w: any) => w.word.toLowerCase())))
        }
      } catch (err) {
        console.error('Error fetching saved words:', err)
      }
    }

    if (params.id) {
      fetchVocab()
      fetchSavedWords()
    }
  }, [params.id])

  async function handleSaveWord(word: VocabWord) {
    setSavingWord(word.word)
    try {
      const response = await fetch('/api/saved-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: word.word,
          translation: word.translation,
          example: word.example,
          language: 'fr',
        }),
      })

      if (response.ok) {
        setSavedWords((prev) => new Set([...prev, word.word.toLowerCase()]))
      }
    } catch (err) {
      console.error('Error saving word:', err)
    } finally {
      setSavingWord(null)
    }
  }

  function handleDownloadCSV() {
    if (!vocabList) return

    const headers = ['Word', 'Translation', 'Level', 'Example']
    const rows = filteredWords.map((word) => [
      word.word,
      word.translation,
      word.level,
      word.example,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => `"${cell.replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${vocabList.movieTitle}-vocabulary.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <Link href="/search" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to search
          </Link>
        </div>
      </div>
    )

  if (!vocabList) return null

  // Filter and sort words
  let filteredWords = vocabList.words
  if (filterLevel) {
    filteredWords = filteredWords.filter((w) => w.level === filterLevel)
  }
  if (searchTerm) {
    filteredWords = filteredWords.filter(
      (w) =>
        w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (sortBy === 'alphabetical') {
    filteredWords = [...filteredWords].sort((a, b) => a.word.localeCompare(b.word))
  }

  const levelCounts = {
    Basic: vocabList.words.filter((w) => w.level === 'Basic').length,
    Intermediate: vocabList.words.filter((w) => w.level === 'Intermediate').length,
    Advanced: vocabList.words.filter((w) => w.level === 'Advanced').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container-center py-6">
          <Link href="/search" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to search
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{vocabList.movieTitle}</h1>
          <p className="text-gray-600 mt-1">
            {vocabList.words.length} words found
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-center py-8">
        {/* Level Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilterLevel(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterLevel === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({vocabList.words.length})
          </button>
          {(Object.entries(levelCounts) as [string, number][]).map(([level, count]) => (
            <button
              key={level}
              onClick={() => setFilterLevel(filterLevel === level ? null : level)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level} ({count})
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="card mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search words..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'frequency' | 'alphabetical')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="frequency">By Frequency</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Results
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                {filteredWords.length} / {vocabList.words.length} words
              </div>
            </div>
          </div>
        </div>

        {/* Vocabulary Table */}
        {filteredWords.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th>Word</th>
                    <th>Translation</th>
                    <th>Level</th>
                    <th>Example</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWords.map((word) => (
                    <tr key={word.id}>
                      <td className="font-medium text-blue-600">{word.word}</td>
                      <td>{word.translation}</td>
                      <td className="text-center">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {word.level}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600 max-w-xs truncate">
                        {word.example}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleSaveWord(word)}
                          disabled={savingWord === word.word}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            savedWords.has(word.word.toLowerCase())
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          } disabled:opacity-50`}
                        >
                          {savingWord === word.word
                            ? '...'
                            : savedWords.has(word.word.toLowerCase())
                            ? '✓ Saved'
                            : 'Save'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-2">No words found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/search"
            className="button-primary"
          >
            Search Another Movie
          </Link>
          <button onClick={handleDownloadCSV} className="button-secondary">
            📥 Download as CSV
          </button>
        </div>
      </main>
    </div>
  )
}
