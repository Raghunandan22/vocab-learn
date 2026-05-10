export interface ParsedSubtitle {
  words: string[]
  lines: Array<{
    startTime: string
    endTime: string
    text: string
  }>
}

export function parseSRT(content: string): ParsedSubtitle {
  const lines = content.split('\n')
  const parsedLines = []
  const allWords = new Set<string>()

  let i = 0
  while (i < lines.length) {
    // Skip sequence numbers and timestamps
    if (/^\d+$/.test(lines[i].trim())) {
      i++
      if (i < lines.length && /-->/.test(lines[i])) {
        const timeParts = lines[i].split('-->')
        const startTime = timeParts[0].trim()
        const endTime = timeParts[1]?.trim() || ''
        i++

        // Collect subtitle text
        let text = ''
        while (i < lines.length && lines[i].trim() !== '') {
          text += lines[i] + ' '
          i++
        }

        if (text.trim()) {
          parsedLines.push({
            startTime,
            endTime,
            text: text.trim(),
          })

          // Extract words - French text with special characters
          const words = text
            .toLowerCase()
            .replace(/[^\w\s'àâäæéèêëïîôöœüùûçñ]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 2)

          words.forEach((word) => allWords.add(word))
        }
      }
    }
    i++
  }

  return {
    words: Array.from(allWords).sort(),
    lines: parsedLines,
  }
}
