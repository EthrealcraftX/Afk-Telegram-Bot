const fs = require('fs');
const path = require('path');
const videoPath = path.join(__dirname, '..', 'storage', 'help_video.json');

module.exports = async (ctx) => {
  if (!ctx.message.video) {
    return ctx.reply('❌ Iltimos, video yuboring.');
  }

  const fileId = ctx.message.video.file_id;

  fs.writeFileSync(videoPath, JSON.stringify({ file_id: fileId }, null, 2));
  ctx.reply('✅ Help videosi saqlandi!');
};