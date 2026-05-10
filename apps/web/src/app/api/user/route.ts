import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { successResponse, failResponse } from '@/lib/api-response'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        name: true,
        email: true,
        targetLanguage: true,
        nativeLanguage: true,
        proficiencyLevel: true,
      },
    })

    if (!user) {
      return failResponse('User not found', 'NOT_FOUND', 404)
    }

    return successResponse(user)
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return failResponse('Failed to fetch user', 'FETCH_ERROR', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) {
      return auth.response
    }

    const body = await request.json()

    const updateSchema = z.object({
      targetLanguage: z.string().optional(),
      proficiencyLevel: z.string().optional(),
    })

    const validation = updateSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ')
      return failResponse(errors, 'VALIDATION_ERROR', 400)
    }

    const { targetLanguage, proficiencyLevel } = validation.data

    const updateData: any = {}
    if (targetLanguage) updateData.targetLanguage = targetLanguage
    if (proficiencyLevel) updateData.proficiencyLevel = proficiencyLevel

    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: updateData,
      select: {
        name: true,
        email: true,
        targetLanguage: true,
        nativeLanguage: true,
        proficiencyLevel: true,
      },
    })

    return successResponse(user)
  } catch (error) {
    console.error('Failed to update user:', error)
    return failResponse('Failed to update user', 'UPDATE_ERROR', 500)
  }
}
