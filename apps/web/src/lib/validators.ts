import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export const searchSchema = z.object({
  movieTitle: z.string().min(1, 'Movie title is required'),
  language: z.string().default('fr'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
})

export const saveWordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  translation: z.string().min(1, 'Translation is required'),
  example: z.string().optional(),
  language: z.string().default('fr'),
  cefLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type SaveWordInput = z.infer<typeof saveWordSchema>
