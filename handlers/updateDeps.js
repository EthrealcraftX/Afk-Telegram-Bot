const { exec } = require('child_process');
const { Markup } = require('telegraf');
const config = require('../config/bot.config.json');

module.exports = async (ctx) => {
  const adminId = config.adminId || [];

  if (ctx.from.id !== adminId) {
    return ctx.reply('❌ Sizda bu amalni bajarish huquqi yo‘q.');
  }

  ctx.reply('⏳ Paketlar yangilanmoqda. Iltimos, kuting...');

  exec('npm install bedrock-protocol@latest mineflayer@latest', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ YANGILASH XATOLIK:', error);
      return ctx.reply(`❌ Xatolik:\n<code>${error.message}</code>`, { parse_mode: 'HTML' });
    }

    ctx.replyWithHTML(`✅ Paketlar yangilandi!\n\n<pre>${stdout.slice(0, 4000)}</pre>`, {
      reply_markup: Markup.inlineKeyboard([
        [Markup.button.callback('🔄 Versiyalarni ko‘rish', 'check_versions')]
      ])
    });
  });
};

// Optional tugma uchun action
module.exports.handleAction = async (ctx) => {
  const { exec } = require('child_process');
  exec('npm list bedrock-protocol mineflayer --depth=0', (err, stdout, stderr) => {
    if (err) return ctx.reply('❌ Versiyalarni olishda xatolik.');

    ctx.replyWithHTML(`<pre>${stdout}</pre>`);
  });
};
