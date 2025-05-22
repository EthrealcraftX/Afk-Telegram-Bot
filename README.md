# 🛡️ Minecraft AFK Manager Telegram Bot

<p align="center">
  <a href="https://t.me/avtoserverbot" target="_blank">
    <img src="https://img.shields.io/badge/Telegram-Bot-2CA5E0?style=for-the-badge&logo=telegram" alt="Telegram Bot">
  </a>
  <a href="https://t.me/HypePath" target="_blank">
    <img src="https://img.shields.io/badge/Telegram-Channel-2CA5E0?style=for-the-badge&logo=telegram" alt="Telegram Channel">
  </a>
  <a href="https://instagram.com/EthrealCarftX" target="_blank">
    <img src="https://img.shields.io/badge/Instagram-Follow-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram">
  </a>
  <a href="https://www.minecraft.net/en-us/download/server" target="_blank">
  <img src="https://img.shields.io/badge/Minecraft-Server%20Download-green?style=for-the-badge&logo=minecraft&logoColor=white" alt="Download Minecraft Server">
</a>
<a href="https://nodejs.org/en/download" target="_blank">
  <img src="https://img.shields.io/badge/Node.js-Download%20Latest-brightgreen?style=for-the-badge&logo=node.js&logoColor=white" alt="Download Node.js">
</a>

</p>

This is a **Telegram bot** designed to manage **AFK bots for Minecraft servers**, supporting both **Java** and **Bedrock editions**. It interacts with your Minecraft AFK Project Management API and allows server admins to deploy, list, and manage AFK instances directly from Telegram.

---

## ⚙️ Configuration

1. Create a `.env` file in the root directory:
   ```env
   BOT_TOKEN=your_telegram_bot_token
There's also config file please check that out   
  

2. You can get the API_TOKEN by launching the <a href="https://github.com/EthrealcraftX/Minecraft-java-bedrock-Afk-bot-website.git">AFK Manager Website API<a/>


3. Optional: Customize bot behavior inside the config/ folder if needed.



📥 Installation

git clone https://github.com/EthrealcraftX/Afk-Telegram-Bot.git
cd Afk-Telegram-Bot
npm install
node bot.js


💬 Bot Commands

User Commands:

/start – Welcome message

/create – Start a new AFK bot creation wizard

/projects – List your active AFK projects

/help – Show help info


🛠 Admin Commands:

/projectall – View all existing projects (admin only)

/settings – (under development)

/sethelp – Update the help message

/broadcast – Send a message to all users
(⚠️ This command may still contain bugs – review before using in production.)



📦 Dependencies

telegraf

dotenv

axios

Optionally any other utility from the website project (for auth or logging)



✅ Contribution

Pull requests are welcome!
If you find bugs or have suggestions, feel free to open an issue or PR.
