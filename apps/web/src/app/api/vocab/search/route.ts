import { searchMovies } from '@/lib/tmdb'
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

    const { movieTitle, language, level } = validation.data

    console.log(`🎬 Searching for movie: "${movieTitle}"`)

    // Search for movie metadata on TMDB
    let movieData = null
    try {
      const movies = await searchMovies(movieTitle)
      if (movies.length > 0) {
        movieData = movies[0]
        console.log(`✅ Found movie: "${movieData.title}"`)
      }
    } catch (err) {
      console.warn('⚠️  TMDB search failed:', err instanceof Error ? err.message : err)
    }

    // For MVP: Subtitle extraction requires manual upload
    // Return movie info and direct user to upload endpoint
    return successResponse({
      id: `vocab_search_${Date.now()}`,
      movieTitle: movieData?.title || movieTitle,
      movieOverview: movieData?.overview,
      posterPath: movieData?.poster_path,
      level,
      words: [],
      message:
        'To extract vocabulary, please upload the movie subtitle file (SRT or VTT format) using the /api/vocab/upload endpoint',
      source: 'requires_manual_upload',
    })
  } catch (error) {
    console.error('Search error:', error)
    return failResponse('Failed to search movies', 'SEARCH_ERROR', 500)
  }
}
