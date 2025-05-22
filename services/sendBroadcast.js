const fs = require('fs');
const path = require('path');
const usersPath = path.join(__dirname, '..', 'storage', 'users.json');
const config = require('../config/bot.config.json');
const { Markup } = require('telegraf');

module.exports = async (bot, data, fromChatId) => {
  if (!fs.existsSync(usersPath)) return;

  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const userIds = Object.keys(users);

  let success = 0;
  let fail = 0;

  const buttons = (data.btn_text && data.btn_url)
    ? Markup.inlineKeyboard([[Markup.button.url(data.btn_text, data.btn_url)]])
    : null;

  for (const userId of userIds) {
    try {
      if (data.is_forward && data.fwd_msg_id) {
        await bot.forwardMessage(userId, fromChatId, data.fwd_msg_id);
      } else if (data.media) {
        await bot.sendPhoto(userId, data.media, {
          caption: data.text || '',
          ...buttons
        });
      } else {
        await bot.sendMessage(userId, data.text || '', buttons || {});
      }
      success++;
    } catch (e) {
      console.error(`❌ [${userId}] error:`, e.message);
      fail++;
    }
  }

  // Adminlarga xabar
  const statsMsg = `✅ Yuborildi: ${success} ta\n❌ Xatolik: ${fail} ta`;

  if (Array.isArray(config.adminId)) {
    for (const admin of config.adminId) {
      await bot.sendMessage(admin, statsMsg);
    }
  } else {
    await bot.sendMessage(config.adminId, statsMsg);
  }
};