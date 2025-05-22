const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');
const projectService = require('../services/projectService');
const usersPath = path.join(__dirname, '..', 'storage', 'users.json');

module.exports = async (ctx) => {
  const userId = String(ctx.from.id);

  if (!fs.existsSync(usersPath)) {
    return ctx.reply('❌ Sizda project yo‘q.');
  }

  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users[userId];

  if (!user || !user.projects || user.projects.length === 0) {
    return ctx.reply('❌ Sizda hali project mavjud emas.');
  }

  // Oxirgi projectni tanlaymiz
  const lastProject = user.projects[user.projects.length - 1];

  const result = await projectService.runProject(lastProject.id);
  if (!result.success) {
    return ctx.reply(`❌ Xatolik: ${result.message}`);
  }

  // Holatni yangilaymiz
  lastProject.status = 'running';
  lastProject.runAt = new Date().toISOString();
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  // Eski tugmali xabarni o‘chirish (agar tugmadan bosilgan bo‘lsa)
  if (ctx.callbackQuery) {
    try {
      await ctx.deleteMessage();
    } catch (e) {
      console.error('❌ Eski xabarni o‘chirishda xatolik:', e.message);
    }
  }

  // Yangi tugmali javob
  return ctx.reply(
    `▶️ Project ishga tushdi!\nID: ${lastProject.id}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('⏹ Stop', 'stop_project')]
    ])
  );
};
