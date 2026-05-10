import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { successResponse, failResponse } from '@/lib/api-response'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const vocabLists = await prisma.vocabList.findMany({
      where: { userId: auth.userId },
      select: {
        id: true,
        movieTitle: true,
        language: true,
        createdAt: true,
        _count: { select: { words: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    const formattedLists = vocabLists.map((list) => ({
      id: list.id,
      movieTitle: list.movieTitle,
      language: list.language,
      wordCount: list._count.words,
      createdAt: list.createdAt,
    }))

    return successResponse(formattedLists)
  } catch (error) {
    console.error('Failed to fetch vocab lists:', error)
    return failResponse('Failed to fetch vocab lists', 'FETCH_ERROR', 500)
  }
}
