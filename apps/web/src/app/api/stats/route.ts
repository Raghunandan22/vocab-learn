import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { successResponse, failResponse } from '@/lib/api-response'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const [savedWordsCount, reviewedWordsCount, allWords] = await Promise.all([
      prisma.savedWord.count({
        where: { userId: auth.userId },
      }),
      prisma.savedWord.count({
        where: {
          userId: auth.userId,
          reviewCount: { gt: 0 },
        },
      }),
      prisma.savedWord.findMany({
        where: {
          userId: auth.userId,
          lastReviewedAt: { not: null },
        },
        select: { lastReviewedAt: true },
      }),
    ])

    // Calculate streak from distinct review dates
    let streakDays = 0
    if (allWords.length > 0) {
      const dates = new Set<string>()
      for (const word of allWords) {
        if (word.lastReviewedAt) {
          const dateStr = word.lastReviewedAt.toISOString().split('T')[0]
          dates.add(dateStr)
        }
      }

      const sortedDates = Array.from(dates).sort().reverse()
      if (sortedDates.length > 0) {
        const today = new Date().toISOString().split('T')[0]
        let currentDate = today
        streakDays = 0

        for (const date of sortedDates) {
          const currentDateObj = new Date(currentDate)
          const dateObj = new Date(date)

          const diffDays = Math.floor(
            (currentDateObj.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (diffDays === 0 || diffDays === streakDays) {
            streakDays++
            currentDate = new Date(dateObj.getTime() - 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          } else {
            break
          }
        }
      }
    }

    return successResponse({
      savedWordsCount,
      reviewedWordsCount,
      streakDays,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return failResponse('Failed to fetch stats', 'STATS_ERROR', 500)
  }
}
