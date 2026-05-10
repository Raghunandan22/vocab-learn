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
    })

    return response.data.data as SubtitleSearchResult[]
  } catch (error) {
    console.error('OpenSubtitles search error:', error)
    throw new Error('Failed to search subtitles')
  }
}

export async function downloadSubtitle(fileId: number): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error('OPENSUBTITLES_API_KEY not configured')
    }

    const response = await axios.post(
      `${BASE_URL}/download`,
      { file_id: fileId },
      {
        headers: {
          'Api-Key': API_KEY,
          'User-Agent': 'VocabLearn/1.0',
        },
      }
    )

    return response.data.file_data
  } catch (error) {
    console.error('OpenSubtitles download error:', error)
    throw new Error('Failed to download subtitle')
  }
}
