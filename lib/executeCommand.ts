import createOpenAI, { AIChatMessage } from "@/openai/config";
import { sleep } from "@/utils";
import { Message, TextBasedChannel, TextChannel, ThreadChannel } from "discord.js";

const openAI = createOpenAI();

interface PromiseWrapper {
  promise: Promise<void>;
  isFulfilled: boolean;
}

const sendTypingWithDelay = async (
  channel: TextBasedChannel,
  delayMs: number
) => {
  channel.sendTyping();

  return new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });
};

const sendExtendedTyping = async (
  channel: TextBasedChannel,
  promiseWrapper: PromiseWrapper
) => {
  while (!promiseWrapper.isFulfilled) {
    await sendTypingWithDelay(channel, 8000); // Duration should be less than 10 seconds
  }
};

const executeCommand = async (
  message: Message,
  text: string,
  isMentioned: boolean,
  isBotThread: boolean
) => {
  if (isMentioned || isBotThread) {
    message.channel.sendTyping();

    const messages: AIChatMessage[] = [
      {
        role: "system",
        content:
          "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using plain text.",
      },
    ];

    if (isBotThread) {
      const fetchedMessages = await message.channel.messages.fetch({});
      const reversedMessages = fetchedMessages.reverse();
      reversedMessages.forEach((fetchedMessage) => {
        if (fetchedMessage.author.bot) {
          messages.push({
            role: "assistant",
            content: fetchedMessage.content,
          });
        } else {
          messages.push({ role: "user", content: fetchedMessage.content });
        }
      });
    }

    if (messages[messages.length - 1].role === "user") {
      messages[messages.length - 1] = { role: "user", content: text };
    } else {
      messages.push({ role: "user", content: text });
    }

    let completion;
    let attempts = 0;

    const promiseWrapper: PromiseWrapper = {
      promise: Promise.resolve(),
      isFulfilled: false,
    };

    promiseWrapper.promise = (async () => {
      while (!completion) {
        sendExtendedTyping(message.channel, promiseWrapper);

        try {
          completion = await openAI.createChatCompletion({
            model: "gpt-4",
            messages: messages,
            max_tokens: 1500,
            temperature: 0.0,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 0.0,
          });

          const answer = (
            completion.data.choices[0].message?.content ?? ""
          ).trim();

          if (isMentioned && !isBotThread) {
            const thread = await message.startThread({
              name: "ChatGPT Thread with " + message.author.username,
              autoArchiveDuration: 60,
            });
            thread.send(answer);
          } else {
            message.channel.send(answer);
          }
          promiseWrapper.isFulfilled = true;
        } catch (error) {
          console.error(error);
          attempts += 1;
          if (attempts > 6) {
            message.reply("Sorry, I could not process your request.");
          } else {
            await sleep(500);
          }
        }
      }
    })();
  }
};

export default executeCommand;
