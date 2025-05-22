const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const config = require('../config/bot.config.json');
const usersPath = path.join(__dirname, '..', 'storage', 'users.json');
const projectService = require('./projectService');

function startAutoDeletion(bot) {
  console.log('🕒 [Scheduler] Auto deletion ishga tushdi.');

  setInterval(async () => {
    if (!fs.existsSync(usersPath)) return;

    let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const now = dayjs();
    let changed = false;
    const deleted = [];

    for (const [userId, data] of Object.entries(users)) {
      // 1. Pending holat
      if (data.status === 'pending' && data.createdAt) {
        const createdTime = dayjs(data.createdAt);
        const hoursPassed = now.diff(createdTime, 'hour');

        if (hoursPassed >= config.autoDeleteAfterHours) {
          console.log(`🕓 Auto-delete (pending): ${data.projectId}`);

          await projectService.deleteProject(data.projectId);
          deleted.push({ userId, projectId: data.projectId, type: 'pending' });
          delete users[userId];
          changed = true;
        }
      }

      // 2. Stopped holat
      if (data.status === 'stopped' && data.stoppedAt) {
        const stoppedTime = dayjs(data.stoppedAt);
        const hoursPassed = now.diff(stoppedTime, 'hour');

        if (hoursPassed >= config.autoDeleteAfterHours) {
          console.log(`🕔 Auto-delete (stopped): ${data.projectId}`);

          await projectService.deleteProject(data.projectId);
          deleted.push({ userId, projectId: data.projectId, type: 'stopped' });
          delete users[userId];
          changed = true;
        }
      }
    }

    if (changed) {
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
      console.log('✅ users.json yangilandi.');

      // Adminlarga habar yuborish
      if (bot && config.adminIds?.length) {
        for (const adminId of config.adminIds) {
          let text = `⚠️ Auto-delete trigger bo‘ldi!\n\n`;
          deleted.forEach(entry => {
            text += `👤 User: <code>${entry.userId}</code>\n📁 Project ID: <code>${entry.projectId}</code>\n📌 Holat: ${entry.type}\n\n`;
          });
          try {
            await bot.telegram.sendMessage(adminId, text.trim(), { parse_mode: 'HTML' });
          } catch (e) {
            console.warn(`❌ Admin xabarda xatolik: ${e.message}`);
          }
        }
      }
    }
  }, 60 * 1000); // Har 1 daqiqada
}

module.exports = { startAutoDeletion };
