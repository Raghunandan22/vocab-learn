import axios from 'axios'

interface SubtitleSearchResult {
  id: string
  attributes: {
    feature_details: {
      title: string
      year: number
    }
    files: Array<{
      file_id: number
    }>
    language: string
  }
}

interface SubtitleDownloadResult {
  file_data: string // Base64 encoded
}

const API_KEY = process.env.OPENSUBTITLES_API_KEY
const BASE_URL = 'https://api.opensubtitles.com/api/v1'

// Test connection to OpenSubtitles API
export async function testOpenSubtitlesConnection(): Promise<boolean> {
  try {
    if (!API_KEY) {
      console.error('OPENSUBTITLES_API_KEY not set in environment')
      return false
    }

    const response = await axios.get(`${BASE_URL}/subtitles`, {
      headers: {
        'Api-Key': API_KEY,
        'User-Agent': 'VocabLearn/1.0',
      },
      params: {
        query: 'test',
        languages: 'fr',
        type: 'movie',
      },
      timeout: 5000,
    })

    console.log('✅ OpenSubtitles API connection successful')
    return true
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ OpenSubtitles API connection failed:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      })
    } else {
      console.error('❌ OpenSubtitles API connection error:', error)
    }
    return false
  }
}

export async function searchSubtitles(query: string, language: string = 'fr') {
  try {
    if (!API_KEY) {
      throw new Error('OPENSUBTITLES_API_KEY not configured')
    }

    const response = await axios.get(`${BASE_URL}/subtitles`, {
      headers: {
        'Api-Key': API_KEY,
        'User-Agent': 'VocabLearn/1.0',
      },
      params: {
        query,
        languages: language,
      },
      timeout: 15000,
    })

    const results = response.data.data || []
    console.log(`✅ [OpenSubtitles] Query: "${query}" (${language}) → ${results.length} results`)

    if (!Array.isArray(results)) {
      console.error(`❌ [OpenSubtitles] Response data.data is not array:`, typeof results)
      return []
    }

    return results as SubtitleSearchResult[]
  } catch (error) {
    console.error(`❌ [OpenSubtitles] Search error:`, error instanceof Error ? error.message : String(error))
    throw error
  }
}

export async function downloadSubtitle(fileId: number, retries = 3): Promise<string> {
  let lastError: any = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!API_KEY) {
        throw new Error('OPENSUBTITLES_API_KEY not configured')
      }

      console.log(`[OpenSubtitles] Download attempt ${attempt}/${retries} for file ${fileId}`)

      const response = await axios.post(
        `${BASE_URL}/download`,
        { file_id: fileId },
        {
          headers: {
            'Api-Key': API_KEY,
            'User-Agent': 'VocabLearn/1.0',
          },
          timeout: 15000,
        }
      )

      if (!response.data.file_data) {
        throw new Error('No file_data in response')
      }

      console.log(`✅ [OpenSubtitles] Download successful (${response.data.file_data.length} bytes)`)
      return response.data.file_data
    } catch (error) {
      lastError = error
      const status = error instanceof axios.AxiosError ? error.response?.status : null
      console.warn(`⚠️  [OpenSubtitles] Download attempt ${attempt} failed (status: ${status})`)

      if (attempt < retries) {
        const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        console.log(`   Retrying in ${delayMs}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  console.error(`❌ [OpenSubtitles] Download failed after ${retries} attempts`)
  throw lastError || new Error('Failed to download subtitle after retries')
}
