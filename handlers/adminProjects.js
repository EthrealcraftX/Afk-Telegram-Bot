const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');
const config = require('../config/bot.config.json');

const usersPath = path.join(__dirname, '..', 'storage', 'users.json');

// /projectsall — barcha userlar projectlari
module.exports = async (ctx) => {
  const userId = String(ctx.from.id);
  if (userId !== String(config.adminId)) {
    return ctx.reply('❌ Sizda bu amalni bajarish huquqi yo‘q.');
  }

  if (!fs.existsSync(usersPath)) return ctx.reply('❌ Hech qanday project topilmadi.');

  const users = JSON.parse(fs.readFileSync(usersPath));
  const allProjects = [];

  for (const [uid, userData] of Object.entries(users)) {
    if (userData.projects && userData.projects.length) {
      userData.projects.forEach(p => {
        allProjects.push({ ...p, owner: uid });
      });
    }
  }

  if (allProjects.length === 0) {
    return ctx.reply('❗ Hali hech qanday project yaratilmagan.');
  }

  const buttons = allProjects.map(p =>
    [Markup.button.callback(`📁 ${p.id} | 👤 ${p.owner}`, `admin_view_${p.id}`)]
  );

  await ctx.reply(
    `📊 Barcha foydalanuvchi projectlari:`,
    Markup.inlineKeyboard(buttons)
  );
};

// admin_view_{projectId} — bitta project haqida ma'lumot va tugmalar
module.exports.viewProject = async (ctx) => {
  const projectId = ctx.match.input.split('_')[2];
  const userId = String(ctx.from.id);

  if (userId !== String(config.adminId)) {
    return ctx.reply('❌ Ruxsat yo‘q.');
  }

  const users = JSON.parse(fs.readFileSync(usersPath));
  let project = null;
  let owner = null;

  for (const [uid, userData] of Object.entries(users)) {
    const found = userData.projects?.find(p => p.id === projectId);
    if (found) {
      project = found;
      owner = uid;
      break;
    }
  }

  if (!project) return ctx.reply('❌ Project topilmadi.');

  try { await ctx.deleteMessage(); } catch {}

  const info = `
<b>🆔 Project ID:</b> ${project.id}
<b>👤 Foydalanuvchi:</b> ${owner}
<b>📌 Status:</b> ${project.status}
<b>🕒 Yaratilgan:</b> ${project.createdAt ? new Date(project.createdAt).toLocaleString() : 'noma’lum'}
  `.trim();

  await ctx.replyWithHTML(info, Markup.inlineKeyboard([
    [
      Markup.button.callback('▶️ Run', `run_${project.id}`),
      Markup.button.callback('⏹ Stop', `stop_${project.id}`)
    ],
    [
      Markup.button.callback('🗑 Delete', `delete_${project.id}`),
      Markup.button.callback('ℹ️ Stats', `stats_${project.id}`)
    ],
    [
      Markup.button.callback('◀️ Qaytish', 'projectsall_back')
    ]
  ]));
};
