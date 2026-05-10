'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-white shadow">
      <div className="container-center py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          VocabLearn
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
            Dashboard
          </Link>
          <Link href="/search" className="text-gray-700 hover:text-blue-600 font-medium">
            Search
          </Link>
          <Link href="/flashcards" className="text-gray-700 hover:text-blue-600 font-medium">
            Flashcards
          </Link>
          <Link href="/settings" className="text-gray-700 hover:text-blue-600 font-medium">
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-700 hover:text-blue-600 font-bold text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200">
          <nav className="container-center py-4 flex flex-col space-y-3">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-blue-600 font-medium block"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/search"
              className="text-gray-700 hover:text-blue-600 font-medium block"
              onClick={() => setIsOpen(false)}
            >
              Search
            </Link>
            <Link
              href="/flashcards"
              className="text-gray-700 hover:text-blue-600 font-medium block"
              onClick={() => setIsOpen(false)}
            >
              Flashcards
            </Link>
            <Link
              href="/settings"
              className="text-gray-700 hover:text-blue-600 font-medium block"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
            <button
              onClick={() => {
                setIsOpen(false)
                signOut({ callbackUrl: '/login' })
              }}
              className="w-full text-left px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
