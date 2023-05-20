import type { NextApiRequest, NextApiResponse } from "next";
import { Client, GatewayIntentBits } from "discord.js";
import createOpenAI, { AIChatMessage } from "@/openai/config";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
const openAI = createOpenAI();

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.content.startsWith(`<@${client.user?.id}>`);
  const isInThread = message.channel.isThread();
  const isBotThread =
    isInThread && message.channel.name.startsWith("ChatGPT Thread with");

  if (isMentioned || isBotThread) {
    message.channel.sendTyping();

    const text = isMentioned ? message.content.replace(`<@${client.user?.id}>`, '').trim() : message.content;

    const messages: AIChatMessage[] = [
      { role: 'system', content: 'You are ChatGPT, a large language model trained by OpenAI. Follow the user\'s instructions carefully. Respond using plain text.' },
    ];

    if (isBotThread) {
      const fetchedMessages = await message.channel.messages.fetch({});
      const reversedMessages = fetchedMessages.reverse()
      reversedMessages.forEach(fetchedMessage => {
        if (fetchedMessage.author.bot) {
          messages.push({ role: 'assistant', content: fetchedMessage.content });
        } else {
          messages.push({ role: 'user', content: fetchedMessage.content });
        }
      });
    }
    
    if (messages[messages.length - 1].role === 'user') {
      messages[messages.length - 1] = {role: 'user', content: text}
    }

    let completion
    let attempts = 0

    while(!completion) {
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
  
        const answer = (completion.data.choices[0].message?.content ?? "").trim();
  
        if (isMentioned && !isBotThread) {
          const thread = await message.startThread({
            name: "ChatGPT Thread with " + message.author.username,
            autoArchiveDuration: 60,
          });
          thread.send(answer);
        } else {
          message.channel.send(answer);
        }
      } catch (error) {
        console.error(error);
        attempts += 1
        if (attempts > 6) {
          message.reply("Sorry, I could not process your request.");
        } else {
          await sleep(500)
        }
      }
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json("Bot is running!");
}
