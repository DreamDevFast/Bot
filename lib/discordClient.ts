import { Client, ClientOptions, GatewayIntentBits } from "discord.js";
import executeCommand from "./executeCommand";

class DiscordClient extends Client {
  constructor(options: ClientOptions) {
    super(options);
    this.on("ready", () => {
      console.log(`Logged in as ${this.user?.tag}!`);
    });
    this.on("messageCreate", async (message) => {
      if (message.author.bot) return;

      const isMentioned = message.content.startsWith(`<@${this.user?.id}>`);
      const isInThread = message.channel.isThread();
      const isBotThread =
        isInThread && message.channel.name.startsWith("ChatGPT Thread with");

      const text = isMentioned
          ? message.content.replace(`<@${this.user?.id}>`, "").trim()
          : message.content;

      await executeCommand(message, text, isMentioned, isBotThread)
    });
  }

  async logout() {
    if (!this.isLoggedOut()) {
      this.destroy()
    }
  }

  isLoggedIn() {
    return this.ws.status === 0;
  }

  isLoggedOut() {
    return this.ws.status === 5;
  }
}

export const discordClient = new DiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
