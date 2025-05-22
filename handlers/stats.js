const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const usersPath = path.join(__dirname, '..', 'storage', 'users.json');

module.exports = async (ctx) => {
  if (!fs.existsSync(usersPath)) {
    return ctx.reply('📊 Statistik ma’lumot yo‘q.');
  }

  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  const totalUsers = Object.keys(users).length;

  if (totalUsers === 0) {
    return ctx.reply('📊 Hozircha hech kim project yaratmagan.');
  }

  let msg = `📊 <b>Statistika:</b>\n👤 Foydalanuvchilar: <b>${totalUsers}</b>\n\n`;

  for (const [userId, info] of Object.entries(users)) {
    const time = dayjs(info.createdAt).format('YYYY-MM-DD HH:mm');
    msg += `🆔 <code>${userId}</code>\n  📁 Project ID: <b>${info.projectId}</b>\n  🕒 Yaratilgan: ${time}\n\n`;
  }

  ctx.reply(msg, { parse_mode: 'HTML' });
};