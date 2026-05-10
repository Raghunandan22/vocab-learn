import { parseSRT } from '@/lib/subtitle-parser'
import { translateWord } from '@/lib/french-cefr'
import { successResponse, failResponse } from '@/lib/api-response'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const uploadSchema = z.object({
  movieTitle: z.string().min(1),
  language: z.string().default('fr'),
  subtitleContent: z.string().min(10), // SRT or VTT content
})

interface VocabWord {
  word: string
  wordLower: string
  translation: string
  frequency: number
  level: string
  example: string
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) {
      // Allow unauthenticated uploads, but don't persist to DB
      console.log('Unauthenticated upload — will not persist to database')
    }

    const body = await request.json()

    const validation = uploadSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ')
      return failResponse(errors, 'VALIDATION_ERROR', 400)
    }

    const { movieTitle, language, subtitleContent } = validation.data

    console.log(`📤 Processing uploaded subtitle for "${movieTitle}" (${subtitleContent.length} chars)`)

    // Parse the subtitle content
    let parsedWords: string[] = []
    let parsedLines: any[] = []

    try {
      // Try SRT format first
      const parsed = parseSRT(subtitleContent)
      parsedWords = parsed.words
      parsedLines = parsed.lines
      console.log(`✅ Parsed: ${parsedWords.length} unique words from ${parsedLines.length} lines`)
    } catch (err) {
      console.error('Subtitle parse error:', err)
      return failResponse('Failed to parse subtitle file', 'PARSE_ERROR', 400)
    }

    if (parsedWords.length === 0) {
      return failResponse('No words found in subtitle', 'EMPTY_SUBTITLE', 400)
    }

    // Extract vocabulary with context
    const vocabWords: VocabWord[] = []
    const seen = new Set<string>()
    let wordsWithContext = 0

    for (const word of parsedWords) {
      if (seen.has(word.toLowerCase())) continue
      seen.add(word.toLowerCase())

      const matchingLines = parsedLines.filter((line) =>
        line.text.toLowerCase().includes(word.toLowerCase())
      )

      if (matchingLines.length > 0) {
        const translation = await translateWord(word, 'en')

        vocabWords.push({
          word,
          wordLower: word.toLowerCase(),
          translation,
          frequency: matchingLines.length,
          level: '',
          example: matchingLines[0]?.text || '',
        })
        wordsWithContext++
      }
    }

    // Sort by frequency
    vocabWords.sort((a, b) => b.frequency - a.frequency)
    console.log(`✅ Extracted ${vocabWords.length} unique vocab words`)

    // Categorize into 3 levels based on frequency distribution
    const assignLevel = (index: number, total: number): string => {
      const percentile = index / total
      if (percentile < 0.33) return 'Basic'
      if (percentile < 0.66) return 'Intermediate'
      return 'Advanced'
    }

    // Assign levels to words
    vocabWords.forEach((word, index) => {
      word.level = assignLevel(index, vocabWords.length)
    })

    let responseId = `vocab_upload_${Date.now()}`

    // Persist to database if authenticated
    if (auth.authorized && auth.userId) {
      try {
        const vocabList = await prisma.vocabList.create({
          data: {
            userId: auth.userId,
            movieTitle,
            language,
          },
        })

        // Upsert each word
        for (const vocabWord of vocabWords.slice(0, 500)) {
          await prisma.vocabWord.upsert({
            where: {
              vocabListId_wordLower: {
                vocabListId: vocabList.id,
                wordLower: vocabWord.wordLower,
              },
            },
            update: {
              frequency: vocabWord.frequency,
              level: vocabWord.level,
            },
            create: {
              vocabListId: vocabList.id,
              word: vocabWord.word,
              wordLower: vocabWord.wordLower,
              translation: vocabWord.translation,
              frequency: vocabWord.frequency,
              level: vocabWord.level,
              example: vocabWord.example,
            },
          })
        }

        responseId = vocabList.id
        console.log(`💾 Persisted VocabList ${responseId} with ${vocabWords.length} words`)
      } catch (dbError) {
        console.error('Failed to persist to database:', dbError)
        // Still return successfully, but with temp ID
      }
    }

    return successResponse({
      id: responseId,
      movieTitle,
      language,
      words: vocabWords.slice(0, 500),
      source: auth.authorized ? 'manual_upload_persisted' : 'manual_upload',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return failResponse('Failed to process subtitle', 'UPLOAD_ERROR', 500)
  }
}
