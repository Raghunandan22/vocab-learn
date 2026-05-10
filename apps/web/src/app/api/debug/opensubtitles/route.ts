import { searchSubtitles, downloadSubtitle } from '@/lib/opensubtitles'
import axios from 'axios'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const testMode = searchParams.get('test') || 'direct'

  console.log(`🔍 Debug mode: ${testMode}`)

  try {
    if (testMode === 'lib') {
      // Test using the searchSubtitles library function
      console.log('Testing searchSubtitles library function...')
      const results = await searchSubtitles('amélie', 'fr')
      console.log(`Library function returned: ${results.length} results`)
      return Response.json({
        method: 'lib',
        success: true,
        resultsCount: results.length,
        firstResult: results[0]?.attributes?.feature_details,
      })
    } else {
      // Test direct axios call
      const API_KEY = process.env.OPENSUBTITLES_API_KEY
      const BASE_URL = 'https://api.opensubtitles.com/api/v1'

      console.log('Testing direct axios call...')
      const response = await axios.get(`${BASE_URL}/subtitles`, {
        headers: {
          'Api-Key': API_KEY,
          'User-Agent': 'VocabLearn/1.0',
        },
        params: {
          query: 'amélie',
          languages: 'fr',
        },
        timeout: 10000,
      })

      return Response.json({
        method: 'direct',
        success: true,
        status: response.status,
        resultsCount: response.data.data?.length || 0,
        firstResult: response.data.data?.[0]?.attributes?.feature_details,
      })
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    console.error('❌ Debug error:', errMsg)
    return Response.json(
      {
        success: false,
        error: errMsg,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    )
  }
}
