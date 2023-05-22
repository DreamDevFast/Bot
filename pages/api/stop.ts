import { NextApiRequest, NextApiResponse } from "next";
import { discordClient } from "@/lib/discord/discordClient";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("shutting down");
  await discordClient.logout();
  res.status(200).json({ status: "Bot is stopped." });
};
