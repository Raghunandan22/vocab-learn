import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { successResponse, failResponse } from '@/lib/api-response'
import { NextRequest } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const savedWord = await prisma.savedWord.findUnique({
      where: { id },
    })

    if (!savedWord) {
      return failResponse('Word not found', 'NOT_FOUND', 404)
    }

    if (savedWord.userId !== auth.userId) {
      return failResponse('Unauthorized', 'FORBIDDEN', 403)
    }

    await prisma.savedWord.delete({
      where: { id },
    })

    return successResponse({ success: true })
  } catch (error) {
    console.error('Failed to delete word:', error)
    return failResponse('Failed to delete word', 'DELETE_ERROR', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()
    const rating = body.rating || 3

    const savedWord = await prisma.savedWord.findUnique({
      where: { id },
    })

    if (!savedWord) {
      return failResponse('Word not found', 'NOT_FOUND', 404)
    }

    if (savedWord.userId !== auth.userId) {
      return failResponse('Unauthorized', 'FORBIDDEN', 403)
    }

    const now = new Date()
    let nextReviewAt: Date

    if (rating === 3) {
      // "Know It" — double interval each time: 1d, 2d, 4d, 8d...
      const intervalDays = Math.pow(2, savedWord.reviewCount)
      nextReviewAt = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000)
    } else {
      // "Practice More" — review again in 1 hour
      nextReviewAt = new Date(now.getTime() + 60 * 60 * 1000)
    }

    const updated = await prisma.savedWord.update({
      where: { id },
      data: {
        reviewCount: { increment: 1 },
        lastReviewedAt: now,
        nextReviewAt,
      },
    })

    return successResponse(updated)
  } catch (error) {
    console.error('Failed to update word:', error)
    return failResponse('Failed to update word', 'UPDATE_ERROR', 500)
  }
}
