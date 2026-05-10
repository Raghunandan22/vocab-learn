import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="container-center py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">VocabLearn</h1>
          <div className="space-x-4">
            <Link
              href="/login"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container-center py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Learn French from Your Favorite <span className="text-blue-600">Movies & Shows</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Extract vocabulary from French cinema, filter by your language level (A1-C2), and build your vocabulary naturally through entertainment
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/search"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Start Learning Free
            </Link>
            <a
              href="#features"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-gray-400 transition-colors font-medium text-lg inline-block"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container-center py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Why VocabLearn?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-bold mb-3">Search Any Movie or Show</h3>
            <p className="text-gray-600">
              Find French subtitles for thousands of movies and TV shows. From "Amélie" to "Lupin", we have them all.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">Smart Level Filtering</h3>
            <p className="text-gray-600">
              Words are automatically categorized by CEFR level (A1-C2). Learn vocabulary appropriate for your level.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="card hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-bold mb-3">Save & Practice</h3>
            <p className="text-gray-600">
              Save words to create personal flashcards. Track your progress with spaced repetition learning.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="container-center">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white text-lg font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Search for a Movie</h3>
                  <p className="text-gray-600">
                    Enter the title of any French movie or TV show. Our system searches millions of subtitle files.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white text-lg font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Extract Vocabulary</h3>
                  <p className="text-gray-600">
                    We automatically extract words from subtitles and assign them CEFR levels based on difficulty.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white text-lg font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Filter by Your Level</h3>
                  <p className="text-gray-600">
                    Select your language level (A1-C2) and we show you only vocabulary you're ready to learn.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white text-lg font-bold">
                    4
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Practice Anytime</h3>
                  <p className="text-gray-600">
                    Save words to your personal collection and practice with interactive flashcards and spaced repetition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-center py-20">
        <div className="max-w-3xl mx-auto bg-blue-600 rounded-lg text-white p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of French learners who are building their vocabulary through movies and TV shows.
          </p>
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container-center">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">VocabLearn</h4>
              <p className="text-sm">Learn French from movies and TV shows.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 VocabLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
