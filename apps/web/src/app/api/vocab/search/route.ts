import axios from 'axios'
import { searchSchema } from '@/lib/validators'
import { successResponse, failResponse } from '@/lib/api-response'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = searchSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ')
      return failResponse(errors, 'VALIDATION_ERROR', 400)
    }

    const { movieTitle, language } = validation.data
    const apiKey = process.env.TMDB_API_KEY

    if (!apiKey) {
      return failResponse('TMDB API key not configured', 'CONFIG_ERROR', 500)
    }

    // Search TMDB directly
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: apiKey,
        query: movieTitle,
        language: 'en-US',
      },
      timeout: 10000,
    })

    const movies = response.data.results || []
    const movie = movies[0]

    return successResponse({
      id: `vocab_search_${Date.now()}`,
      movieTitle: movie?.title || movieTitle,
      movieOverview: movie?.overview,
      posterPath: movie?.poster_path,
      words: [],
      message:
        'To extract vocabulary, please upload the movie subtitle file (SRT or VTT format) using the /api/vocab/upload endpoint',
      source: 'requires_manual_upload',
    })
  } catch (error) {
    console.error('Search error:', error instanceof Error ? error.message : error)
    return failResponse('Failed to search movies', 'SEARCH_ERROR', 500)
  }
}
