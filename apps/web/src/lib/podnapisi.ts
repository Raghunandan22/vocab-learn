import axios from 'axios'

const BASE_URL = 'https://www.podnapisi.net'

export interface SubtitleSearchResult {
  title: string
  downloadUrl: string
  language: string
  format: string
}

export async function searchSubtitles(
  movieTitle: string,
  language: string = 'French'
): Promise<SubtitleSearchResult[]> {
  try {
    // Podnapisi search via their website
    const searchUrl = `${BASE_URL}/en/search/?sK=${encodeURIComponent(movieTitle)}&sJ=${language}`

    console.log(`🔍 Searching Podnapisi for "${movieTitle}" in ${language}`)

    // Note: This is a best-effort approach since Podnapisi doesn't have an official API
    // In production, you'd want to use a proper scraping library or official API if available
    const response = await axios.get(searchUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'VocabLearn/1.0',
      },
    })

    // Basic parsing - look for download links
    // This is simplified; a real implementation would parse HTML properly
    const results: SubtitleSearchResult[] = []

    // For now, return empty - the actual scraping would need cheerio or similar
    console.log('ℹ️  Podnapisi HTML scraping requires additional setup')
    return results
  } catch (error) {
    console.error('❌ Podnapisi search error:', error instanceof Error ? error.message : error)
    return []
  }
}

export async function downloadSubtitleDirect(downloadUrl: string): Promise<string> {
  try {
    const response = await axios.get(downloadUrl, {
      timeout: 15000,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'VocabLearn/1.0',
      },
    })

    // Convert to text (assuming SRT or similar text format)
    const text = Buffer.from(response.data, 'binary').toString('utf-8')
    console.log(`✅ Downloaded subtitle (${text.length} chars)`)
    return text
  } catch (error) {
    console.error('❌ Download error:', error instanceof Error ? error.message : error)
    throw error
  }
}
