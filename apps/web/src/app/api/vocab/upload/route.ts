import { parseSRT } from '@/lib/subtitle-parser'
import { filterWordsByLevel, getWordLevel, translateWord } from '@/lib/french-cefr'
import { successResponse, failResponse } from '@/lib/api-response'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const uploadSchema = z.object({
  movieTitle: z.string().min(1),
  language: z.string().default('fr'),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  subtitleContent: z.string().min(10), // SRT or VTT content
})

interface VocabWord {
  word: string
  wordLower: string
  translation: string
  cefLevel: string
  frequency: number
  example: string
  timestamp: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = uploadSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ')
      return failResponse(errors, 'VALIDATION_ERROR', 400)
    }

    const { movieTitle, language, level, subtitleContent } = validation.data

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

    // Filter by level
    let filteredWords = parsedWords
    try {
      filteredWords = filterWordsByLevel(parsedWords, level)
      console.log(
        `After CEFR filter (${level}): ${filteredWords.length} words (was ${parsedWords.length})`
      )
    } catch (err) {
      console.warn('CEFR filtering failed, using all words:', err)
      filteredWords = parsedWords
    }

    // Extract vocabulary with context
    const vocabWords: VocabWord[] = []
    const seen = new Set<string>()
    let wordsWithContext = 0

    for (const word of filteredWords) {
      if (seen.has(word.toLowerCase())) continue
      seen.add(word.toLowerCase())

      const matchingLines = parsedLines.filter((line) =>
        line.text.toLowerCase().includes(word.toLowerCase())
      )

      if (matchingLines.length > 0) {
        const translation = await translateWord(word, 'en')
        const wordLevel = getWordLevel(word)

        vocabWords.push({
          word,
          wordLower: word.toLowerCase(),
          translation,
          cefLevel: wordLevel === 'unknown' ? level : wordLevel,
          frequency: matchingLines.length,
          example: matchingLines[0]?.text || '',
          timestamp: matchingLines[0]?.startTime || '',
        })
        wordsWithContext++
      }
    }

    // Sort by frequency
    vocabWords.sort((a, b) => b.frequency - a.frequency)
    console.log(`✅ Extracted ${vocabWords.length} unique vocab words`)

    return successResponse({
      id: `vocab_upload_${Date.now()}`,
      movieTitle,
      language,
      level,
      words: vocabWords.slice(0, 500),
      source: 'manual_upload',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return failResponse('Failed to process subtitle', 'UPLOAD_ERROR', 500)
  }
}
