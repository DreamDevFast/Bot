import createOpenAI, { AIChatMessage } from '@/openai/config'
import { OpenAIApi } from 'openai'
import { Message, TextBasedChannel } from 'discord.js'
import sendAnswer from '@/lib/chat/sendAnswer'
import { sleep } from '@/utils'
import sendExtendedTyping from '@/lib/chat/sendTyping'

interface PromiseWrapper {
  promise: Promise<void>
  isFulfilled: boolean
}

export async function handleCompletion(
  openAI: OpenAIApi,
  message: Message,
  messages: AIChatMessage[],
  isMentioned: boolean,
  isBotThread: boolean
) {
  let completion
  let attempts = 0

  // Define the promiseWrapper used for sendExtendedTyping
  const promiseWrapper: PromiseWrapper = {
    promise: Promise.resolve(),
    isFulfilled: false,
  }

  promiseWrapper.promise = (async () => {
    while (!completion) {
      sendExtendedTyping(message.channel, promiseWrapper)

      try {
        // Make API call and await the completion
        completion = await openAI.createChatCompletion({
          model: 'gpt-4',
          messages: messages,
          max_tokens: 1500,
          temperature: 0.0,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
        })

        // Process the received completion
        const answer = (
          completion.data.choices[0].message?.content ?? ''
        ).trim()

        let respondChannel: TextBasedChannel = message.channel

        if (isMentioned && !isBotThread) {
          respondChannel = await message.startThread({
            name: 'ChatGPT Thread with ' + message.author.username,
            autoArchiveDuration: 60,
          })
        }

        // Send response chunks using the sendAnswer function
        await sendAnswer(respondChannel, answer)
        promiseWrapper.isFulfilled = true
      } catch (error) {
        console.error(error)
        attempts += 1
        if (attempts > 6) {
          message.reply('Sorry, I could not process your request.')
        } else {
          await sleep(500)
        }
      }
    }
  })()
}
