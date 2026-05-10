'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  function toggleDarkMode() {
    const html = document.documentElement
    if (isDark) {
      html.classList.remove('dark')
      setIsDark(false)
    } else {
      html.classList.add('dark')
      setIsDark(true)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow transition-colors">
      <div className="container-center py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          VocabLearn
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">
            Dashboard
          </Link>
          <Link href="/search" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">
            Search
          </Link>
          <Link href="/flashcards" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">
            Flashcards
          </Link>
          <Link href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium">
            Settings
          </Link>
          <Link href="/design" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium text-sm">
            Design
          </Link>
          <button
            onClick={toggleDarkMode}
            className="px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            title="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 font-bold text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <nav className="container-center py-4 flex flex-col space-y-3">
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium block"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium block"
              onClick={() => setIsOpen(false)}
            >
              Search
            </Link>
            <Link
              href="/flashcards"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium block"
              onClick={() => setIsOpen(false)}
            >
              Flashcards
            </Link>
            <Link
              href="/settings"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium block"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <Link
              href="/design"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium block text-sm"
              onClick={() => setIsOpen(false)}
            >
              Design System
            </Link>
            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: '/login' })
              }}
              className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
