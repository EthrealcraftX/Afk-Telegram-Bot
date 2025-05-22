const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');
const videoPath = path.join(__dirname, '..', 'storage', 'help_video.json');

module.exports = async (ctx) => {
  if (!fs.existsSync(videoPath)) {
    return ctx.reply('❗ Help videosi hali admin tomonidan qo‘shilmagan.');
  }

  const { file_id } = JSON.parse(fs.readFileSync(videoPath, 'utf8'));

  if (!file_id) {
    return ctx.reply('❗ Help videosi hali mavjud emas.');
  }

  await ctx.replyWithVideo(file_id, {
    caption: '🎥 Qanday foydalaniladi:\n\n1. /create - project yaratish\n2. /projects - 🗃 yasalgan projectlardi korish',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('▶️ Create', 'start_create')]
    ])
  });
};