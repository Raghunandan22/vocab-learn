import { Icon } from '@/components/Icon'
import { SkeletonCard, SkeletonText, SkeletonTable } from '@/components/Skeleton'
import Link from 'next/link'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Design System</h1>
          <p className="text-gray-600 dark:text-gray-400">VocabLearn UI Components & Patterns</p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Primary', bg: 'bg-blue-600', hex: '#3b82f6' },
              { name: 'Success', bg: 'bg-green-600', hex: '#10b981' },
              { name: 'Warning', bg: 'bg-yellow-500', hex: '#f59e0b' },
              { name: 'Error', bg: 'bg-red-600', hex: '#ef4444' },
            ].map((color) => (
              <div key={color.name} className="card">
                <div className={`${color.bg} h-24 rounded-lg mb-3`}></div>
                <p className="font-medium">{color.name}</p>
                <p className="text-sm text-gray-500">{color.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Buttons</h2>
          <div className="card">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Primary Buttons</p>
                <div className="flex flex-wrap gap-3">
                  <button className="button-primary">Primary</button>
                  <button className="button-primary" disabled>Disabled</button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Secondary Buttons</p>
                <div className="flex flex-wrap gap-3">
                  <button className="button-secondary">Secondary</button>
                  <button className="button-secondary" disabled>Disabled</button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">With Icons</p>
                <div className="flex flex-wrap gap-3">
                  <button className="button-primary flex items-center gap-2">
                    <Icon name="save" size="md" />
                    Save
                  </button>
                  <button className="button-secondary flex items-center gap-2">
                    <Icon name="download" size="md" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Cards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-2">Standard Card</h3>
              <p className="text-gray-600">This is a standard card with hover effects</p>
            </div>
            <div className="card-hover">
              <h3 className="font-semibold mb-2">Hover Card</h3>
              <p className="text-gray-600">Hover over this card to see the effect</p>
            </div>
          </div>
        </section>

        {/* Forms */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Form Elements</h2>
          <div className="card max-w-md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Text Input</label>
                <input type="text" placeholder="Enter text..." className="input-base w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email Input</label>
                <input type="email" placeholder="Enter email..." className="input-base w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Disabled Input</label>
                <input type="text" placeholder="Disabled..." className="input-base w-full" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select</label>
                <select className="input-base w-full">
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Icons */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Icons</h2>
          <div className="card">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-6">
              {(['search', 'menu', 'close', 'logout', 'settings', 'save', 'delete', 'check', 'arrow-right', 'arrow-left', 'download', 'home'] as const).map((icon) => (
                <div key={icon} className="flex flex-col items-center gap-2">
                  <Icon name={icon} size="lg" className="text-blue-600" />
                  <span className="text-xs text-gray-600 capitalize">{icon}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Loading States */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Loading States</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-semibold mb-4">Card Skeleton</h3>
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Text Skeleton</h3>
              <SkeletonText lines={4} />
            </div>
            <div className="card">
              <h3 className="font-semibold mb-4">Table Skeleton</h3>
              <SkeletonTable rows={3} />
            </div>
            <div className="card flex items-center justify-center py-12">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Badges</h2>
          <div className="card flex flex-wrap gap-3">
            <span className="badge-blue">Blue Badge</span>
            <span className="badge-green">Green Badge</span>
            <span className="badge-yellow">Yellow Badge</span>
            <span className="badge-red">Red Badge</span>
            <span className="badge-purple">Purple Badge</span>
          </div>
        </section>

        {/* Animations */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Animations</h2>
          <div className="card space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Fade In</p>
              <div className="fade-in p-4 bg-blue-50 rounded-lg">
                Content with fade-in animation
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Fade In Up</p>
              <div className="fade-in-up p-4 bg-green-50 rounded-lg">
                Content with fade-in-up animation
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
