import { openai } from './openai'

export async function generateExamples(
  word: string,
  translation: string,
  language: string
): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Generate 2 natural example sentences in ${language === 'fr' ? 'French' : language} using the word "${word}" (meaning: "${translation}").
Return ONLY a JSON array of 2 strings. No explanation, no markdown.`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content?.trim() || '[]'
    const examples = JSON.parse(content) as string[]
    return examples
  } catch (error) {
    console.warn('AI examples generation failed:', error)
    return []
  }
}
