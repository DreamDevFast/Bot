import { Message } from 'discord.js'
import { AIChatMessage } from '@/openai/config'

export async function fetchThreadMessages(
  message: Message,
  isBotThread: boolean
): Promise<AIChatMessage[]> {
  const messages: AIChatMessage[] = [
    {
      role: 'system',
      content:
        "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using plain text.",
    },
  ]

  if (isBotThread) {
    // Fetch messages from the thread
    const fetchedMessages = await message.channel.messages.fetch({})
    const reversedMessages = fetchedMessages.reverse()

    // Populate the messages array
    reversedMessages.forEach((fetchedMessage) => {
      if (fetchedMessage.author.bot) {
        messages.push({
          role: 'assistant',
          content: fetchedMessage.content,
        })
      } else {
        messages.push({ role: 'user', content: fetchedMessage.content })
      }
    })
  }

  return messages
}
