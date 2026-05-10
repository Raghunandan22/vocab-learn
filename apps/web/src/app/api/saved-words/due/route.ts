import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { successResponse, failResponse } from '@/lib/api-response'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const now = new Date()

    const dueWords = await prisma.savedWord.findMany({
      where: {
        userId: auth.userId,
        OR: [
          { nextReviewAt: null },
          { nextReviewAt: { lte: now } },
        ],
      },
      orderBy: { nextReviewAt: 'asc' },
    })

    return successResponse(dueWords)
  } catch (error) {
    console.error('Failed to fetch due words:', error)
    return failResponse('Failed to fetch due words', 'FETCH_ERROR', 500)
  }
}
