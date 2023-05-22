import createOpenAI from "@/openai/config";
import { Message } from "discord.js";
import { fetchThreadMessages } from "@/lib/chat/fetchThreadMessages";
import { handleCompletion } from "@/lib/chat/handleCompletion";

const openAI = createOpenAI();

const executeCommand = async (
  message: Message,
  text: string,
  isMentioned: boolean,
  isBotThread: boolean
) => {
  if (isMentioned) {
    const messages = await fetchThreadMessages(message, isBotThread)

    if (messages[messages.length - 1].role === "user") {
      messages[messages.length - 1] = { role: "user", content: text };
    } else {
      messages.push({ role: "user", content: text });
    }

    await handleCompletion(openAI, message, messages, isMentioned, isBotThread)
  }
};

export default executeCommand;
