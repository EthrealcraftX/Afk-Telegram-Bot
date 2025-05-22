const fs = require('fs');
const path = require('path');
const projectService = require('../services/projectService');
const usersPath = path.join(__dirname, '..', 'storage', 'users.json');

module.exports = async (ctx) => {
  const userId = String(ctx.from.id);

  if (!fs.existsSync(usersPath)) {
    return ctx.reply('❌ Sizda hech qanday project yo‘q.');
  }

  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users[userId];

  if (!user || !user.projects || user.projects.length === 0) {
    return ctx.reply('❌ Sizda hech qanday project mavjud emas.');
  }

  // Oxirgi projectni tanlaymiz
  const lastProject = user.projects[user.projects.length - 1];

  // Agar project ishlayotgan bo‘lsa — to‘xtatamiz
  if (lastProject.status === 'running') {
    await projectService.stopProject(lastProject.id);
  }

  // Fayl papkasini o‘chirish
  const projectPath = path.join(__dirname, '..', 'projects', lastProject.id);
  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true, force: true });
  }

  // users.json dan o‘chirish
  user.projects.pop(); // oxirgi projectni olib tashlaymiz

  // Agar boshqa project qolmagan bo‘lsa — foydalanuvchini ham o‘chir
  if (user.projects.length === 0) {
    delete users[userId];
  }

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  // Eski tugma xabarni o‘chirish
  if (ctx.callbackQuery) {
    try {
      await ctx.deleteMessage();
    } catch (e) {
      console.error('❌ Xabarni o‘chirishda xatolik:', e.message);
    }
  }

  return ctx.reply(`🗑 Project o‘chirildi!\nID: ${lastProject.id}`);
};
