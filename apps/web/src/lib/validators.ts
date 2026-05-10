import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
})

export const searchSchema = z.object({
  movieTitle: z.string().min(1, 'Movie title is required'),
  language: z.string().default('fr'),
})

export const saveWordSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  translation: z.string().min(1, 'Translation is required'),
  example: z.string().optional(),
  language: z.string().default('fr'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type SaveWordInput = z.infer<typeof saveWordSchema>
