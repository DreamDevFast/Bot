import { TextBasedChannel } from 'discord.js'
import splitMessage from '@/lib/chat/splitMessage'

const sendAnswer = async (channel: TextBasedChannel, message: string) => {
  const chunks = splitMessage(message, 2000)

  for (const chunk of chunks) {
    await channel.send(chunk)
  }
}

export default sendAnswer
