'use client'

import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <div className="card text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <button
                  onClick={() => {
                    this.setState({ hasError: false })
                    window.location.href = '/dashboard'
                  }}
                  className="button-primary w-full"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
