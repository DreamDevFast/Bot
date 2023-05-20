import { NextApiRequest, NextApiResponse } from "next";
import { discordClient } from "@/lib/discordClient"; 

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (!discordClient.isLoggedIn()) {
    console.log('starting bot...')
    await discordClient.login(process.env.DISCORD_BOT_TOKEN);
  }
  res.status(200).json({ status: "Bot is running." });
};