// French CEFR word database - 139,535 real French words mapped to proficiency levels
// Generated from Wiktionary with frequency-based CEFR assignment
// Levels: A1 (6,977 words), A2 (13,954), B1 (27,907), B2 (34,883), C1 (34,884), C2 (20,930)

// Import the large dictionary (kept separate due to size)
import { FRENCH_CEFR_WORDS } from './french-cefr-data'

export function getWordLevel(word: string): string {
  // Returns the CEFR level from dictionary, or undefined if not found
  return FRENCH_CEFR_WORDS[word.toLowerCase()] || 'unknown'
}

export function filterWordsByLevel(words: string[], maxLevel: string): string[] {
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const maxIndex = levels.indexOf(maxLevel)
  if (maxIndex === -1) return words // Invalid level, return all

  return words.filter((word) => {
    const wordLevel = getWordLevel(word)
    // If word is in dictionary, filter by level
    if (wordLevel !== 'unknown') {
      const wordIndex = levels.indexOf(wordLevel)
      return wordIndex >= 0 && wordIndex <= maxIndex
    }
    // If word NOT in dictionary, include it anyway (MVP approach)
    return true
  })
}

export async function translateWord(word: string, targetLanguage: string = 'en'): Promise<string> {
  // Try MyMemory translation API (free, no key required)
  if (targetLanguage === 'en') {
    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=fr|en`,
        { cache: 'force-cache' }
      )
      const data = await response.json()
      if (data.responseData?.translatedText && data.responseData.translatedText !== word) {
        return data.responseData.translatedText
      }
    } catch (error) {
      console.warn(`Translation API error for "${word}":`, error)
    }
  }

  // Fallback: return word as-is
  return word
}
