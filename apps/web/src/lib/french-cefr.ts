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
