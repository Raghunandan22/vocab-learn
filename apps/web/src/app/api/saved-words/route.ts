import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { saveWordSchema } from '@/lib/validators'
import { successResponse, failResponse } from '@/lib/api-response'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const savedWords = await prisma.savedWord.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(savedWords)
  } catch (error) {
    console.error('Failed to fetch saved words:', error)
    return failResponse('Failed to fetch saved words', 'FETCH_ERROR', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()

    const validation = saveWordSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ')
      return failResponse(errors, 'VALIDATION_ERROR', 400)
    }

    const { word, translation, example, language, cefLevel } = validation.data

    const savedWord = await prisma.savedWord.upsert({
      where: {
        userId_word_language: {
          userId: auth.userId,
          word: word.toLowerCase(),
          language,
        },
      },
      update: {},
      create: {
        userId: auth.userId,
        word,
        language,
        translation,
        example: example || null,
        cefLevel,
      },
    })

    return successResponse(savedWord)
  } catch (error) {
    console.error('Failed to save word:', error)
    return failResponse('Failed to save word', 'SAVE_ERROR', 500)
  }
}
