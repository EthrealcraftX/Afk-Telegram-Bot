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

  // Oxirgi projectni topamiz
  const lastProject = user.projects[user.projects.length - 1];

  const result = await projectService.stopProject(lastProject.id);
  if (!result.success) {
    return ctx.reply(`❌ Xatolik: ${result.message}`);
  }

  lastProject.status = 'stopped';
  lastProject.stoppedAt = new Date().toISOString();
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  // Eski xabarni o‘chirish
  if (ctx.callbackQuery) {
    try {
      await ctx.deleteMessage();
    } catch (e) {
      console.error('❌ Eski xabarni o‘chirishda xato:', e.message);
    }
  }

  // Yangi xabar tugma bilan
  return ctx.reply(
    `⏹ Project to‘xtatildi!\nID: ${lastProject.id}`,
    Markup.inlineKeyboard([
      [Markup.button.callback('▶️ Run', 'run_project')]
    ])
  );
};
