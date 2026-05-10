import { prisma } from '@/lib/db'
import { signupSchema } from '@/lib/validators'
import { successResponse, failResponse } from '@/lib/api-response'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ')
      return failResponse(errors, 'VALIDATION_ERROR', 400)
    }

    const { email, password, name } = validation.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return failResponse('Email already registered', 'EMAIL_EXISTS', 400)
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name: name || email.split('@')[0],
      },
    })

    return successResponse(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      201
    )
  } catch (error) {
    console.error('Signup error:', error)
    return failResponse('Signup failed', 'SIGNUP_ERROR', 500)
  }
}
