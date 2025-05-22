# 🛡️ Minecraft AFK Manager Telegram Bot

This is a **Telegram bot** designed to manage **AFK bots for Minecraft servers**, supporting both **Java** and **Bedrock editions**. It interacts with your Minecraft AFK Project Management API and allows server admins to deploy, list, and manage AFK instances directly from Telegram.

---

## ⚙️ Configuration

1. Create a `.env` file in the root directory:
   ```env
   BOT_TOKEN=your_telegram_bot_token
There's also config file please check that out   
  

2. You can get the API_TOKEN by launching the AFK Manager Website API.


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
