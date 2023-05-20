import type { NextApiRequest, NextApiResponse } from "next";
import { Client, GatewayIntentBits } from "discord.js";
import createOpenAI, { AIChatMessage } from "@/openai/config";
import { isBot } from "next/dist/server/web/spec-extension/user-agent";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
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
      { role: 'user', content: text },
    ];

    if (isBotThread) {
      const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
      fetchedMessages.forEach(fetchedMessage => {
        if (fetchedMessage.author.bot) {
          messages.push({ role: 'assistant', content: fetchedMessage.content });
        } else {
          messages.push({ role: 'user', content: fetchedMessage.content });
        }
      });
    }

    try {
      const prompt: AIChatMessage[] = [
        { role: "user", content: `Please answer this question: ${text}` },
      ];

      const completion = await openAI.createChatCompletion({
        model: "gpt-4",
        messages: messages,
        max_tokens: 1500,
        temperature: 0.0,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      });

      const answer = (completion.data.choices[0].message?.content ?? "").trim();

      console.log("answer = ", answer);

      if (isMentioned) {
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
      message.reply("Sorry, I could not process your request.");
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json("Bot is running!");
}
