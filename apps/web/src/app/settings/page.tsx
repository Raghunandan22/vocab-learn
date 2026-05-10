'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useToast } from '@/components/Toast'

const LANGUAGE_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const LANGUAGES = [
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { showToast } = useToast()
  const [proficiencyLevel, setProficiencyLevel] = useState('B1')
  const [targetLanguage, setTargetLanguage] = useState('fr')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    async function loadUserPreferences() {
      try {
        const response = await fetch('/api/user')
        if (response.ok) {
          const json = await response.json()
          setProficiencyLevel(json.data.proficiencyLevel || 'B1')
          setTargetLanguage(json.data.targetLanguage || 'fr')
        }
      } catch (err) {
        console.error('Failed to load preferences:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserPreferences()
  }, [status, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proficiencyLevel, targetLanguage }),
      })

      if (response.ok) {
        showToast('Settings saved successfully!', 'success')
      } else {
        showToast('Failed to save settings', 'error')
      }
    } catch (err) {
      showToast('Failed to save settings', 'error')
      console.error('Error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <LoadingSpinner text="Loading settings..." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">⚙️ Settings</h1>
          <p className="text-gray-600">
            Customize your learning preferences
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Language Level */}
            <div>
              <h2 className="text-xl font-bold mb-4">Your Language Level</h2>
              <p className="text-gray-600 mb-4">
                Select your current proficiency level. Vocabulary will be filtered to match or below this level.
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {LANGUAGE_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setProficiencyLevel(level)}
                    className={`p-3 rounded-lg text-center font-medium transition-colors ${
                      proficiencyLevel === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Current Selection:</strong> {proficiencyLevel} - {getLevelDescription(proficiencyLevel)}
                </p>
              </div>
            </div>

            {/* Target Language */}
            <div className="pt-8 border-t">
              <h2 className="text-xl font-bold mb-4">Target Language</h2>
              <p className="text-gray-600 mb-4">
                Choose which language you want to learn. (Note: Currently French subtitles are fully supported)
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setTargetLanguage(lang.code)}
                    className={`p-4 rounded-lg text-left font-medium transition-colors ${
                      targetLanguage === lang.code
                        ? 'bg-blue-600 text-white border-2 border-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                    disabled={lang.code !== 'fr'}
                  >
                    {lang.name}
                    {lang.code !== 'fr' && ' (Coming Soon)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences Summary */}
            <div className="pt-8 border-t bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">Your Preferences Summary</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  <strong>Language Level:</strong> {proficiencyLevel} ({getLevelDescription(proficiencyLevel)})
                </li>
                <li>
                  <strong>Target Language:</strong> {LANGUAGES.find((l) => l.code === targetLanguage)?.name || 'Unknown'}
                </li>
                <li>
                  <strong>Account:</strong> {session?.user?.email}
                </li>
              </ul>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-colors"
            >
              {saving ? '💾 Saving...' : '💾 Save Settings'}
            </button>
          </form>

          {/* Help Section */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="font-bold text-gray-900 mb-3">📚 Understanding CEFR Levels</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div>
                <strong className="text-gray-900">A1-A2 (Beginner):</strong> Basic vocabulary, simple structures
              </div>
              <div>
                <strong className="text-gray-900">B1-B2 (Intermediate):</strong> Common topics, more complex sentences
              </div>
              <div>
                <strong className="text-gray-900">C1-C2 (Advanced):</strong> Sophisticated vocabulary, nuanced expression
              </div>
            </div>
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
