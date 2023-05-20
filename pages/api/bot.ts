import type { NextApiRequest, NextApiResponse } from 'next'
import { Client, GatewayIntentBits } from 'discord.js'
import createOpenAI, { AIChatMessage } from '@/openai/config'

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
})
const openAI = createOpenAI()

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`)
})

client.on('messageCreate', async (message) => {
  if (message.author.bot) return

  if (message.content.startsWith(`<@!${client.user?.id}>`)) {
    message.channel.sendTyping()

    const question = message.content
      .replace(`<@!${client.user?.id}>`, '')
      .trim()

    let completion
    let attempts = 0

    while (!completion) {
      try {
        const prompt: AIChatMessage[] = [
          { role: 'user', content: `Please answer this question: ${question}` },
        ]

        completion = await openAI.createChatCompletion({
          model: 'gpt-4',
          messages: prompt,
          max_tokens: 1500,
          temperature: 0.0,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        })

        const answer = (
          completion.data.choices[0].message?.content ?? ''
        ).trim()
        const thread = await message.startThread({
          name: 'ChatGPT Thread',
          autoArchiveDuration: 60,
        })
        thread.send(answer)
      } catch (error) {
        console.error(error)
        message.reply('Sorry, I could not process your request.')
        attempts += 1
        if (attempts > 6) {
          throw error
        } else {
          await sleep(500)
        }
      }
    }
  }
})

client.login(process.env.DISCORD_BOT_TOKEN)

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json('Bot is running!')
}
