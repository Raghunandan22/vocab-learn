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

// VTT format parser (alternative to SRT)
export function parseVTT(content: string): ParsedSubtitle {
  const lines = content.split('\n')
  // Skip the WEBVTT header
  const startIndex = lines.findIndex((line) => /-->/.test(line))

  if (startIndex === -1) {
    return { words: [], lines: [] }
  }

  const parsedLines = []
  const allWords = new Set<string>()

  for (let i = startIndex; i < lines.length; i++) {
    if (/-->/.test(lines[i])) {
      const timeParts = lines[i].split('-->')
      const startTime = timeParts[0].trim()
      const endTime = timeParts[1]?.trim() || ''
      i++

      let text = ''
      while (i < lines.length && lines[i].trim() !== '' && !/-->/.test(lines[i])) {
        text += lines[i] + ' '
        i++
      }
      i-- // Back up one since the loop will increment

      if (text.trim()) {
        parsedLines.push({
          startTime,
          endTime,
          text: text.trim(),
        })

        const words = text
          .toLowerCase()
          .replace(/[^\w\s'àâäæéèêëïîôöœüùûçñ]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 2)

        words.forEach((word) => allWords.add(word))
      }
    }
  }

  return {
    words: Array.from(allWords).sort(),
    lines: parsedLines,
  }
}
