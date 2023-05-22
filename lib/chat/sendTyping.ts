import { TextBasedChannel } from 'discord.js'

interface PromiseWrapper {
  promise: Promise<void>
  isFulfilled: boolean
}

const sendTypingWithDelay = async (
  channel: TextBasedChannel,
  delayMs: number
) => {
  channel.sendTyping()

  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs)
  })
}

const sendExtendedTyping = async (
  channel: TextBasedChannel,
  promiseWrapper: PromiseWrapper
) => {
  while (!promiseWrapper.isFulfilled) {
    await sendTypingWithDelay(channel, 8000) // Duration should be less than 10 seconds
  }
}

export default sendExtendedTyping
