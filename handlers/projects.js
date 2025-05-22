const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');
const usersPath = path.join(__dirname, '..', 'storage', 'users.json');

// Projectlar ro'yxatini chiqarish
module.exports = async (ctx) => {
  const userId = String(ctx.from.id);

  if (!fs.existsSync(usersPath)) {
    return ctx.reply('❌ Sizda project mavjud emas.');
  }

  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users[userId];

  if (!user || !user.projects || user.projects.length === 0) {
    return ctx.reply('❌ Sizda hali hech qanday project mavjud emas.');
  }

  const buttons = user.projects.map((p, i) =>
    [Markup.button.callback(`📁 Project ${i + 1} (ID: ${p.id})`, `view_${p.id}`)]
  );

  await ctx.reply(
    `📂 Sizda ${user.projects.length} ta project mavjud:\nTanlang va ustida amal bajaring:`,
    Markup.inlineKeyboard(buttons)
  );
};

// Tanlangan projectni ko'rsatish + tugmalar
module.exports.viewProject = async (ctx) => {
  const userId = String(ctx.from.id);
  const projectId = ctx.match.input.split('_')[1];

  const users = JSON.parse(fs.readFileSync(usersPath));
  const user = users[userId];

  if (!user || !user.projects) return ctx.reply('❌ Sizda projectlar mavjud emas.');

  const project = user.projects.find(p => p.id === projectId);
  if (!project) return ctx.reply('❌ Project topilmadi.');

  try {
    await ctx.deleteMessage();
  } catch (e) {
    console.warn('Eski project tanlash xabarini o‘chirishda xatolik:', e.message);
  }

  const info = `
<b>🆔 Project ID:</b> ${project.id}
<b>📌 Status:</b> ${project.status}
<b>🕒 Yaratilgan:</b> ${project.createdAt ? new Date(project.createdAt).toLocaleString() : 'Noma’lum'}
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
      Markup.button.callback('◀️ Qaytish', `back_${userId}`)
    ]
  ]));
};
