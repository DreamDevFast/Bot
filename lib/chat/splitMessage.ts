export default function splitMessage(text: string, maxLength = 2000) {
    const lines = text.split('\n')
    const chunks = []
  
    let currentChunk = ''
    for (const line of lines) {
      // Check if adding the current line exceeds the maxLength
      if (currentChunk.length + line.length + 1 > maxLength) {
        chunks.push(currentChunk)
        currentChunk = ''
      }
  
      currentChunk += (currentChunk ? '\n' : '') + line
    }
  
    if (currentChunk) {
      chunks.push(currentChunk)
    }
  
    return chunks
  }
  