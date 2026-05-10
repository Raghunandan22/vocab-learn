import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { successResponse, failResponse } from '@/lib/api-response'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const movieTitle = searchParams.get('title') || 'French Movie'

    // Try to fetch from database first
    try {
      const vocabList = await prisma.vocabList.findUnique({
        where: { id },
        include: { words: true },
      })

      if (vocabList) {
        return successResponse({
          id: vocabList.id,
          movieTitle: vocabList.movieTitle,
          words: vocabList.words.map((w) => ({
            id: w.id,
            word: w.word,
            wordLower: w.wordLower,
            translation: w.translation,
            frequency: w.frequency,
            level: w.level,
            example: w.example || '',
          })),
        })
      }
    } catch (err) {
      console.warn('Failed to fetch from DB:', err)
    }

    return failResponse('Vocabulary list not found', 'NOT_FOUND', 404)
  } catch (error) {
    console.error('Error fetching vocab:', error)
    return failResponse('Failed to fetch vocabulary', 'FETCH_ERROR', 500)
  }
}
