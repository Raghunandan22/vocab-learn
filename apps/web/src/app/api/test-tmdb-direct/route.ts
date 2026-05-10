import axios from 'axios'

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY
  const query = 'amélie'

  console.log(`[Direct Test] apiKey: ${apiKey ? apiKey.substring(0, 8) : 'NOT SET'}`)
  console.log(`[Direct Test] Calling TMDB directly for "${query}"`)

  try {
    const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
      params: {
        api_key: apiKey,
        query,
        language: 'en-US',
      },
    })

    const movies = response.data.results || []
    console.log(`[Direct Test] Got ${movies.length} movies`)
    console.log(`[Direct Test] First movie: ${movies[0]?.title}`)

    return Response.json({
      query,
      totalResults: movies.length,
      firstMovie: movies[0]
        ? {
            id: movies[0].id,
            title: movies[0].title,
            overview_length: movies[0].overview?.length,
            has_overview: !!movies[0].overview,
          }
        : null,
      all_ids: movies.map((m: any) => `${m.id}:${m.title}`),
    })
  } catch (err) {
    console.error('[Direct Test] Error:', err instanceof Error ? err.message : err)
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 })
  }
}
