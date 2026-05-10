import axios from 'axios'

const BASE_URL = 'https://api.themoviedb.org/3'

// Read API_KEY inside function to ensure fresh env var on each call
function getApiKey(): string | undefined {
  return process.env.TMDB_API_KEY
}

export interface MovieResult {
  id: number
  title: string
  release_date: string
  overview: string
  poster_path: string | null
}

export async function searchMovies(query: string): Promise<MovieResult[]> {
  const apiKey = getApiKey()

  console.log(`[TMDB lib] searchMovies called with query="${query}", apiKey=${apiKey ? 'SET' : 'NOT SET'}`)

  if (!apiKey) {
    console.warn('⚠️  TMDB_API_KEY not set')
    return []
  }

  try {
    console.log(`[TMDB lib] Making request to ${BASE_URL}/search/movie?query=${query}`)
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: apiKey,
        query,
        language: 'en-US',
      },
      timeout: 10000,
    })

    const movies = response.data.results || []
    console.log(`[TMDB lib] ✅ Got ${movies.length} results. First: ${movies[0]?.title}`)
    return movies.slice(0, 5) // Return top 5
  } catch (error) {
    console.error('[TMDB lib] ❌ Error:', error instanceof Error ? error.message : error)
    return []
  }
}
