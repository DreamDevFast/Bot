import type { NextPage } from "next";
import { useState } from "react";

const HomePage: NextPage = () => {
  const [botStatus, setBotStatus] = useState("unknown");

  const startBot = async () => {
    const response = await fetch("/api/start");
    const data = await response.json();
    setBotStatus(data.status);
  };

  const stopBot = async () => {
    const response = await fetch("/api/stop");
    const data = await response.json();
    setBotStatus(data.status);
  };

  return (
    <div>
      <h1>Discord bot control</h1>
      <button onClick={startBot}>Start Bot</button>
      <button onClick={stopBot}>Stop Bot</button>
      <p>Bot status: {botStatus}</p>
    </div>
  );
};

export default HomePage;