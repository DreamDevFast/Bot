import type { NextPage } from "next";
import { useState } from "react";
import styles from "@/styles/HomePage.module.css";

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
    <div className={styles.container}>
      <h1 className={styles.title}>Discord bot control</h1>
      <div className={styles.buttonWrapper}>
        <button className={`${styles.button} ${styles.startButton}`} onClick={startBot}>
          Start Bot
        </button>
        <button className={`${styles.button} ${styles.stopButton}`} onClick={stopBot}>
          Stop Bot
        </button>
      </div>
      <p className={styles.status}>Bot status: {botStatus}</p>
    </div>
  );
};

export default HomePage;