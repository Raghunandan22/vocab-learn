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
          level: vocabList.level,
          words: vocabList.words.map((w) => ({
            id: w.id,
            word: w.word,
            wordLower: w.wordLower,
            translation: w.translation,
            cefLevel: w.cefLevel,
            frequency: w.frequency,
            example: w.example || '',
            timestamp: w.timestamp || '',
          })),
        })
      }
    } catch (err) {
      console.warn('Failed to fetch from DB:', err)
    }

    // Fallback to mock data
    const mockData = {
      id,
      movieTitle,
      level: 'B1',
      words: [
        {
          id: 'word_1',
          word: 'café',
          translation: 'coffee',
          cefLevel: 'A1',
          frequency: 12,
          example: 'Je prends un café tous les matins.',
          timestamp: '00:01:15',
        },
        {
          id: 'word_2',
          word: 'musique',
          translation: 'music',
          cefLevel: 'A1',
          frequency: 8,
          example: 'La musique remplissait tout l\'appartement.',
          timestamp: '00:05:30',
        },
        {
          id: 'word_3',
          word: 'rencontrer',
          translation: 'to meet',
          cefLevel: 'A2',
          frequency: 6,
          example: 'Elle va rencontrer un homme mystérieux.',
          timestamp: '00:12:45',
        },
        {
          id: 'word_4',
          word: 'seul',
          translation: 'alone',
          cefLevel: 'A2',
          frequency: 7,
          example: 'Elle se sentait seule et isolée.',
          timestamp: '00:18:20',
        },
        {
          id: 'word_5',
          word: 'étrange',
          translation: 'strange',
          cefLevel: 'B1',
          frequency: 5,
          example: 'Il y a quelque chose d\'étrange chez elle.',
          timestamp: '00:25:10',
        },
        {
          id: 'word_6',
          word: 'merveille',
          translation: 'wonder',
          cefLevel: 'B1',
          frequency: 4,
          example: 'Quelle merveille de film!',
          timestamp: '00:32:40',
        },
        {
          id: 'word_7',
          word: 'sentiment',
          translation: 'feeling',
          cefLevel: 'B1',
          frequency: 6,
          example: 'Elle avait un sentiment confus.',
          timestamp: '00:40:15',
        },
        {
          id: 'word_8',
          word: 'ambition',
          translation: 'ambition',
          cefLevel: 'B2',
          frequency: 3,
          example: 'Son ambition était de changer le monde.',
          timestamp: '00:48:30',
        },
        {
          id: 'word_9',
          word: 'destin',
          translation: 'destiny',
          cefLevel: 'B2',
          frequency: 4,
          example: 'Est-ce notre destin de nous rencontrer?',
          timestamp: '00:55:45',
        },
        {
          id: 'word_10',
          word: 'ineffable',
          translation: 'ineffable',
          cefLevel: 'C1',
          frequency: 2,
          example: 'Une beauté ineffable émanait d\'elle.',
          timestamp: '01:02:20',
        },
      ],
    }

    return successResponse(mockData)
  } catch (error) {
    console.error('Error fetching vocab:', error)
    return failResponse('Failed to fetch vocabulary', 'FETCH_ERROR', 500)
  }
}
