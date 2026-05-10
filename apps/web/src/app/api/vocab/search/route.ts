import { searchSubtitles } from '@/lib/opensubtitles'
import { parseSRT } from '@/lib/subtitle-parser'
import { getWordLevel, filterWordsByLevel, translateWord } from '@/lib/french-cefr'
import { searchSchema } from '@/lib/validators'
import { successResponse, failResponse } from '@/lib/api-response'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const validation = searchSchema.safeParse(body)
    if (!validation.success) {
      const errors = validation.error.errors.map((e) => e.message).join(', ')
      return failResponse(errors, 'VALIDATION_ERROR', 400)
    }

    const { movieTitle, language, level } = validation.data

    console.log(`Searching for subtitles: ${movieTitle}`)

    // Search for subtitles on OpenSubtitles
    let results = null
    try {
      results = await searchSubtitles(movieTitle, language)
    } catch (err) {
      console.error('OpenSubtitles search error:', err)
      // Continue with mock data for demo purposes
      results = null
    }

    if (!results || results.length === 0) {
      console.log('No subtitles found, using mock data for demo')
      return createMockVocabList(movieTitle, level)
    }

    // Download subtitle from first result
    let parsedWords: string[] = []
    let parsedLines: any[] = []

    try {
      const subtitle = results[0]
      console.log(`Found subtitle: ${subtitle.attributes.feature_details?.title || 'unknown'}`)

      const fileId = subtitle.attributes.files[0]?.file_id
      if (fileId) {
        console.log(`Downloading file ID: ${fileId}`)
        const { downloadSubtitle } = await import('@/lib/opensubtitles')
        const downloadedSubtitle = await downloadSubtitle(fileId)
        console.log(`Downloaded: ${downloadedSubtitle.length} bytes`)

        // Decode base64
        const decodedSubtitle = Buffer.from(downloadedSubtitle, 'base64').toString('utf-8')
        console.log(`Decoded: ${decodedSubtitle.length} characters`)

        // Parse subtitles
        const parsed = parseSRT(decodedSubtitle)
        parsedWords = parsed.words
        parsedLines = parsed.lines
        console.log(`Parsed: ${parsedWords.length} unique words from ${parsedLines.length} lines`)
      }
    } catch (err) {
      console.error('Subtitle download/parse error:', err)
      return createMockVocabList(movieTitle, level)
    }

    // Filter by level - be less aggressive
    let filteredWords = parsedWords
    const beforeFilter = parsedWords.length
    try {
      filteredWords = filterWordsByLevel(parsedWords, level)
      console.log(`After CEFR filter (${level}): ${filteredWords.length} words (was ${beforeFilter})`)

      // Log which words were filtered out (sample)
      const filtered_out = parsedWords.filter(w => !filteredWords.includes(w)).slice(0, 20)
      if (filtered_out.length > 0) {
        console.log(`Sample filtered words: ${filtered_out.map(w => `${w}(${getWordLevel(w)})`).join(', ')}`)
      }
    } catch (err) {
      console.warn('CEFR filtering failed, using all words:', err)
      filteredWords = parsedWords
    }

    // Extract vocabulary with context
    const vocabWords: VocabWord[] = []
    const seen = new Set<string>()
    let wordsWithContext = 0
    let wordsWithoutContext = 0

    for (const word of filteredWords) {
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
          cefLevel: getWordLevel(word),
          frequency: matchingLines.length,
          example: matchingLines[0]?.text || '',
          timestamp: matchingLines[0]?.startTime || '',
        })
        wordsWithContext++
      } else {
        wordsWithoutContext++
      }
    }

    console.log(`Vocabulary extraction: ${wordsWithContext} words with context, ${wordsWithoutContext} without`)

    // Sort by frequency
    vocabWords.sort((a, b) => b.frequency - a.frequency)
    console.log(`Final vocab list: ${vocabWords.length} words`)

    // Try to persist to DB if user is authenticated
    let vocabListId = `vocab_${Date.now()}`
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        const vocabList = await prisma.vocabList.create({
          data: {
            userId: session.user.id,
            movieTitle,
            language,
            level: level as any,
            subtitleSource: 'opensubtitles',
          },
        })

        vocabListId = vocabList.id

        // Create each vocab word (save top 500)
        for (const word of vocabWords.slice(0, 500)) {
          await prisma.vocabWord.create({
            data: {
              vocabListId,
              word: word.word,
              wordLower: word.wordLower,
              translation: word.translation,
              frequency: word.frequency,
              cefLevel: word.cefLevel as any,
              example: word.example,
              timestamp: word.timestamp,
            },
          })
        }
      }
    } catch (err) {
      console.warn('Failed to persist vocab to DB:', err)
      // Continue with transient id
    }

    return successResponse({
      id: vocabListId,
      movieTitle: results?.[0]?.attributes?.feature_details?.title || movieTitle,
      level,
      words: vocabWords.slice(0, 500),
    })
  } catch (error) {
    console.error('Search error:', error)
    return failResponse('Failed to extract vocabulary', 'SEARCH_ERROR', 500)
  }
}

// Mock data for demo/testing when API fails
function createMockVocabList(movieTitle: string, level: string) {
  const movieMockData: Record<string, any[]> = {
    lupin: [
      { word: 'braquage', translation: 'heist', cefLevel: 'B2', frequency: 12, example: 'Le braquage était parfaitement planifié.', timestamp: '00:05:30' },
      { word: 'voleur', translation: 'thief', cefLevel: 'A2', frequency: 15, example: 'C\'est un voleur très intelligent.', timestamp: '00:12:45' },
      { word: 'complot', translation: 'plot', cefLevel: 'B1', frequency: 8, example: 'Il y a un complot derrière tout cela.', timestamp: '00:18:20' },
      { word: 'fugitif', translation: 'fugitive', cefLevel: 'B2', frequency: 6, example: 'Le fugitif est toujours en fuite.', timestamp: '00:25:10' },
      { word: 'détective', translation: 'detective', cefLevel: 'A2', frequency: 10, example: 'Le détective enquête sur le crime.', timestamp: '00:32:40' },
      { word: 'mystère', translation: 'mystery', cefLevel: 'A2', frequency: 9, example: 'Ce mystère est très intéressant.', timestamp: '00:40:15' },
      { word: 'identité', translation: 'identity', cefLevel: 'B1', frequency: 7, example: 'Son véritable identité est secrète.', timestamp: '00:48:30' },
      { word: 'conspiration', translation: 'conspiracy', cefLevel: 'B2', frequency: 5, example: 'Une conspiration mondiale existe.', timestamp: '00:55:45' },
    ],
    amélie: [
      { word: 'café', translation: 'coffee', cefLevel: 'A1', frequency: 12, example: 'Je prends un café tous les matins.', timestamp: '00:01:15' },
      { word: 'musique', translation: 'music', cefLevel: 'A1', frequency: 8, example: 'La musique remplissait tout l\'appartement.', timestamp: '00:05:30' },
      { word: 'rencontrer', translation: 'to meet', cefLevel: 'A2', frequency: 6, example: 'Elle va rencontrer un homme mystérieux.', timestamp: '00:12:45' },
      { word: 'magie', translation: 'magic', cefLevel: 'A1', frequency: 10, example: 'Il y a de la magie dans la vie quotidienne.', timestamp: '00:18:20' },
      { word: 'destin', translation: 'destiny', cefLevel: 'B2', frequency: 4, example: 'Est-ce notre destin de nous rencontrer?', timestamp: '00:55:45' },
      { word: 'merveille', translation: 'wonder', cefLevel: 'B1', frequency: 4, example: 'Quelle merveille de film!', timestamp: '00:32:40' },
      { word: 'sentiment', translation: 'feeling', cefLevel: 'B1', frequency: 6, example: 'Elle avait un sentiment confus.', timestamp: '00:40:15' },
      { word: 'enchantement', translation: 'enchantment', cefLevel: 'B2', frequency: 3, example: 'Un enchantement la recouvrait.', timestamp: '01:02:20' },
    ],
    default: [
      { word: 'bonjour', translation: 'hello', cefLevel: 'A1', frequency: 5, example: 'Bonjour, comment allez-vous?', timestamp: '00:01:30' },
      { word: 'amour', translation: 'love', cefLevel: 'A1', frequency: 8, example: 'L\'amour est le plus beau des sentiments.', timestamp: '00:05:45' },
      { word: 'rêver', translation: 'to dream', cefLevel: 'B1', frequency: 3, example: 'Je rêve d\'aventures lointaines.', timestamp: '00:12:15' },
      { word: 'merveilleux', translation: 'wonderful', cefLevel: 'B1', frequency: 4, example: 'C\'est une journée merveilleuse!', timestamp: '00:18:20' },
      { word: 'destinée', translation: 'destiny', cefLevel: 'B2', frequency: 2, example: 'Quelle est notre destinée?', timestamp: '00:25:30' },
      { word: 'enchanté', translation: 'enchanted', cefLevel: 'B2', frequency: 3, example: 'Un monde enchanté nous attend.', timestamp: '00:32:45' },
      { word: 'ephémère', translation: 'ephemeral', cefLevel: 'C1', frequency: 1, example: 'La beauté est souvent éphémère.', timestamp: '00:40:00' },
      { word: 'ubiquitaire', translation: 'ubiquitous', cefLevel: 'C2', frequency: 1, example: 'La technologie est devenue ubiquitaire.', timestamp: '00:45:15' },
    ],
  }

  const key = movieTitle.toLowerCase()
  const mockWords = movieMockData[key] || movieMockData.default

  // Filter by level
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const filteredWords = mockWords.filter((w: any) => {
    const targetIndex = levels.indexOf(level)
    const wordIndex = levels.indexOf(w.cefLevel)
    return wordIndex >= 0 && wordIndex <= targetIndex
  })

  return successResponse({
    id: `vocab_mock_${Date.now()}`,
    movieTitle,
    level,
    words: filteredWords.map((w: any) => ({
      ...w,
      id: `word_${w.word}`,
      wordLower: w.word.toLowerCase(),
    })),
  })
}
