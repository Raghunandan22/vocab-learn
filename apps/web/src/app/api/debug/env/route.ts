export async function GET() {
  const apiKey = process.env.TMDB_API_KEY
  const dbUrl = process.env.DATABASE_URL

  return Response.json({
    TMDB_API_KEY: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET',
    DATABASE_URL: dbUrl ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter((k) => k.includes('TMDB') || k.includes('DATABASE') || k.includes('AUTH')),
  })
}
