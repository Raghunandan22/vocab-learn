import axios from 'axios'

const API_KEY = process.env.TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export interface MovieResult {
  id: number
  title: string
  release_date: string
  overview: string
  poster_path: string | null
}

export async function searchMovies(query: string): Promise<MovieResult[]> {
  if (!API_KEY) {
    console.warn('⚠️  TMDB_API_KEY not set, using fallback')
    return []
  }

  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query,
        language: 'en-US',
      },
      timeout: 10000,
    })

    const movies = response.data.results || []
    console.log(`✅ TMDB found ${movies.length} movies for "${query}"`)
    return movies
  } catch (error) {
    console.error('❌ TMDB search error:', error instanceof Error ? error.message : error)
    return []
  }
}
