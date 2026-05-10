export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}
